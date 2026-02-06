namespace Calendar_Core;

public class MatchData(string host, string guest, int? hostSetsResult, int? guestSetsResult, DateTime? matchDate, TimeSpan? matchTime, string court)
{
    public string Host = host;
    public string Guest = guest;
    public int? HostSetsResult = hostSetsResult;
    public int? GuestSetsResult = guestSetsResult;
    public DateTime? MatchDate = matchDate;
    public TimeSpan? MatchTime = matchTime;
    public string Court = court;
    
}