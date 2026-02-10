using Calendar_Core;

namespace Calendar_CLI;

internal static class Program
{
    [Obsolete("Obsolete")]
    private static async Task Main()
    {
        var radSquadPage = new Page("https://blssiatkowka.ligspace.pl/index.php?mod=Teams&ac=TeamSchedule&t_id=18");
        
        var calendar = new GoogleCalendarHelper();
        calendar.Logout();
        
        foreach (var match in radSquadPage.UnplayedMatches)
        {
            var title = $"BLS Match: {match.Host} vs {match.Guest}";
            await calendar.AddEvent(
                match.MatchDate, 
                title,
                match.GenerateDescription()
                );
        }
    }
}