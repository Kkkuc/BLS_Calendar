using Calendar_Api.DTOs;
using Calendar_Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Calendar_Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController(ITeamService teamService) : ControllerBase
{
    // GET /api/teams
    [HttpGet]
    public async Task<ActionResult<List<TeamDto>>> GetTeams()
    {
        var teams = await teamService.GetTeamsAsync();
        return Ok(teams);
    }

    // GET /api/teams/{id}/matches
    [HttpGet("{id:int}/matches")]
    public async Task<ActionResult<List<MatchDto>>> GetMatches(int id)
    {
        var matches = await teamService.GetUnplayedMatchesAsync(id);
        return Ok(matches);
    }

    // POST /api/teams/export
    [HttpPost("export")]
    public async Task<IActionResult> ExportMatches([FromBody] ExportMatchesRequestDto request)
    {
        if (!Request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            return Unauthorized("Brak nagłówka Authorization.");
        }

        var accessToken = authHeader.ToString().Replace("Bearer ", "").Trim();
        if (string.IsNullOrEmpty(accessToken))
        {
            return Unauthorized("Nieprawidłowy token dostępowy.");
        }

        if (request.Matches.Count == 0)
        {
            return BadRequest("Brak meczów do wyeksportowania.");
        }

        var exportedCount = await teamService.ExportMatchesToGoogleCalendarAsync(accessToken, request.Matches);
        return Ok(new { Message = $"Pomyślnie dodano {exportedCount} meczów do kalendarza." });
    }
}