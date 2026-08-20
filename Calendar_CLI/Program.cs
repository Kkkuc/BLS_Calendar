using Calendar_Core;

namespace Calendar_CLI;

internal static class Program
{
    [Obsolete("Obsolete")]
    private static async Task Main()
    {
        Console.WriteLine("Pobieranie listy drużyn z BLS...\n");
        var teams = await Page.FetchAllTeamsAsync();

        if (!teams.Any())
        {
            Console.WriteLine("Nie odnaleziono żadnych drużyn.");
            return;
        }

        var selectedTeam = SelectTeamInteractively(teams);
        Console.Clear();
        Console.WriteLine($"Wybrano drużynę: {selectedTeam.Name}");
        Console.WriteLine($"Pobieranie terminarza z: {selectedTeam.Url}\n");
        
        var selectedTeamPage = new Page(selectedTeam.Url);

        //var oldBoyePage = new Page("https://blssiatkowka.ligspace.pl/index.php?mod=Teams&ac=TeamSchedule&t_id=1");

        var calendar = new GoogleCalendarHelper();
        calendar.Logout();

        foreach (var match in selectedTeamPage.UnplayedMatches)
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

    /*private static async Task ShowTeams()
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
    }*/

    private static Team SelectTeamInteractively(List<Team> teams)
    {
        int selectedIndex = 0;
        const int pageSize = 10;
        Console.CursorVisible = false;

        ConsoleKey key;
        do
        {
            Console.Clear();
            Console.WriteLine("Wybierz drużynę z listy (Użyj strzałek GÓRA/DÓŁ, ENTER aby zatwierdzić):\n");
            Console.WriteLine(new string('-', 60));

            // Wyznaczamy okno 10 elementów wokół aktualnie wybranego indeksu
            int windowStart = Math.Max(0, selectedIndex - (pageSize / 2));

            // Zabezpieczenie przed wyjściem okna poza koniec listy
            if (windowStart + pageSize > teams.Count)
            {
                windowStart = Math.Max(0, teams.Count - pageSize);
            }

            int windowEnd = Math.Min(teams.Count, windowStart + pageSize);

            // Informacja o przewijaniu w górę
            if (windowStart > 0)
                Console.WriteLine("\t    ▲ ... (więcej w górę)");
            else
                Console.WriteLine();

            // Rysowanie tylko 10 widocznych elementów
            for (int i = windowStart; i < windowEnd; i++)
            {
                if (i == selectedIndex)
                {
                    Console.BackgroundColor = ConsoleColor.White;
                    Console.ForegroundColor = ConsoleColor.Black;
                    Console.WriteLine($"\t[>] {teams[i].Name,-35}");
                    Console.ResetColor();
                }
                else
                {
                    Console.WriteLine($"\t    {teams[i].Name,-35}");
                }
            }

            // Informacja o przewijaniu w dół
            if (windowEnd < teams.Count)
                Console.WriteLine("\t    ▼ ... (więcej w dół)");
            else
                Console.WriteLine();

            Console.WriteLine(new string('-', 60));
            Console.WriteLine($"Pozycja: {selectedIndex + 1} z {teams.Count}");

            var keyInfo = Console.ReadKey(true);
            key = keyInfo.Key;

            // Zapętlanie indeksu na drugi koniec listy
            if (key == ConsoleKey.UpArrow)
            {
                selectedIndex = (selectedIndex - 1 + teams.Count) % teams.Count;
            }
            else if (key == ConsoleKey.DownArrow)
            {
                selectedIndex = (selectedIndex + 1) % teams.Count;
            }
        } while (key != ConsoleKey.Enter);

        Console.CursorVisible = true;
        return teams[selectedIndex];
    }
}