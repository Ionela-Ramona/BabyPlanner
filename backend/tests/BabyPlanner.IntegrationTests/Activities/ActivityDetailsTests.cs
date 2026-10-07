using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

using Microsoft.AspNetCore.Mvc;

namespace BabyPlanner.IntegrationTests.Activities;

/// <summary>Detaliile structurate (BP-UI-20) prin HTTP: salvare, citire, validare, trezire.</summary>
public class ActivityDetailsTests : IClassFixture<ApiFactory>
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    private readonly HttpClient _client;

    public ActivityDetailsTests(ApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    private sealed record BabyResponse(int Id, string Name);

    private sealed record ActivityResponse(
        int Id,
        string Type,
        DateTimeOffset OccurredAt,
        string? Notes,
        int? AmountMl,
        int? DurationMinutes,
        string? DiaperKind,
        bool InProgress);

    private async Task<int> CreateBabyAsync()
    {
        var response = await _client.PostAsJsonAsync("/api/babies", new { name = "Maria", dateOfBirth = "2026-03-24" });
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<BabyResponse>(Json))!.Id;
    }

    [Fact]
    public async Task Saves_and_returns_the_details_of_each_type()
    {
        var babyId = await CreateBabyAsync();
        var url = $"/api/babies/{babyId}/activities";
        var at = ApiFactory.Now.AddHours(-1);

        await _client.PostAsJsonAsync(url, new { type = "Feeding", occurredAt = at, amountMl = 120 });
        await _client.PostAsJsonAsync(url, new { type = "Sleep", occurredAt = at, durationMinutes = 45 });
        await _client.PostAsJsonAsync(url, new { type = "Diaper", occurredAt = at, diaperKind = "Both" });

        var all = await _client.GetFromJsonAsync<ActivityResponse[]>(url, Json);

        Assert.Contains(all!, a => a.Type == "Feeding" && a.AmountMl == 120);
        Assert.Contains(all!, a => a.Type == "Sleep" && a.DurationMinutes == 45 && !a.InProgress);
        Assert.Contains(all!, a => a.Type == "Diaper" && a.DiaperKind == "Both");
    }

    [Fact]
    public async Task A_client_that_sends_no_details_still_works()
    {
        var babyId = await CreateBabyAsync();

        var response = await _client.PostAsJsonAsync(
            $"/api/babies/{babyId}/activities",
            new { type = "Medicine", occurredAt = ApiFactory.Now, notes = "Vitamina D" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<ActivityResponse>(Json);
        Assert.Null(created!.AmountMl);
        Assert.Null(created.DurationMinutes);
        Assert.Null(created.DiaperKind);
        Assert.False(created.InProgress);
    }

    [Fact]
    public async Task Rejects_a_detail_on_the_wrong_type_with_a_field_error()
    {
        var babyId = await CreateBabyAsync();

        var response = await _client.PostAsJsonAsync(
            $"/api/babies/{babyId}/activities",
            new { type = "Diaper", occurredAt = ApiFactory.Now, amountMl = 90 });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>(Json);
        Assert.Contains("Cantitatea se poate nota doar la masa.", problem!.Errors["AmountMl"]);
    }

    [Fact]
    public async Task A_sleep_in_progress_ends_with_a_duration()
    {
        var babyId = await CreateBabyAsync();
        var url = $"/api/babies/{babyId}/activities";
        var start = ApiFactory.Now.AddMinutes(-50);

        var started = await (await _client.PostAsJsonAsync(url, new { type = "Sleep", occurredAt = start, inProgress = true }))
            .Content.ReadFromJsonAsync<ActivityResponse>(Json);
        Assert.True(started!.InProgress);

        // "S-a trezit": acelasi somn, fara "in desfasurare", cu durata calculata de client.
        var woke = await _client.PutAsJsonAsync(
            $"{url}/{started.Id}",
            new { type = "Sleep", occurredAt = start, durationMinutes = 50, inProgress = false });
        woke.EnsureSuccessStatusCode();

        var after = await _client.GetFromJsonAsync<ActivityResponse>($"{url}/{started.Id}", Json);
        Assert.False(after!.InProgress);
        Assert.Equal(50, after.DurationMinutes);
    }

    [Fact]
    public async Task Ongoing_returns_a_sleep_started_yesterday_until_the_baby_wakes()
    {
        var babyId = await CreateBabyAsync();
        var url = $"/api/babies/{babyId}/activities";
        // Inceput "aseara": /today nu-l mai vede, /ongoing trebuie sa-l vada.
        var lastNight = ApiFactory.Now.AddHours(-20);

        var sleep = await (await _client.PostAsJsonAsync(url, new { type = "Sleep", occurredAt = lastNight, inProgress = true }))
            .Content.ReadFromJsonAsync<ActivityResponse>(Json);
        await _client.PostAsJsonAsync(url, new { type = "Sleep", occurredAt = lastNight.AddHours(-3), durationMinutes = 30 });

        var ongoing = await _client.GetFromJsonAsync<ActivityResponse[]>($"{url}/ongoing", Json);
        Assert.Equal(sleep!.Id, Assert.Single(ongoing!).Id);

        await _client.PutAsJsonAsync(
            $"{url}/{sleep.Id}",
            new { type = "Sleep", occurredAt = lastNight, durationMinutes = 600 });

        Assert.Empty((await _client.GetFromJsonAsync<ActivityResponse[]>($"{url}/ongoing", Json))!);
    }

    [Fact]
    public async Task Latest_returns_the_newest_of_each_type_even_from_yesterday()
    {
        var babyId = await CreateBabyAsync();
        var url = $"/api/babies/{babyId}/activities";
        // Masa de aseara e ultima masa: /today n-o mai vede, /latest trebuie s-o vada.
        var lastNight = ApiFactory.Now.AddHours(-17);

        await _client.PostAsJsonAsync(url, new { type = "Feeding", occurredAt = lastNight.AddHours(-3) });
        var feed = await (await _client.PostAsJsonAsync(url, new { type = "Feeding", occurredAt = lastNight }))
            .Content.ReadFromJsonAsync<ActivityResponse>(Json);
        var diaper = await (await _client.PostAsJsonAsync(url, new { type = "Diaper", occurredAt = ApiFactory.Now }))
            .Content.ReadFromJsonAsync<ActivityResponse>(Json);

        var latest = await _client.GetFromJsonAsync<ActivityResponse[]>($"{url}/latest", Json);

        Assert.Equal(2, latest!.Length);
        Assert.Equal(feed!.Id, Assert.Single(latest, a => a.Type == "Feeding").Id);
        Assert.Equal(diaper!.Id, Assert.Single(latest, a => a.Type == "Diaper").Id);
        Assert.Equal(
            HttpStatusCode.NotFound,
            (await _client.GetAsync("/api/babies/9999/activities/latest")).StatusCode);
    }

    [Fact]
    public async Task Ongoing_is_404_for_an_unknown_baby()
    {
        var response = await _client.GetAsync("/api/babies/9999/activities/ongoing");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
