using System.Net;
using Google;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Services;

namespace Calendar_Api.Services;

public class GoogleCalendarService : IGoogleCalendarService
{
    private const string ApplicationName = "BLS Calendar Integrator";

    public async Task<bool> AddEventAsync(
        string accessToken,
        DateTime startDate,
        string title,
        string? description,
        string eventId,
        DateTime? endDate = null)
    {
        endDate ??= startDate.AddHours(2);
        var credential = GoogleCredential.FromAccessToken(accessToken);

        using var service = new CalendarService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = ApplicationName,
        });

        var newEvent = new Event
        {
            Id = eventId,
            Summary = title,
            Description = description,
            Start = new EventDateTime { DateTime = startDate, TimeZone = "Europe/Warsaw" },
            End = new EventDateTime { DateTime = endDate, TimeZone = "Europe/Warsaw" }
        };

        try
        {
            await service.Events.Insert(newEvent, "primary").ExecuteAsync();
            return true;
        }
        catch (GoogleApiException ex) when (ex.HttpStatusCode == HttpStatusCode.Conflict)
        {
            return false; // Duplikat wydarzenia
        }
    }
}