namespace BabyPlanner.Application.Common.Exceptions;

/// <summary>
/// Login esuat sau cerere fara utilizator. Middleware-ul din Api o transforma in 401.
/// </summary>
public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message = "Trebuie să te autentifici.")
        : base(message)
    {
    }
}
