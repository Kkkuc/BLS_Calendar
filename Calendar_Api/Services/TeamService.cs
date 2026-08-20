using Calendar_Api.DTOs;
using Calendar_Core;

namespace Calendar_Api.Services;

public class TeamService : ITeamService
{
    public async Task<List<TeamDto>> GetTeamsAsync()
    {
        var teams = await Page.FetchAllTeamsAsync();

        return teams.Select(t => new TeamDto
        {
            Id = t.Id,
            Name = t.Name,
            Url = t.Url,
            League = t.League
        }).ToList();
    }

    public async Task<List<MatchDto>> GetUnplayedMatchesAsync(int teamId)
    {
        var url = $"https://blssiatkowka.ligspace.pl/index.php?mod=Teams&ac=TeamSchedule&t_id={teamId}";
        var page = await Page.CreateAsync(url);

        return page.UnplayedMatches.Select(m => new MatchDto
        {
            Host = m.Host,
            Guest = m.Guest,
            HostSetsResult = m.HostSetsResult,
            GuestSetsResult = m.GuestSetsResult,
            Round = m.Round,
            Status = m.Status,
            MatchDate = m.MatchDate,
            Court = m.GenerateDescription()
        }).ToList();
    }

    public async Task<int> ExportMatchesToGoogleCalendarAsync(string accessToken, List<MatchDto> matches)
    {
        var calendarHelper = new GoogleCalendarHelper();
        int addedCount = 0;

        foreach (var matchDto in matches)
        {
            var matchData = new MatchData(
                matchDto.Host,
                matchDto.Guest,
                matchDto.HostSetsResult,
                matchDto.GuestSetsResult,
                matchDto.Round,
                matchDto.Status,
                matchDto.MatchDate,
                matchDto.Court
            );

            var success = await calendarHelper.AddEventAsync(
                accessToken: accessToken,
                startDate: matchData.MatchDate,
                title: $"{matchData.Host} vs {matchData.Guest}",
                description: matchData.GenerateDescription(),
                eventId: matchData.GenerateEventId()
            );

            if (success)
            {
                addedCount++;
            }
        }

        return addedCount;
    }
}