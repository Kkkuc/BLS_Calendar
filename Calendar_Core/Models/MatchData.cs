using System.Security.Cryptography;
using System.Text;

namespace Calendar_Core.Models;

public record MatchData(
    string Host,
    string Guest,
    int HostSetsResult,
    int GuestSetsResult,
    int Round,
    string Status,
    DateTime MatchDate,
    string Court)
{
    public bool IsUnplayed => string.IsNullOrEmpty(Status);

    /// <summary>
    /// Generuje unikalne, poprawne dla Google Calendar Event ID (znaki 0-9, a-v)
    /// </summary>
    public string GenerateGoogleEventId()
    {
        var rawId = $"bls_{Host}_{Guest}_{MatchDate:yyyyMMddHHmm}".ToLowerInvariant();
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawId));
        var hex = Convert.ToHexString(hashBytes).ToLowerInvariant();

        return "bls" + hex[..32];
    }
}