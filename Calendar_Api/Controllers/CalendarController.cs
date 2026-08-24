using Calendar_Api.DTOs;
using Calendar_Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Calendar_Api.Controllers;

[ApiController]
[Route("api/calendar")]
public class CalendarController(IGoogleCalendarService calendarService) : ControllerBase
{
    [HttpPost("export")]
    public async Task<ActionResult<ExportResponseDto>> ExportMatches([FromBody] ExportMatchesRequestDto? request)
    {
        if (!Request.Headers.TryGetValue("Authorization", out var authHeader) || string.IsNullOrWhiteSpace(authHeader))
        {
            return BadRequest(new { message = "Brak nagłówka Authorization." });
        }

        var token = authHeader.ToString().Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase).Trim();
        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized(new { message = "Nieprawidłowy token dostępowy." });
        }

        if (request?.Matches == null || request.Matches.Count == 0)
        {
            return BadRequest(new { message = "Brak meczów do wyeksportowania." });
        }

        var result = await calendarService.ExportMatchesAsync(token, request.Matches);
        return Ok(result);
    }
}