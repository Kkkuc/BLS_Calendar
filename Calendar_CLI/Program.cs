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
            bool exists = await calendar.EventExistsAsync(match.MatchDate, title);
            if (exists)
            {
                Console.WriteLine($"[POMINIĘTO] Wydarzenie już istnieje: {title} ({match.MatchDate})");
                continue;
            }

            await calendar.AddEvent(
                match.MatchDate,
                title,
                match.GenerateDescription()
            );

            Console.WriteLine($"[DODANO] {title} ({match.MatchDate})");
        }
    }
}