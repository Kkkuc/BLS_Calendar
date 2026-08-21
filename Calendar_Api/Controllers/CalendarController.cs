using System.Security.Cryptography;
using System.Text;
using Calendar_Api.DTOs;
using Calendar_Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Calendar_Api.Controllers;

[ApiController]
[Route("api/calendar")]
public class CalendarController(IGoogleCalendarService calendarService) : ControllerBase
{
    [HttpPost("export")]
    public async Task<IActionResult> ExportMatches([FromBody] ExportMatchesRequestDto? request)
    {
        if (!Request.Headers.TryGetValue("Authorization", out var authHeader) || 
            string.IsNullOrWhiteSpace(authHeader))
        {
            return BadRequest(new { message = "Brak nagłówka Authorization." });
        }

        var token = authHeader.ToString().Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase).Trim();

        if (request?.Matches == null || request.Matches.Count == 0)
        {
            return BadRequest(new { message = "Brak meczów do wyeksportowania." });
        }

        int addedCount = 0;
        int skippedCount = 0;
        var detailsList = new List<MatchExportResultDetailsDto>();

        foreach (var match in request.Matches)
        {
            string host = match.Host;
            string guest = match.Guest;
            
            var matchLabel = $"{host} vs {guest}";
            var title = $"BLS Match: {matchLabel}";
            var description = "No description";
            
            if (!string.IsNullOrWhiteSpace(match.Court))
            {
                description = match.Court;
            }

            var rawKey = $"bls_{host}_{guest}_{match.MatchDate:yyyyMMddHHmm}".ToLowerInvariant();
            var eventId = GenerateValidGoogleEventId(rawKey);

            var added = await calendarService.AddEventAsync(
                accessToken: token,
                startDate: match.MatchDate,
                title: title,
                description: description,
                eventId: eventId
            );

            if (added)
            {
                addedCount++;
                detailsList.Add(new MatchExportResultDetailsDto(
                    Match: matchLabel,
                    Status: "ADDED",
                    Message: "Pomyślnie dodano do kalendarza."
                ));
            }
            else
            {
                skippedCount++;
                detailsList.Add(new MatchExportResultDetailsDto(
                    Match: matchLabel,
                    Status: "SKIPPED",
                    Message: "Mecz już istnieje w kalendarzu."
                ));
            }
        }

        return Ok(new ExportResponseDto(
            Summary: new ExportSummaryDto(addedCount, skippedCount),
            Details: detailsList
        ));
    }

    private static string GenerateValidGoogleEventId(string input)
    {
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
        var hex = Convert.ToHexString(hashBytes).ToLowerInvariant();
        
        return "bls" + hex[..32]; 
    }
}