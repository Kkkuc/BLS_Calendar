using Calendar_Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Primitives;

namespace Calendar_Api;

public class TeamEndpoints
{
    // 1. GET /api/teams
    [Function("GetTeams")]
    public async Task<IActionResult> GetTeams(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "teams")] HttpRequest req)
    {
        var teams = await Page.FetchAllTeamsAsync();
        return new OkObjectResult(teams);
    }

    // 2. GET /api/teams/{id}/matches
    [Function("GetMatches")]
    public async Task<IActionResult> GetMatches(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "teams/{id:int}/matches")] HttpRequest req,
        int id)
    {
        var url = $"https://blssiatkowka.ligspace.pl/index.php?mod=Teams&ac=TeamSchedule&t_id={id}";
        var page = await Page.CreateAsync(url);
        
        return new OkObjectResult(page.UnplayedMatches);
    }

    // 3. POST /api/export
    [Function("ExportMatches")]
    [Obsolete("Obsolete")]
    public async Task<IActionResult> ExportMatches(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "export")] HttpRequest req)
    {
        // Obsługa typu StringValues z nagłówka HTTP
        if (!req.Headers.TryGetValue("Authorization", out StringValues headerValue))
        {
            return new UnauthorizedResult();
        }

        string accessToken = headerValue.ToString().Replace("Bearer ", "").Trim();
        if (string.IsNullOrEmpty(accessToken))
        {
            return new UnauthorizedResult();
        }

        var requestData = await req.ReadFromJsonAsync<ExportRequest>();
        if (requestData?.Matches == null)
        {
            return new BadRequestObjectResult("Brak danych meczów.");
        }

        var calendarHelper = new GoogleCalendarHelper();
        int addedCount = 0;

        foreach (var match in requestData.Matches)
        {
            // Wywołanie instancyjne metody AddEventAsync
            var success = await calendarHelper.AddEventAsync(
                accessToken: accessToken,
                startDate: match.MatchDate,
                title: $"{match.Host} vs {match.Guest}",
                description: match.GenerateDescription(),
                eventId: match.GenerateEventId()
            );

            if (success)
            {
                addedCount++;
            }
        }

        return new OkObjectResult(new { Message = $"Pomyślnie dodano {addedCount} meczów do kalendarza." });
    }
}

public record ExportRequest(List<MatchData> Matches);