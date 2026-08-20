using Calendar_Core;

namespace Calendar_CLI;

internal static class Program
{
    [Obsolete("Obsolete")]
    private static async Task Main()
    {
        var oldBoyePage = new Page("https://blssiatkowka.ligspace.pl/index.php?mod=Teams&ac=TeamSchedule&t_id=1");

        var calendar = new GoogleCalendarHelper();
        calendar.Logout();

        foreach (var match in oldBoyePage.UnplayedMatches)
        {
            var title = $"BLS Match: {match.Host} vs {match.Guest}";
            var eventId = match.GenerateEventId();
            var added = await calendar.AddEvent(
                match.MatchDate,
                title,
                match.GenerateDescription(),
                eventId: eventId
            );

            Console.WriteLine(added
                ? $"[DODANO] {title} ({match.MatchDate})"
                : $"[POMINIĘTO - JUŻ JEST] {title} ({match.MatchDate})");
        }
    }
}