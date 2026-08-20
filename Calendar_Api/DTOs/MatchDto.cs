namespace Calendar_Api.DTOs;

public class MatchDto
{
    public string Host { get; set; } = string.Empty;
    public string Guest { get; set; } = string.Empty;
    public int HostSetsResult { get; set; }
    public int GuestSetsResult { get; set; }
    public int Round { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime MatchDate { get; set; }
    public string Court { get; set; } = string.Empty;
}