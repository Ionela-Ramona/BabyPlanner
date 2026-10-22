using System.Net.Http.Headers;
using System.Net.Http.Json;

using BabyPlanner.Application.Common.Interfaces;
using BabyPlanner.Infrastructure.Persistence;

using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace BabyPlanner.IntegrationTests;

/// <summary>
/// API-ul real, cu o baza SQLite in memorie (o conexiune tinuta deschisa cat traieste
/// fabrica) si un ceas fix. Migrarile se aplica la pornire, deci testele verifica si
/// ca ele ruleaza pe o baza goala.
/// </summary>
public sealed class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    public static readonly DateTimeOffset Now = new(2026, 9, 25, 16, 0, 0, TimeSpan.Zero);

    private readonly SqliteConnection _connection = new("Data Source=:memory:");

    /// <summary>Token-ul parintelui comun al testelor din aceeasi clasa (vezi <see cref="InitializeAsync"/>).</summary>
    private string _token = "";

    /// <summary>
    /// Un client logat ca parintele comun. Aproape toate endpoint-urile cer un token;
    /// testele de bebelusi si activitati nu testeaza login-ul, doar il folosesc.
    /// </summary>
    public HttpClient CreateAuthenticatedClient()
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);
        return client;
    }

    /// <summary>Inregistreaza un cont nou si intoarce token-ul lui.</summary>
    public async Task<string> RegisterAsync(string email, string password = "parola-buna")
    {
        var response = await CreateClient().PostAsJsonAsync("/api/auth/register", new { email, password });
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<TokenResponse>())!.Token;
    }

    private sealed record TokenResponse(string Token);

    // xUnit apeleaza InitializeAsync o data pe fabrica, inainte de primul test din clasa.
    // Async aici, nu in constructorul testelor, unde ar trebui blocat cu .Result.
    public async Task InitializeAsync() => _token = await RegisterAsync($"parinte-{Guid.NewGuid():N}@test.ro");

    Task IAsyncLifetime.DisposeAsync() => Task.CompletedTask;

    private sealed class FixedClock : IDateTimeProvider
    {
        public DateTimeOffset Now => ApiFactory.Now;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Nu "Development": acolo Program.cs ar migra si popula baza de pe disc.
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:BabyPlannerDb", "Data Source=:memory:");
        builder.UseSetting("Jwt:Key", "cheie-doar-pentru-teste-de-integrare-0123456789");

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<BabyPlannerDbContext>>();
            services.RemoveAll<IDateTimeProvider>();

            _connection.Open();
            services.AddDbContext<BabyPlannerDbContext>(options => options.UseSqlite(_connection));
            services.AddSingleton<IDateTimeProvider, FixedClock>();

            using var scope = services.BuildServiceProvider().CreateScope();
            scope.ServiceProvider.GetRequiredService<BabyPlannerDbContext>().Database.Migrate();
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        _connection.Dispose();
    }
}

internal static class ServiceCollectionExtensions
{
    public static void RemoveAll<T>(this IServiceCollection services)
    {
        foreach (var descriptor in services.Where(d => d.ServiceType == typeof(T)).ToList())
        {
            services.Remove(descriptor);
        }
    }
}
