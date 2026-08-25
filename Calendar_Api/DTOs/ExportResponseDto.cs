namespace Calendar_Api.DTOs;

public record ExportResponseDto(int AddedCount, List<MatchResultDto> Details);