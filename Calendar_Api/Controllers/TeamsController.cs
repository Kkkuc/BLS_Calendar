using Calendar_Api.DTOs;
using Calendar_Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Calendar_Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController(ITeamService teamService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<TeamDto>>> GetTeams()
    {
        var teams = await teamService.GetTeamsAsync();
        return Ok(teams);
    }

    [HttpGet("{id:int}/matches")]
    public async Task<ActionResult<List<MatchDto>>> GetMatches(int id)
    {
        var matches = await teamService.GetUnplayedMatchesAsync(id);
        return Ok(matches);
    }

    [HttpPost("export")]
    public async Task<ActionResult<ExportResponseDto>> ExportMatches([FromBody] ExportMatchesRequestDto request)
    {
        if (!Request.Headers.TryGetValue("Authorization", out var authHeader) || string.IsNullOrWhiteSpace(authHeader))
        {
            return BadRequest(new { message = "Brak nagłówka Authorization." });
        }

        var accessToken = authHeader.ToString().Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase).Trim();
        if (string.IsNullOrEmpty(accessToken))
        {
            return Unauthorized(new { message = "Nieprawidłowy token dostępowy." });
        }

        if (request.Matches.Count == 0)
        {
            return BadRequest(new { message = "Brak meczów do wyeksportowania." });
        }

        var result = await teamService.ExportMatchesToGoogleCalendarAsync(accessToken, request.Matches);
        return Ok(result);
    }
}