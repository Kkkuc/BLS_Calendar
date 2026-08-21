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

    public async Task<ExportResponseDto> ExportMatchesToGoogleCalendarAsync(string accessToken, List<MatchDto> matches)
    {
        int addedCount = 0;
        int skippedCount = 0;
        var details = new List<MatchExportResultDetailsDto>();

        foreach (var dto in matches)
        {
            var matchData = new MatchData(dto.Host, dto.Guest, dto.HostSetsResult, dto.GuestSetsResult, dto.Round, dto.Status, dto.MatchDate, dto.Court);

            var matchLabel = $"{matchData.Host} vs {matchData.Guest}";
            var title = $"BLS Match: {matchLabel}";
            var description = $"Mecz pomiędzy {matchData.Host} a {matchData.Guest}";
            
            if (!string.IsNullOrWhiteSpace(matchData.Court))
            {
                description += $"\nSektor/Boisko: {matchData.Court}";
            }

            var eventId = matchData.GenerateGoogleEventId();

            var added = await calendarService.AddEventAsync(
                accessToken: accessToken,
                startDate: matchData.MatchDate,
                title: title,
                description: description,
                eventId: eventId
            );

            if (added)
            {
                addedCount++;
                details.Add(new MatchExportResultDetailsDto(matchLabel, "ADDED", "Pomyślnie dodano do kalendarza."));
            }
            else
            {
                skippedCount++;
                details.Add(new MatchExportResultDetailsDto(matchLabel, "SKIPPED", "Mecz już istnieje w kalendarzu."));
            }
        }

        return new ExportResponseDto(new ExportSummaryDto(addedCount, skippedCount), details);
    }
}