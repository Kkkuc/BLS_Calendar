using Calendar_Api.DTOs;

namespace Calendar_Api.Services;

public interface IGoogleCalendarService
{
    Task<ExportResponseDto> ExportMatchesAsync(string accessToken, List<MatchDto> matches);
}