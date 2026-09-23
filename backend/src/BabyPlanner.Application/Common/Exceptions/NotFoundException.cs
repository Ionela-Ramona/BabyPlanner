namespace BabyPlanner.Application.Common.Exceptions;

/// <summary>
/// Se arunca atunci cand o entitate ceruta nu exista. Middleware-ul din Api o
/// transforma in raspuns HTTP 404, deci controllerele raman fara try/catch.
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException(string entityName, object key)
        : base($"{entityName} cu identificatorul {key} nu a fost gasit.")
    {
        EntityName = entityName;
        Key = key;
    }

    public string EntityName { get; }

    public object Key { get; }
}
