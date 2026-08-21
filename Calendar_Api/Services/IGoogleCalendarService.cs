namespace Calendar_Api.Services;

public interface IGoogleCalendarService
{
    Task<bool> AddEventAsync(string accessToken, DateTime startDate, string title, string? description, string eventId, DateTime? endDate = null);
}