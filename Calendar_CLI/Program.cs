using System.Reflection;
using Calendar_Core;

namespace Calendar_CLI;

internal static class Program
{
    [Obsolete("Obsolete")]
    private static async Task Main()
    {
        var radSquadPage = new Page("https://blssiatkowka.ligspace.pl/index.php?mod=Teams&ac=TeamSchedule&t_id=18");
        //page.ShowAllMatches();
        //page.ShowUnplayedMatches();
        
        var calendar = new GoogleCalendarHelper();
        calendar.Logout();
        //var date = new DateTime(2026, 2, 10, 16, 0, 0);
        //var title = "Spotkanie z klientem";
        
        
        foreach (var match in radSquadPage.UnplayedMatches)
        {
            await calendar.AddEvent(match.MatchDate, match.ToString());
        }
    }
}