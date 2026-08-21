using System.Net;
using Google;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Services;

namespace Calendar_Core;

public class GoogleCalendarHelper
{
    //private readonly string[] _scopes = [CalendarService.Scope.Calendar];
    private const string ApplicationName = "My Calendar App";
    
    [Obsolete("Obsolete")]
    public async Task<bool> AddEventAsync(
        string accessToken,
        DateTime startDate,
        string title,
        string? description = null,
        string? eventId = null,
        DateTime? endDate = null)
    {
        endDate ??= startDate.AddHours(2);
        //var credential = await GetCredentialAsync();
        var credential = GoogleCredential.FromAccessToken(accessToken);

        var service = new CalendarService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = ApplicationName,
        });

        var newEvent = new Event
        {
            Id = eventId,
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

        try
        {
            await service.Events.Insert(newEvent, "primary").ExecuteAsync();
            return true; 
        }
        catch (GoogleApiException ex) when (ex.HttpStatusCode == HttpStatusCode.Conflict)
        {
            // Tylko kod 409 to faktyczny duplikat
            Console.WriteLine($"[DUPLIKAT] Event {eventId} już istnieje.");
            return false; 
        }
        catch (GoogleApiException ex)
        {
            // TUTAJ ZOBACZYSZ PRAWDZIWY BŁĄD (np. Invalid Event ID, Unauthorized, Invalid Credentials)
            Console.WriteLine($"[BŁĄD GOOGLE API {ex.HttpStatusCode}]: {ex.Message}");
            throw; // Przerwij, aby zobaczyć dokładny błąd w konsoli backendu
        }
    }
    
    public void Logout()
    {
        var tokenPath = Path.Combine("token.json");

        if (Directory.Exists(tokenPath))
        {
            Directory.Delete(tokenPath, true);
        }
        else if (File.Exists(tokenPath))
        {
            File.Delete(tokenPath);
        }
    }
    
   /* private static Stream GetCredentialsStream()
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
    }*/
}