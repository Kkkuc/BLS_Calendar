using System.Net;
using System.Text.RegularExpressions;
using System.Web;
using Calendar_Core.Models;
using HtmlAgilityPack;

namespace Calendar_Core;

public partial class Page
{
    private static readonly HttpClient Client = new()
    {
        DefaultRequestHeaders = { { "User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }
    };

    private readonly string _url;
    private readonly List<MatchData> _allMatches = [];
    private readonly List<MatchData> _unplayedMatches = [];
    
    public List<MatchData> AllMatches => _allMatches;
    public List<MatchData> UnplayedMatches => _unplayedMatches;

    private Page(string url)
    {
        _url = url;
    }

    public static async Task<Page> CreateAsync(string url)
    {
        var page = new Page(url);
        await page.GetContentAsync();
        return page;
    }

    private async Task GetContentAsync()
    {
        try
        {
            var html = await Client.GetStringAsync(_url);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            var rows = doc.DocumentNode.SelectNodes("//tr[count(td)=6]");

            foreach (var row in rows)
            {
                var cells = row.SelectNodes("./td");
                if (cells.Count != 6) continue;

                try
                {
                    var pairs = WebUtility.HtmlDecode(cells[0].InnerText).Trim();
                    pairs = string.Concat(pairs.Where(c => !char.IsWhiteSpace(c)));
                    var (host, guest) = SplitByColon(pairs, ':');
                    
                    var status = WebUtility.HtmlDecode(cells[1].InnerText).Trim();
                    
                    var resultIDataRaw = WebUtility.HtmlDecode(cells[2].InnerHtml)
                        .Replace("<br>", "|")
                        .Replace("<br/>", "|");
                    resultIDataRaw = MyRegex().Replace(resultIDataRaw, "").Trim();
                    var parts = resultIDataRaw.Split('|');
                    var result = parts[0].Trim();
                    var date = parts.Length > 1 ? parts[1].Trim() : null;
                    
                    if (parts.Length == 1)
                    {
                        result = null;
                        date = parts[0].Trim();
                    }

                    var hostScore = 0;
                    var guestScore = 0;
                    if (result != null)
                    {
                        result = string.Concat(result.Where(c => !char.IsWhiteSpace(c)));
                        var (hostScoreHelp, guestScoreHelp) = SplitByColon(result, '-');
                        _ = int.TryParse(hostScoreHelp, out hostScore);
                        _ = int.TryParse(guestScoreHelp, out guestScore);
                    }
                    
                    _ = int.TryParse(WebUtility.HtmlDecode(cells[3].InnerText).Trim(), out var round);
                    var court = LimitToSpace(WebUtility.HtmlDecode(cells[4].InnerText).Trim(), 2);

                    if (!DateTime.TryParse(date, out var parsedDate)) continue;

                    var matchData = new MatchData
                    (
                        host, 
                        guest, 
                        hostScore, 
                        guestScore, 
                        round, 
                        status,
                        parsedDate, 
                        court
                    );
                    
                    _allMatches.Add(matchData);
                    if (string.IsNullOrEmpty(status))
                    {
                        _unplayedMatches.Add(matchData);
                    }
                }
                catch
                {
                    // Pomija wiersze o nietypowej strukturze
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Błąd podczas pobierania danych: {ex.Message}");
        }
    }
    
    private static (string Left, string Right) SplitByColon(string? input, char separator)
    {
        if (string.IsNullOrEmpty(input))
            return (string.Empty, string.Empty);

        var parts = input.Split(separator, 2);
        return (parts.Length > 0 ? parts[0] : string.Empty, parts.Length > 1 ? parts[1] : string.Empty);
    }

    private static string LimitToSpace(string input, int numberOfSpaces)
    {
        var parts = input.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return parts.Length >= numberOfSpaces ? string.Join(" ", parts.Take(numberOfSpaces)) : input; 
    }

    public static async Task<List<Team>> FetchAllTeamsAsync(int maxId = 60)
    {
        const string baseUrl = "https://blssiatkowka.ligspace.pl/index.php";

        var tasks = Enumerable.Range(1, maxId).Select(async id =>
        {
            var profileUrl = $"{baseUrl}?mod=Teams&ac=TeamSchedule&t_id={id}";
            try
            {
                var html = await Client.GetStringAsync(profileUrl);
                var doc = new HtmlDocument();
                doc.LoadHtml(html);
            
                var nameNode = doc.DocumentNode.SelectSingleNode("//div[@id='main']//h2");
                if (nameNode == null) return null;

                var cleanName = HttpUtility.HtmlDecode(nameNode.InnerText).Trim();

                if (string.IsNullOrWhiteSpace(cleanName) || 
                    cleanName.Equals("Błąd", StringComparison.OrdinalIgnoreCase) ||
                    cleanName.Equals("Najnowsze wiadomości", StringComparison.OrdinalIgnoreCase) || 
                    cleanName.Contains("Szanowni użytkownicy", StringComparison.OrdinalIgnoreCase))
                {
                    return null;
                }

                // Tworzenie rekordu za pomocą Primary Constructora
                return new Team(id, cleanName, profileUrl);
            }
            catch
            {
                return null;
            }
        });

        var results = await Task.WhenAll(tasks);
        return results.Where(t => t != null).OrderBy(t => t!.Name).ToList()!;
    }

    [GeneratedRegex("<.*?>")]
    private static partial Regex MyRegex();
}