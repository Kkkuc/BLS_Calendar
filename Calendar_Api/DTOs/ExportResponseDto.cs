namespace Calendar_Api.DTOs;

public record ExportResponseDto(ExportSummaryDto Summary, List<MatchResultDto> Details);