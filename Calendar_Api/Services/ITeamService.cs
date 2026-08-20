using Calendar_Api.DTOs;

namespace Calendar_Api.Services;

public interface ITeamService
{
    Task<List<TeamDto>> GetTeamsAsync();
    Task<List<MatchDto>> GetUnplayedMatchesAsync(int teamId);
    Task<int> ExportMatchesToGoogleCalendarAsync(string accessToken, List<MatchDto> matches);
}