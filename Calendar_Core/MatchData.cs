namespace Calendar_Core;

public class MatchData(string host, string guest, int hostSetsResult, int guestSetsResult, int round, string status, DateTime? matchDate, string court)
{
    public DateTime MatchDate => matchDate ?? DateTime.Now;
    public bool IsUnplayed() => status == string.Empty;
    
    public override string ToString()
    {
        if(!IsUnplayed())
        {
            return $"{host} vs {guest}\n" +
                $"{hostSetsResult} - {guestSetsResult}\n" +
                $"{matchDate}\n" +
                $"{round}\n" +
                $"{status}\n" +
                $"{court}\n";
            
        }
        return $"{host} vs {guest}\n" +
               $"{matchDate}\n" +
               $"{round}\n" +
               $"{court}\n";
    }
    
}