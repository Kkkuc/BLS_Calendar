using System.Reflection;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Services;
using Google.Apis.Util.Store;

namespace Calendar_Core;

public class GoogleCalendarHelper
{
    private readonly string[] _scopes = [CalendarService.Scope.Calendar];
    private const string ApplicationName = "My Calendar App";
    
    [Obsolete("Obsolete")]
    public async Task AddEvent(DateTime startDate,
        string title,
        string? description = null,
        DateTime? endDate = null)
    {
        endDate ??= startDate.AddHours(2);
        var credential = await GetCredentialAsync();

        var service = new CalendarService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = ApplicationName,
        });

        var newEvent = new Event
        {
            Summary = title,
            Description = description,
            Start = new EventDateTime
            {
                DateTime = startDate,
                TimeZone = "Europe/Warsaw"
            },
            End = new EventDateTime
            {
                DateTime = endDate,
                TimeZone = "Europe/Warsaw"
            }
        };

        await service.Events.Insert(newEvent, "primary").ExecuteAsync();
    }
    
    public async Task<bool> EventExistsAsync(DateTime startDate, string title)
    {
        var credential = await GetCredentialAsync();

        var service = new CalendarService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = ApplicationName,
        });

        // Szukamy wydarzeń dokładnie w tym samym dniu/godzinie (np. window +/- 1 minuta)
        var request = service.Events.List("primary");
        request.TimeMinDateTimeOffset = startDate.AddMinutes(-1);
        request.TimeMaxDateTimeOffset = startDate.AddMinutes(1);
        request.Q = title; // Filtrowanie po tytule

        var events = await request.ExecuteAsync();

        // Sprawdzamy, czy którekolwiek z dopasowanych wydarzeń ma identyczny tytuł
        return events.Items.Any(e => e.Summary.Equals(title, StringComparison.OrdinalIgnoreCase));
    }
    
    public void Logout()
    {
        var tokenPath = Path.Combine("token.json");

        if (Directory.Exists(tokenPath))
        {
            Directory.Delete(tokenPath, true);
        }
    }
    
    private static Stream GetCredentialsStream()
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resourceName = assembly
            .GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith("credentials.json"));

        if (resourceName == null)
            throw new InvalidOperationException("Nie znaleziono credentials.json jako zasobu");

        return assembly.GetManifestResourceStream(resourceName)!;
    }


    private async Task<UserCredential> GetCredentialAsync()
    {
        await using var stream = GetCredentialsStream();

        return await GoogleWebAuthorizationBroker.AuthorizeAsync(
            (await GoogleClientSecrets.FromStreamAsync(stream)).Secrets,
            _scopes,
            "user",
            CancellationToken.None,
            new FileDataStore("token.json", true)
        );
    }
}