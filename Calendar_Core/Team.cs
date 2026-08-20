namespace Calendar_Core;

public class Team
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public int League { get; set; } = 1; // 1 lub 2 liga
}