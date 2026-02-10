using Calendar_Core;

namespace Calendar_CLI;

internal static class Program
{
    private static async Task Main()
    {
        var page = new Page("https://blssiatkowka.ligspace.pl/index.php?mod=Teams&ac=TeamSchedule&t_id=18");
        //page.ShowAllMatches();
        page.ShowUnplayedMatches();
    }
}