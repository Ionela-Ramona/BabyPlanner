using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

using Microsoft.AspNetCore.Mvc;

namespace BabyPlanner.IntegrationTests.Auth;

/// <summary>Conturile, token-ul si regula principala: fiecare parinte vede doar bebelusii lui.</summary>
public class AuthEndpointsTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    private readonly HttpClient _anonymous;

    public AuthEndpointsTests(ApiFactory factory)
    {
        _factory = factory;
        _anonymous = factory.CreateClient();
    }

    private sealed record BabyResponse(int Id, string Name, DateOnly DateOfBirth);

    private HttpClient ClientWith(string token)
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    private static string NewEmail() => $"p-{Guid.NewGuid():N}@test.ro";

    [Fact]
    public async Task Without_a_token_the_api_is_closed()
    {
        Assert.Equal(HttpStatusCode.Unauthorized, (await _anonymous.GetAsync("/api/babies")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await _anonymous.GetAsync("/api/babies/1/activities/today")).StatusCode);
    }

    [Fact]
    public async Task A_new_parent_logs_in_with_any_casing_of_the_email()
    {
        var email = NewEmail();
        await _factory.RegisterAsync(email);

        var response = await _anonymous.PostAsJsonAsync("/api/auth/login", new { email = $"  {email.ToUpperInvariant()} ", password = "parola-buna" });

        response.EnsureSuccessStatusCode();
        var token = (await response.Content.ReadFromJsonAsync<Dictionary<string, object>>())!["token"].ToString()!;
        // Un parinte nou nu vede nimic: nici bebelusii seed-ului, nici pe ai altora.
        Assert.Empty((await ClientWith(token).GetFromJsonAsync<BabyResponse[]>("/api/babies"))!);
    }

    [Fact]
    public async Task A_wrong_password_is_a_401_problem()
    {
        var email = NewEmail();
        await _factory.RegisterAsync(email);

        var response = await _anonymous.PostAsJsonAsync("/api/auth/login", new { email, password = "alta-parola" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        Assert.Equal("Email sau parolă greșită.", problem!.Detail);
    }

    [Fact]
    public async Task Registering_the_same_email_twice_is_a_400_on_the_email_field()
    {
        var email = NewEmail();
        await _factory.RegisterAsync(email);

        var response = await _anonymous.PostAsJsonAsync("/api/auth/register", new { email, password = "parola-buna" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.Contains("Email", problem!.Errors.Keys);
    }

    [Fact]
    public async Task A_parent_never_sees_or_touches_another_parents_baby()
    {
        var ana = ClientWith(await _factory.RegisterAsync(NewEmail()));
        var ion = ClientWith(await _factory.RegisterAsync(NewEmail()));

        var created = await ana.PostAsJsonAsync("/api/babies", new { name = "Maria", dateOfBirth = "2026-03-24" });
        var maria = (await created.Content.ReadFromJsonAsync<BabyResponse>())!;
        (await ana.PostAsJsonAsync($"/api/babies/{maria.Id}/activities", new { type = "Feeding", occurredAt = ApiFactory.Now })).EnsureSuccessStatusCode();

        Assert.Equal([maria], await ana.GetFromJsonAsync<BabyResponse[]>("/api/babies"));
        Assert.Empty((await ion.GetFromJsonAsync<BabyResponse[]>("/api/babies"))!);

        // 404, nu 403: Ion nu afla nici macar ca bebelusul exista.
        Assert.Equal(HttpStatusCode.NotFound, (await ion.GetAsync($"/api/babies/{maria.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await ion.GetAsync($"/api/babies/{maria.Id}/activities")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await ion.PostAsJsonAsync($"/api/babies/{maria.Id}/activities", new { type = "Diaper", occurredAt = ApiFactory.Now })).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await ion.DeleteAsync($"/api/babies/{maria.Id}")).StatusCode);

        Assert.Single((await ana.GetFromJsonAsync<object[]>($"/api/babies/{maria.Id}/activities"))!);
    }
}
