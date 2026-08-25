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

            Console.WriteLine("===== MATCH =====");
            Console.WriteLine($"MatchDate: {match.MatchDate:o}");
            Console.WriteLine($"Kind:      {match.MatchDate.Kind}");
            Console.WriteLine("================");

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
        endDate ??= startDate.AddHours(2);

        var credential = GoogleCredential.FromAccessToken(accessToken);

        using var service = new CalendarService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = ApplicationName,
        });

        var warsawTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Warsaw");

        var startLocal = DateTime.SpecifyKind(
            startDate,
            DateTimeKind.Unspecified);

        var endLocal = DateTime.SpecifyKind(
            endDate.Value,
            DateTimeKind.Unspecified);

        var startOffset = warsawTimeZone.GetUtcOffset(startLocal);
        var endOffset = warsawTimeZone.GetUtcOffset(endLocal);

        var start = new DateTimeOffset(startLocal, startOffset);
        var end = new DateTimeOffset(endLocal, endOffset);

        var newEvent = new Event
        {
            Summary = title,
            Description = description,

            Start = new EventDateTime
            {
                DateTime = start.DateTime,
                TimeZone = "Europe/Warsaw"
            },

            End = new EventDateTime
            {
                DateTime = end.DateTime,
                TimeZone = "Europe/Warsaw"
            }
        };

        try
        {
            await service.Events
                .Insert(newEvent, "primary")
                .ExecuteAsync();

            return true;
        }
        catch (GoogleApiException ex)
        {
            Console.WriteLine(
                $"[Google Calendar Error]: {ex.HttpStatusCode} - {ex.Message}");

            throw;
        }
    }
}