using BabyPlanner.Application.Babies;
using BabyPlanner.Application.Babies.Dtos;
using BabyPlanner.Application.Babies.Validators;
using BabyPlanner.Application.Common.Exceptions;
using BabyPlanner.Domain.Entities;

using FluentValidation;

namespace BabyPlanner.UnitTests.Babies;

/// <summary>Validarea si orchestrarea operatiilor pe bebelusi.</summary>
public class BabyServiceTests
{
    private static readonly DateTimeOffset Now = new(2026, 9, 25, 16, 0, 0, TimeSpan.Zero);
    private static readonly DateOnly Today = new(2026, 9, 25);

    private readonly InMemoryBabyRepository _babies = new();
    private readonly BabyService _service;

    public BabyServiceTests()
    {
        var clock = new FixedClock(Now);
        _service = new BabyService(_babies, new CreateBabyRequestValidator(clock), new UpdateBabyRequestValidator(clock));
    }

    private Baby Seed(string name = "Maria")
    {
        var baby = new Baby { Name = name, DateOfBirth = Today.AddMonths(-6) };
        _babies.AddAsync(baby).Wait();
        return baby;
    }

    [Fact]
    public async Task Create_trims_the_name_and_returns_the_saved_baby()
    {
        var created = await _service.CreateAsync(new CreateBabyRequest("  Maria  ", Today));

        Assert.Equal("Maria", created.Name);
        Assert.Equal(Today, created.DateOfBirth);
        Assert.Equal(created.Id, Assert.Single(_babies.Babies).Id);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Create_rejects_an_empty_name(string name)
    {
        var error = await Assert.ThrowsAsync<ValidationException>(
            () => _service.CreateAsync(new CreateBabyRequest(name, Today)));

        Assert.Contains(error.Errors, e => e.ErrorMessage == "Numele este obligatoriu.");
        Assert.Empty(_babies.Babies);
    }

    [Fact]
    public async Task Create_rejects_a_name_over_100_characters()
    {
        var error = await Assert.ThrowsAsync<ValidationException>(
            () => _service.CreateAsync(new CreateBabyRequest(new string('a', 101), Today)));

        Assert.Contains(error.Errors, e => e.ErrorMessage == "Numele nu poate depasi 100 de caractere.");
    }

    [Fact]
    public async Task Create_accepts_today_but_not_tomorrow_as_date_of_birth()
    {
        await _service.CreateAsync(new CreateBabyRequest("Azi", Today));

        var error = await Assert.ThrowsAsync<ValidationException>(
            () => _service.CreateAsync(new CreateBabyRequest("Maine", Today.AddDays(1))));

        Assert.Contains(error.Errors, e => e.ErrorMessage == "Data nasterii nu poate fi in viitor.");
    }

    [Fact]
    public async Task GetAll_and_GetById_return_dtos()
    {
        var maria = Seed("Maria");
        Seed("Ion");

        Assert.Equal(["Maria", "Ion"], (await _service.GetAllAsync()).Select(b => b.Name));
        Assert.Equal(new BabyDto(maria.Id, "Maria", maria.DateOfBirth), await _service.GetByIdAsync(maria.Id));
    }

    [Fact]
    public async Task Update_applies_the_trimmed_values()
    {
        var baby = Seed();

        var updated = await _service.UpdateAsync(baby.Id, new UpdateBabyRequest(" Ana ", Today.AddDays(-3)));

        Assert.Equal("Ana", updated.Name);
        Assert.Equal("Ana", baby.Name);
        Assert.Equal(Today.AddDays(-3), baby.DateOfBirth);
    }

    [Fact]
    public async Task Update_validates_before_looking_up_the_baby()
    {
        await Assert.ThrowsAsync<ValidationException>(
            () => _service.UpdateAsync(999, new UpdateBabyRequest("", Today)));
    }

    [Fact]
    public async Task Delete_removes_the_baby()
    {
        var baby = Seed();

        await _service.DeleteAsync(baby.Id);

        Assert.Empty(_babies.Babies);
    }

    [Fact]
    public async Task An_unknown_id_is_not_found_everywhere()
    {
        var error = await Assert.ThrowsAsync<NotFoundException>(() => _service.GetByIdAsync(42));
        Assert.Equal(nameof(Baby), error.EntityName);
        Assert.Equal(42, error.Key);

        await Assert.ThrowsAsync<NotFoundException>(() => _service.UpdateAsync(42, new UpdateBabyRequest("Ana", Today)));
        await Assert.ThrowsAsync<NotFoundException>(() => _service.DeleteAsync(42));
    }
}
