using Calendar_Core;

namespace Calendar_CLI;

internal static class Program
{
    [Obsolete("Obsolete")]
    private static async Task Main()
    {
        await ShowTeams();
        /*
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
        }*/
    }

    private static async Task ShowTeams()
    {
        Console.WriteLine("Pobieranie listy drużyn z BLS...\n");
        var teams = await Page.FetchAllTeamsAsync();

        if (!teams.Any())
        {
            Console.WriteLine("Nie odnaleziono żadnych drużyn.");
            return;
        }

        Console.WriteLine($"Znaleziono {teams.Count} drużyn:");
        Console.WriteLine(new string('-', 85));
        Console.WriteLine($"{"Lp.",-4} | {"Nazwa drużyny",-30} | {"Link do profilu"}");
        Console.WriteLine(new string('-', 85));

        for (int i = 0; i < teams.Count; i++)
        {
            var team = teams[i];
            Console.WriteLine($"{i + 1,2}.  | {team.Name,-30} | {team.Url}");
        }

        Console.WriteLine(new string('-', 85));
    }
}