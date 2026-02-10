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
    public async Task AddEvent(DateTime eventDate, string eventTitle)
    {
        var credential = await GetCredentialAsync();

        var service = new CalendarService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = ApplicationName,
        });

        var newEvent = new Event
        {
            Summary = eventTitle,
            Start = new EventDateTime
            {
                DateTime = eventDate,
                TimeZone = "Europe/Warsaw"
            },
            End = new EventDateTime
            {
                DateTime = eventDate.AddHours(1),
                TimeZone = "Europe/Warsaw"
            }
        };

        await service.Events.Insert(newEvent, "primary").ExecuteAsync();
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