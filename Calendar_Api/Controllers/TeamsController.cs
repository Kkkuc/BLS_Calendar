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
        var matches = await teamService.GetMatchesAsync(id);
        return Ok(matches);
    }
}