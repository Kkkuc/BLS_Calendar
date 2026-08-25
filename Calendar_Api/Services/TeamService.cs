using Calendar_Api.DTOs;

namespace Calendar_Api.Services;

public class TeamService(LigspaceScraper scraper) : ITeamService
{
    public async Task<List<TeamDto>> GetTeamsAsync()
    {
        return await scraper.FetchAllTeamsAsync();
    }
    
    public async Task<List<MatchDto>> GetMatchesAsync(int teamId)
    {
        return await scraper.GetTeamMatchesAsync(teamId);
    }
    
    /*public async Task<List<MatchDto>> GetUnplayedMatchesAsync(int teamId)
{
    var matches = await scraper.GetTeamMatchesAsync(teamId);

    return matches
        .Where(m => m.IsUnplayed)
        .Select(m => new MatchDto(m.Host, m.Guest, m.HostSetsResult, m.GuestSetsResult, m.Round, m.Status, m.MatchDate, m.Court))
        .ToList();
}*/
}