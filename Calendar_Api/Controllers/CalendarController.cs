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

        var results = new List<string>();

        foreach (var match in request.Matches)
        {
            var title = $"BLS Match: {match.Host} vs {match.Guest}";
            var description = $"Mecz pomiędzy {match.Host} a {match.Guest}";
            if (!string.IsNullOrWhiteSpace(match.Court))
            {
                description += $"\nSektor/Boisko: {match.Court}";
            }

            // Unikalny ciąg znaków dla meczu
            var rawKey = $"bls_{match.Host}_{match.Guest}_{match.MatchDate:yyyyMMddHHmm}".ToLower();

            // Bezpieczny generator Event ID spełniający wymogi Google (tylko a-v oraz 0-9)
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
                results.Add($"[DODANO] {title}");
            }
            else
            {
                results.Add($"[POMINIĘTO - JUŻ JEST] {title}");
            }
        }

        return Ok(new { Summary = results });
    }

    /// <summary>
    /// Generuje poprawny Google Calendar Event ID (zakres znaków 0-9, a-v, dł. 5-1024)
    /// </summary>
    private static string GenerateValidGoogleEventId(string input)
    {
        using var md5 = MD5.Create();
        var hashBytes = md5.ComputeHash(Encoding.UTF8.GetBytes(input));
        
        // Konwersja bajtów na ciąg cyfr i liter z zakresu a-v
        var sb = new StringBuilder();
        foreach (var b in hashBytes)
        {
            // Mapujemy bajt (0-255) na 32 znaki base32 (0-9, a-v)
            int val = b % 32;
            char c = val < 10 ? (char)('0' + val) : (char)('a' + (val - 10));
            sb.Append(c);
        }

        return "bls" + sb.ToString(); // np. "bls0123456789abcdefghijklmnopqrstuv"
    }
}