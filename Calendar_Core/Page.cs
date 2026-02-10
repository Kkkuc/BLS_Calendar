
namespace Calendar_Core;
using System.Net;
using HtmlAgilityPack;

public partial class Page
{
    private readonly string _url;
    private readonly HttpClient _client;
    private readonly List<MatchData> _allMatches = [];
    private readonly List<MatchData> _unplayedMatches = [];

    public Page(string url)
    {
        _url = url;
        _client = new HttpClient();
        _client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
        GetContent().Wait();
    }

    public void ShowAllMatches()
    {
        foreach (var match in _allMatches)
        {
            Console.WriteLine(match);
        }
    }

    public void ShowUnplayedMatches()
    {
        foreach (var match in _unplayedMatches)
        {
            Console.WriteLine(match);
        }
    }
    

    private async Task GetContent()
    {
        try
        {
            var html = await _client.GetStringAsync(_url);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            var rows = doc.DocumentNode.SelectNodes("//tr[count(td)=6]");
            
            foreach (var cells in rows.Select(row => row.SelectNodes("./td")).Where(cells => cells.Count == 6))
            {
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
                        hostScore = int.Parse(hostScoreHelp);
                        guestScore = int.Parse(guestScoreHelp);
                    }
                    
                    var round = int.Parse(WebUtility.HtmlDecode(cells[3].InnerText).Trim());
                    var court = LimitToSpace(WebUtility.HtmlDecode(cells[4].InnerText).Trim(), 2);

                    // 6. Link do meczu (Indeks 5)
                    //var linkNode = cells[5].SelectSingleNode(".//a");
                    //linkNode.GetAttributeValue("href", "");
                    var matchData = new MatchData
                    (
                        host, 
                        guest, 
                        hostScore, 
                        guestScore, 
                        round, 
                        status,
                        DateTime.Parse(date!), 
                        court
                        );
                    
                    _allMatches.Add(matchData);
                    if (status == string.Empty)
                    {
                        _unplayedMatches.Add(matchData);
                    }
                }
                catch (Exception)
                {
                    // Pomija wiersze, które mimo 6 kolumn mają nietypową strukturę
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
            return (null, null)!;

        var parts = input.Split(separator, 2); // 2 = maksymalnie dwa elementy

        var left = parts.Length > 0 ? parts[0] : string.Empty;
        var right = parts.Length > 1 ? parts[1] : string.Empty;

        return (left, right);
    }

    private static string LimitToSpace(string input, int numberOfSpaces)
    {
        var parts = input.Split(' ', StringSplitOptions.RemoveEmptyEntries);

        return parts.Length >= numberOfSpaces ? 
            string.Join(" ", parts.Take(numberOfSpaces)) : 
            input; 
    }


    [System.Text.RegularExpressions.GeneratedRegex("<.*?>")]
    private static partial System.Text.RegularExpressions.Regex MyRegex();
}