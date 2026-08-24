namespace Calendar_Api.DTOs;

public record TeamDto(int Id, string Name, string Url, string? LogoUrl, int League = 1);