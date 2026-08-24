namespace Calendar_Api.Models;

public record MatchData(
    string Host,
    string Guest,
    int HostSetsResult,
    int GuestSetsResult,
    int Round,
    string Status,
    DateTime MatchDate,
    string Court)
{
    public bool IsUnplayed => string.IsNullOrEmpty(Status);
}