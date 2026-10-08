using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace BabyPlanner.IntegrationTests.Activities;

/// <summary>Listarea, filtrarea, "azi" si stergerea activitatilor prin HTTP, pe SQLite real.</summary>
public class ActivityEndpointsTests : IClassFixture<ApiFactory>
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    private readonly HttpClient _client;

    public ActivityEndpointsTests(ApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    private sealed record BabyResponse(int Id);

    private sealed record ActivityResponse(int Id, string Type, DateTimeOffset OccurredAt);

    private async Task<string> CreateBabyUrlAsync()
    {
        var response = await _client.PostAsJsonAsync("/api/babies", new { name = "Maria", dateOfBirth = "2026-03-24" });
        response.EnsureSuccessStatusCode();
        return $"/api/babies/{(await response.Content.ReadFromJsonAsync<BabyResponse>(Json))!.Id}/activities";
    }

    private async Task<ActivityResponse> LogAsync(string url, string type, DateTimeOffset occurredAt)
    {
        var response = await _client.PostAsJsonAsync(url, new { type, occurredAt });
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<ActivityResponse>(Json))!;
    }

    [Fact]
    public async Task The_history_is_newest_first_and_filters_by_type()
    {
        var url = await CreateBabyUrlAsync();
        var old = await LogAsync(url, "Feeding", ApiFactory.Now.AddDays(-2));
        var diaper = await LogAsync(url, "Diaper", ApiFactory.Now.AddHours(-1));
        var recent = await LogAsync(url, "Feeding", ApiFactory.Now);

        var all = await _client.GetFromJsonAsync<ActivityResponse[]>(url, Json);
        var feedings = await _client.GetFromJsonAsync<ActivityResponse[]>($"{url}?type=Feeding", Json);

        Assert.Equal([recent.Id, diaper.Id, old.Id], all!.Select(a => a.Id));
        Assert.Equal([recent.Id, old.Id], feedings!.Select(a => a.Id));
    }

    [Fact]
    public async Task Today_is_the_calendar_day_of_the_server_clock()
    {
        // Ceasul fabricii e 25.09.2026 16:00 UTC, deci "azi" e [00:00, 24:00) UTC.
        var url = await CreateBabyUrlAsync();
        var midnight = new DateTimeOffset(2026, 9, 25, 0, 0, 0, TimeSpan.Zero);
        await LogAsync(url, "Feeding", midnight.AddMinutes(-1));
        var first = await LogAsync(url, "Feeding", midnight);
        var diaper = await LogAsync(url, "Diaper", ApiFactory.Now);

        var today = await _client.GetFromJsonAsync<ActivityResponse[]>($"{url}/today", Json);
        var todayFeedings = await _client.GetFromJsonAsync<ActivityResponse[]>($"{url}/today?type=Feeding", Json);

        Assert.Equal([diaper.Id, first.Id], today!.Select(a => a.Id));
        Assert.Equal(first.Id, Assert.Single(todayFeedings!).Id);
    }

    [Fact]
    public async Task Delete_returns_204_and_the_activity_is_gone()
    {
        var url = await CreateBabyUrlAsync();
        var activity = await LogAsync(url, "Other", ApiFactory.Now);

        var response = await _client.DeleteAsync($"{url}/{activity.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await _client.GetAsync($"{url}/{activity.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await _client.DeleteAsync($"{url}/{activity.Id}")).StatusCode);
    }

    [Fact]
    public async Task An_activity_is_not_reachable_through_another_baby()
    {
        var maria = await CreateBabyUrlAsync();
        var ion = await CreateBabyUrlAsync();
        var activity = await LogAsync(maria, "Feeding", ApiFactory.Now);

        Assert.Equal(HttpStatusCode.NotFound, (await _client.GetAsync($"{ion}/{activity.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await _client.DeleteAsync($"{ion}/{activity.Id}")).StatusCode);
        Assert.Empty((await _client.GetFromJsonAsync<ActivityResponse[]>(ion, Json))!);
    }

    [Fact]
    public async Task Logging_for_an_unknown_baby_is_a_404()
    {
        var response = await _client.PostAsJsonAsync(
            "/api/babies/9999/activities",
            new { type = "Feeding", occurredAt = ApiFactory.Now });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
