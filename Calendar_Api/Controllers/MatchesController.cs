using Calendar_Core;
using Microsoft.AspNetCore.Mvc;

namespace Calendar_Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MatchesController : ControllerBase
{
    // GET /api/matches/unplayed/{teamId}
    [HttpGet("unplayed/{teamId:int}")]
    public async Task<IActionResult> GetUnplayedMatches(int teamId)
    {
        var url = $"https://blssiatkowka.ligspace.pl/index.php?mod=Teams&ac=TeamSchedule&t_id={teamId}";
        
        // Posiłkujemy się logiką z Core
        var page = await Page.CreateAsync(url);
        
        // Zwracamy bezpośrednio listę nierozegranych meczów
        return Ok(page.UnplayedMatches);
    }
}