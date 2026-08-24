using Calendar_Api.DTOs;

namespace Calendar_Api.Services;

public interface IGoogleCalendarService
{
    Task<bool> AddEventAsync(
        string accessToken,
        DateTime startDate,
        string title,
        string? description,
        DateTime? endDate = null);

    Task<ExportResponseDto> ExportMatchesAsync(string accessToken, List<MatchDto> matches);
}