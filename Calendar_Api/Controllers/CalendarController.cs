using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Calendar_Api.DTOs;
using Calendar_Core;
using Microsoft.AspNetCore.Mvc;

namespace Calendar_Api.Controllers;

[ApiController]
[Route("api/calendar")]
public class CalendarController(GoogleCalendarHelper calendarHelper) : ControllerBase
{
    [HttpPost("export")]
public async Task<IActionResult> ExportMatches([FromBody] ExportRequestDto request)
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
    var detailsList = new List<object>();

    foreach (var match in request.Matches)
    {
        var matchLabel = $"{match.Host} vs {match.Guest}";
        var title = $"BLS Match: {matchLabel}";
        var description = $"Mecz pomiędzy {match.Host} a {match.Guest}";
        if (!string.IsNullOrWhiteSpace(match.Court))
        {
            description += $"\nSektor/Boisko: {match.Court}";
        }

        var rawKey = $"bls_{match.Host}_{match.Guest}_{match.MatchDate:yyyyMMddHHmm}".ToLower();
        var eventId = GenerateValidGoogleEventId(rawKey);

        var added = await calendarHelper.AddEventAsync(
            accessToken: token,
            startDate: match.MatchDate,
            title: title,
            description: description,
            eventId: eventId
        );

        if (added)
        {
            addedCount++;
            detailsList.Add(new {
                match = matchLabel,
                status = "ADDED",
                message = "Pomyślnie dodano do kalendarza."
            });
        }
        else
        {
            skippedCount++;
            detailsList.Add(new {
                match = matchLabel,
                status = "SKIPPED",
                message = "Mecz już istnieje w kalendarzu."
            });
        }
    }

    // Zwracamy dokładnie taką strukturę, jakiej wymaga React
    return Ok(new 
    { 
        summary = new 
        { 
            added = addedCount, 
            skipped = skippedCount 
        }, 
        details = detailsList 
    });
}

    /// <summary>
    /// Generuje poprawny Google Calendar Event ID (zakres znaków 0-9, a-v, dł. 5-1024)
    /// </summary>
    private static string GenerateValidGoogleEventId(string input)
    {
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
    
        // Convert.ToHexString zwraca cyfry 0-9 i litery A-F.
        // Zmieniamy na małe litery (a-f), które zawierają się w dozwolonym zakresie (a-v).
        var hex = Convert.ToHexString(hashBytes).ToLowerInvariant();
    
        // Przycinamy do 32 znaków, aby ID było zwarte (wymaganie Google: 5 - 1024 znaki)
        return "bls" + hex[..32]; 
    }
}