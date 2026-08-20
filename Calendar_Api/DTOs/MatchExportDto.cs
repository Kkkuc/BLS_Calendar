using System.Text.Json.Serialization;

namespace Calendar_Api.DTOs;

public class MatchExportDto
{
    [JsonPropertyName("host")]
    public string Host { get; set; } = string.Empty;

    [JsonPropertyName("guest")]
    public string Guest { get; set; } = string.Empty;

    [JsonPropertyName("matchDate")]
    public DateTime MatchDate { get; set; }

    [JsonPropertyName("round")]
    public object? Round { get; set; }

    [JsonPropertyName("court")]
    public string? Court { get; set; }
}