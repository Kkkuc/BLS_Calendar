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
    
        // 1. Traktujemy sparsowaną datę jako "czysty" czas ściankowy (bez strefy)
        var cleanStart = DateTime.SpecifyKind(startDate, DateTimeKind.Unspecified);
        var cleanEnd = DateTime.SpecifyKind(endDate ?? startDate.AddHours(2), DateTimeKind.Unspecified);

        // 2. Pobieramy dokładny offset (przesunięca) dla polskiej strefy w tym konkretnym dniu (np. +02:00 latem)
        var startOffset = tz.GetUtcOffset(cleanStart);
        var endOffset = tz.GetUtcOffset(cleanEnd);

        // 3. Tworzymy DateTimeOffset jawnie ze wskazaniem polskiego czasu i offsetu
        var startDto = new DateTimeOffset(cleanStart, startOffset);
        var endDto = new DateTimeOffset(cleanEnd, endOffset);

        var newEvent = new Event
        {
            Summary = title,
            Description = description,
            // Przekazujemy gotowy DateTimeOffset – Google sam poprawnie zmapuje go na dowolną strefę użytkownika
            Start = new EventDateTime { DateTimeDateTimeOffset = startDto },
            End = new EventDateTime { DateTimeDateTimeOffset = endDto }
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