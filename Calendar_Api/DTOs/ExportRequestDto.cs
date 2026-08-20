using System.Text.Json.Serialization;

namespace Calendar_Api.DTOs;

public class ExportRequestDto
{
    [JsonPropertyName("matches")]
    public List<MatchExportDto> Matches { get; set; } = new();
}