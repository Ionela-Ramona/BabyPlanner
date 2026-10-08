using System.Net;
using System.Net.Http.Json;

using BabyPlanner.Infrastructure.Persistence;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace BabyPlanner.IntegrationTests.Babies;

/// <summary>CRUD-ul de bebelusi prin HTTP, pana in baza si inapoi, plus traducerea erorilor.</summary>
public class BabyEndpointsTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    private readonly HttpClient _client;

    public BabyEndpointsTests(ApiFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private sealed record BabyResponse(int Id, string Name, DateOnly DateOfBirth);

    private async Task<BabyResponse> CreateAsync(string name, string dateOfBirth = "2026-03-24")
    {
        var response = await _client.PostAsJsonAsync("/api/babies", new { name, dateOfBirth });
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<BabyResponse>())!;
    }

    [Fact]
    public async Task Create_returns_201_with_a_location_that_reads_the_baby_back()
    {
        var response = await _client.PostAsJsonAsync("/api/babies", new { name = "  Maria  ", dateOfBirth = "2026-03-24" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<BabyResponse>();
        Assert.Equal("Maria", created!.Name);

        var read = await _client.GetFromJsonAsync<BabyResponse>(response.Headers.Location);
        Assert.Equal(created, read);
    }

    [Fact]
    public async Task The_list_is_ordered_by_name()
    {
        await CreateAsync("Zoe");
        await CreateAsync("Ana");

        var names = (await _client.GetFromJsonAsync<BabyResponse[]>("/api/babies"))!.Select(b => b.Name).ToList();

        Assert.Equal(names.Order(StringComparer.Ordinal), names);
        Assert.Contains("Zoe", names);
        Assert.Contains("Ana", names);
    }

    [Fact]
    public async Task Update_saves_the_new_values()
    {
        var baby = await CreateAsync("Ion");

        var response = await _client.PutAsJsonAsync($"/api/babies/{baby.Id}", new { name = "Ion Mihai", dateOfBirth = "2026-01-02" });

        response.EnsureSuccessStatusCode();
        var read = await _client.GetFromJsonAsync<BabyResponse>($"/api/babies/{baby.Id}");
        Assert.Equal(new BabyResponse(baby.Id, "Ion Mihai", new DateOnly(2026, 1, 2)), read);
    }

    [Fact]
    public async Task An_invalid_baby_is_a_400_with_field_errors()
    {
        // Data nasterii e "maine" fata de ceasul fix al fabricii.
        var response = await _client.PostAsJsonAsync("/api/babies", new { name = " ", dateOfBirth = "2026-09-26" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.Contains("Name", problem!.Errors.Keys);
        Assert.Contains("DateOfBirth", problem.Errors.Keys);
    }

    [Theory]
    [InlineData("GET")]
    [InlineData("PUT")]
    [InlineData("DELETE")]
    public async Task An_unknown_baby_is_a_404_problem(string method)
    {
        var request = new HttpRequestMessage(new HttpMethod(method), "/api/babies/9999");
        if (method == "PUT")
        {
            request.Content = JsonContent.Create(new { name = "Ana", dateOfBirth = "2026-03-24" });
        }

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        Assert.Equal("/api/babies/9999", problem!.Instance);
    }

    [Fact]
    public async Task Delete_removes_the_baby_and_its_activities()
    {
        var baby = await CreateAsync("Radu");
        (await _client.PostAsJsonAsync(
            $"/api/babies/{baby.Id}/activities",
            new { type = "Feeding", occurredAt = ApiFactory.Now })).EnsureSuccessStatusCode();

        var response = await _client.DeleteAsync($"/api/babies/{baby.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await _client.GetAsync($"/api/babies/{baby.Id}")).StatusCode);

        // Cascada se verifica in baza: prin API activitatile unui bebelus sters dau oricum 404.
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<BabyPlannerDbContext>();
        Assert.False(await db.Activities.AnyAsync(a => a.BabyId == baby.Id));
    }
}
