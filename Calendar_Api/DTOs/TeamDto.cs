namespace Calendar_Api.DTOs;

public record TeamDto(
    int Id,
    string Name,
    string Url,
    string? LogoUrl,
    int LeagueNum, // 1 = I Liga, 2 = II Liga
    bool IsInCup = false,
    bool IsInCupElim = false,
    bool IsInSuperCup = false
);