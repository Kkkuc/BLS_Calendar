using System.Net;
using System.Text.RegularExpressions;
using System.Web;
using Calendar_Core.Models;
using HtmlAgilityPack;

namespace Calendar_Core.Services;

public partial class LigspaceScraper(HttpClient httpClient)
{
    private const string BaseUrl = "https://blssiatkowka.ligspace.pl/index.php";

    public async Task<List<MatchData>> GetTeamMatchesAsync(int teamId)
    {
        var url = $"{BaseUrl}?mod=Teams&ac=TeamSchedule&t_id={teamId}";
        var html = await httpClient.GetStringAsync(url);
        
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        var rows = doc.DocumentNode.SelectNodes("//tr[count(td)=6]");
        if (rows == null) return [];

        var matches = new List<MatchData>();

        foreach (var row in rows)
        {
            var cells = row.SelectNodes("./td");
            if (cells == null || cells.Count != 6) continue;

            try
            {
                var pairs = CleanText(cells[0].InnerText);
                var (host, guest) = SplitPair(pairs);
                
                var status = CleanText(cells[1].InnerText);
                var (result, dateStr) = ParseResultAndDate(cells[2].InnerHtml);

                var hostScore = 0;
                var guestScore = 0;
                if (!string.IsNullOrEmpty(result))
                {
                    var (h, g) = SplitPair(result, '-');
                    int.TryParse(h, out hostScore);
                    int.TryParse(g, out guestScore);
                }

                int.TryParse(CleanText(cells[3].InnerText), out var round);
                var court = LimitToWords(CleanText(cells[4].InnerText), 2);

                if (!DateTime.TryParse(dateStr, out var parsedDate)) continue;

                matches.Add(new MatchData(host, guest, hostScore, guestScore, round, status, parsedDate, court));
            }
            catch
            {
                // Ignoruj błędnie sformatowane wiersze
            }
        }

        return matches;
    }

    public async Task<List<Team>> FetchAllTeamsAsync(int maxId = 60)
    {
        var tasks = Enumerable.Range(1, maxId).Select(async id =>
        {
            var profileUrl = $"{BaseUrl}?mod=Teams&ac=TeamSchedule&t_id={id}";
            try
            {
                var html = await httpClient.GetStringAsync(profileUrl);
                var doc = new HtmlDocument();
                doc.LoadHtml(html);

                var nameNode = doc.DocumentNode.SelectSingleNode("//div[@id='main']//h2");
                if (nameNode == null) return null;

                var cleanName = HttpUtility.HtmlDecode(nameNode.InnerText).Trim();

                if (string.IsNullOrWhiteSpace(cleanName) || 
                    cleanName.Equals("Błąd", StringComparison.OrdinalIgnoreCase) ||
                    cleanName.Contains("Szanowni użytkownicy", StringComparison.OrdinalIgnoreCase))
                {
                    return null;
                }

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

    private static string CleanText(string input) => WebUtility.HtmlDecode(input).Trim();

    private static (string Left, string Right) SplitPair(string input, char separator = ':')
    {
        var clean = string.Concat(input.Where(c => !char.IsWhiteSpace(c)));
        var parts = clean.Split(separator, 2);
        return (parts.Length > 0 ? parts[0] : "", parts.Length > 1 ? parts[1] : "");
    }

    private static (string? Result, string? Date) ParseResultAndDate(string rawHtml)
    {
        var decoded = WebUtility.HtmlDecode(rawHtml)
            .Replace("<br>", "|")
            .Replace("<br/>", "|");
        
        var clean = HtmlTagRegex().Replace(decoded, "").Trim();
        var parts = clean.Split('|', StringSplitOptions.RemoveEmptyEntries);

        if (parts.Length == 1) return (null, parts[0].Trim());
        if (parts.Length >= 2) return (parts[0].Trim(), parts[1].Trim());

        return (null, null);
    }

    private static string LimitToWords(string input, int count) =>
        string.Join(" ", input.Split(' ', StringSplitOptions.RemoveEmptyEntries).Take(count));

    [GeneratedRegex("<.*?>")]
    private static partial Regex HtmlTagRegex();
}