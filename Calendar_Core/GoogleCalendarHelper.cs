using Google.Apis.Auth.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Services;
using Google.Apis.Util.Store;

namespace Calendar_CLI;

public class GoogleCalendarHelper
{
    private readonly string[] _scopes = [CalendarService.Scope.Calendar];
    private const string ApplicationName = "My Calendar App";
    
    public void AddEvent(DateTime eventDate, string eventTitle)
    {
        UserCredential credential;

        using (var stream =
               new FileStream("../../../../credentials.json", FileMode.Open, FileAccess.Read))
        {
            credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                GoogleClientSecrets.FromStream(stream).Secrets,
                _scopes,
                "user",
                CancellationToken.None,
                new FileDataStore("token.json", true)).Result;
        }

        var service = new CalendarService(new BaseClientService.Initializer()
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

        service.Events.Insert(newEvent, "primary").Execute();
    }
    
    public void Logout()
    {
        var tokenPath = Path.Combine("token.json");

        if (Directory.Exists(tokenPath))
        {
            Directory.Delete(tokenPath, true);
        }
    }
}