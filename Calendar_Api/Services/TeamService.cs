using Calendar_Api.DTOs;
using Calendar_Core;
using Calendar_Core.Models;
using Calendar_Core.Services;

namespace Calendar_Api.Services;

public class TeamService(LigspaceScraper scraper, IGoogleCalendarService calendarService) : ITeamService
{
    public async Task<List<TeamDto>> GetTeamsAsync()
    {
        var teams = await scraper.FetchAllTeamsAsync();
        return teams.Select(t => new TeamDto(t.Id, t.Name, t.Url, t.League)).ToList();
    }

    public async Task<List<MatchDto>> GetUnplayedMatchesAsync(int teamId)
    {
        var matches = await scraper.GetTeamMatchesAsync(teamId);
        
        return matches
            .Where(m => m.IsUnplayed)
            .Select(m => new MatchDto(m.Host, m.Guest, m.HostSetsResult, m.GuestSetsResult, m.Round, m.Status, m.MatchDate, m.Court))
            .ToList();
    }
}