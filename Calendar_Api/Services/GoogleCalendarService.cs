using Calendar_Api.DTOs;
using Calendar_Api.Models;
using Google;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Services;

namespace Calendar_Api.Services;

public class GoogleCalendarService : IGoogleCalendarService
{
    private const string ApplicationName = "BLS Calendar Integrator";

    [Obsolete("Obsolete")]
    public async Task<ExportResponseDto> ExportMatchesAsync(string accessToken, List<MatchDto> matches)
    {
        var addedCount = 0;
        var details = new List<MatchExportResultDetailsDto>();

        foreach (var dto in matches)
        {
            var matchData = new MatchData(
                dto.Host, dto.Guest, dto.HostSetsResult, 
                dto.GuestSetsResult, dto.Round, dto.Status, 
                dto.MatchDate, dto.Court
            );

            var matchLabel = $"{matchData.Host} vs {matchData.Guest}";
            var title = $"BLS Match: {matchLabel}";
            
            var description = "Brak informacji o boisku";
            if (!string.IsNullOrWhiteSpace(matchData.Court))
            {
                description = $"Boisko: {matchData.Court}";
            }

            var added = await AddEventAsync(
                accessToken: accessToken,
                startDate: matchData.MatchDate,
                title: title,
                description: description
            );

            if (!added)
            {
                continue;
            }
            
            addedCount++;
            details.Add(new MatchExportResultDetailsDto(matchLabel, "ADDED", "Pomyślnie dodano do kalendarza."));
        }

        return new ExportResponseDto(new ExportSummaryDto(addedCount), details);
    }

    [Obsolete("Obsolete")]
    public async Task<bool> AddEventAsync(
        string accessToken,
        DateTime startDate,
        string title,
        string? description,
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
        catch (GoogleApiException ex)
        {
            Console.WriteLine($"[Google Calendar Error]: {ex.HttpStatusCode} - {ex.Message}");
            throw;
        }
    }
}