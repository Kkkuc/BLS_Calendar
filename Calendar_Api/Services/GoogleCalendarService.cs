using Calendar_Api.DTOs;
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
        var details = new List<MatchResultDto>();

        foreach (var match in matches)
        {
            var matchLabel = $"{match.Host} vs {match.Guest}";
            var title = $"BLS Match: {matchLabel}";
            
            var description = string.IsNullOrWhiteSpace(match.Court)
                ? "Brak informacji o boisku"
                : $"Boisko: {match.Court}";

            var added = await AddEventAsync(
                accessToken: accessToken,
                startDate: match.MatchDate,
                title: title,
                description: description
            );

            if (!added)
            {
                continue;
            }
            
            addedCount++;
            details.Add(new MatchResultDto(matchLabel, "ADDED", "Pomyślnie dodano do kalendarza."));
        }

        return new ExportResponseDto(addedCount, details);
    }

    [Obsolete("Obsolete")]
    private static async Task<bool> AddEventAsync(
        string accessToken,
        DateTime startDate,
        string title,
        string? description,
        DateTime? endDate = null)
    {
        var tz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Warsaw");
        var credential = GoogleCredential.FromAccessToken(accessToken);

        using var service = new CalendarService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = ApplicationName,
        });
    
        // Konwersja czasu startowego z czasu polskiego na UTC
        var localStartDate = DateTime.SpecifyKind(startDate, DateTimeKind.Unspecified);
        var startUtc = TimeZoneInfo.ConvertTimeToUtc(localStartDate, tz);

        // Konwersja czasu końcowego (jeśli brak, dodajemy 2 godziny do czasu polskiego i dopiero konwertujemy na UTC)
        var targetEndDate = endDate ?? startDate.AddHours(2);
        var localEndDate = DateTime.SpecifyKind(targetEndDate, DateTimeKind.Unspecified);
        var endUtc = TimeZoneInfo.ConvertTimeToUtc(localEndDate, tz);
    
        var newEvent = new Event
        {
            Summary = title,
            Description = description,
            Start = new EventDateTime { DateTimeDateTimeOffset = new DateTimeOffset(startUtc) },
            End = new EventDateTime { DateTimeDateTimeOffset = new DateTimeOffset(endUtc) }
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