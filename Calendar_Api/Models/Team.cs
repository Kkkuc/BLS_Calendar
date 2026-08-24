namespace Calendar_Api.Models;

public record Team(int Id, string Name, string Url, string? LogoUrl = null, int League = 1);