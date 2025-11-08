using TalepSistemi.API.Models;

namespace TalepSistemi.API.Services;

public interface ITokenService
{
    string GenerateToken(User user, List<string> roles);
}

