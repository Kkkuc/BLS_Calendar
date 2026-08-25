using Calendar_Api.DTOs;
using Calendar_Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace Calendar_Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController(ITeamService teamService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<TeamDto>>> GetTeams(IMemoryCache cache)
    {
        var teams = await cache.GetOrCreateAsync("teams_cache_key", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30);
            return await teamService.GetTeamsAsync();
        });
        return Ok(teams);
    }

    [HttpGet("{id:int}/matches")]
    public async Task<ActionResult<List<MatchDto>>> GetMatches(int id)
    {
        var matches = await teamService.GetMatchesAsync(id);
        return Ok(matches);
    }
}