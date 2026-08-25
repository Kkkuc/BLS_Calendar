namespace Calendar_Api.DTOs;

public record MatchDto(
    string Host,
    string Guest,
    int HostSetsResult,
    int GuestSetsResult,
    int Round,
    string Status,
    DateTime MatchDate,
    string Court)
{
    public bool IsUnplayed => string.IsNullOrWhiteSpace(Status) && HostSetsResult == 0 && GuestSetsResult == 0;
}