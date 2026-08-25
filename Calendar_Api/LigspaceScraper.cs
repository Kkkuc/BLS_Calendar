using System.Net;
using System.Text.RegularExpressions;
using System.Web;
using Calendar_Api.DTOs;
using HtmlAgilityPack;

namespace Calendar_Api;

public partial class LigspaceScraper(HttpClient httpClient)
{
    private const string BaseUrl = "https://blssiatkowka.ligspace.pl/index.php";
    private const string Domain = "https://blssiatkowka.ligspace.pl";

    private static readonly string[] InvalidNames =
    [
        "Błąd",
        "Najnowsze wiadomości",
        "Wiadomości",
        "Szanowni użytkownicy",
        "Strona główna"
    ];

    private static readonly string[] InvalidImageKeywords = ["logo_BLS", "banner", "blank.gif", "blank"];

    public async Task<List<MatchDto>> GetTeamMatchesAsync(int teamId)
    {
        var url = $"{BaseUrl}?mod=Teams&ac=TeamSchedule&t_id={teamId}";
        var html = await httpClient.GetStringAsync(url);

        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        var rows = doc.DocumentNode.SelectNodes("//tr[count(td)=6]");
        var matches = new List<MatchDto>();

        if (rows == null) return matches;

        foreach (var row in rows)
        {
            var cells = row.SelectNodes("./td");
            if (cells == null || cells.Count != 6) continue;

            try
            {
                var (host, guest) = SplitPair(CleanText(cells[0].InnerText));
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

                if (!DateTime.TryParse(dateStr, null, System.Globalization.DateTimeStyles.AssumeLocal, out var parsedDate)) continue;

                matches.Add(new MatchDto(host, guest, hostScore, guestScore, round, status, parsedDate, court));
            }
            catch
            {
                // Ignoruj błędnie sformatowane wiersze
            }
        }

        return matches;
    }

    public async Task<List<TeamDto>> FetchAllTeamsAsync(int maxId = 60)
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
                    InvalidNames.Any(invalid => cleanName.Contains(invalid, StringComparison.OrdinalIgnoreCase)))
                {
                    return null;
                }

                var imgNode = doc.DocumentNode.SelectSingleNode(
                    "//div[@id='main']//img[contains(@src, 'user_files') or contains(@src, 'teams') or contains(@src, 'upload')]"
                ) ?? doc.DocumentNode.SelectSingleNode("//div[@id='main']//img");

                string? logoUrl = null;
                if (imgNode != null)
                {
                    var src = imgNode.GetAttributeValue("src", string.Empty);
                    if (!string.IsNullOrWhiteSpace(src) &&
                        !InvalidImageKeywords.Any(keyword => src.Contains(keyword, StringComparison.OrdinalIgnoreCase)))
                    {
                        logoUrl = src.StartsWith("http", StringComparison.OrdinalIgnoreCase)
                            ? src
                            : src.StartsWith('/')
                                ? $"{Domain}{src}"
                                : $"{Domain}/{src}";
                    }
                }

                return new TeamDto(id, cleanName, profileUrl, logoUrl);
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

        return parts.Length switch
        {
            1 => (null, parts[0].Trim()),
            >= 2 => (parts[0].Trim(), parts[1].Trim()),
            _ => (null, null)
        };
    }

    private static string LimitToWords(string input, int count) =>
        string.Join(" ", input.Split(' ', StringSplitOptions.RemoveEmptyEntries).Take(count));

    [GeneratedRegex("<.*?>")]
    private static partial Regex HtmlTagRegex();
}