using BabyPlanner.Application.Activities.Dtos;
using BabyPlanner.Application.Activities.Validators;
using BabyPlanner.Application.Common.Interfaces;
using BabyPlanner.Domain.Enums;

namespace BabyPlanner.UnitTests.Activities;

/// <summary>Regulile pentru detaliile structurate (BP-UI-20), pe creare si pe editare.</summary>
public class ActivityValidatorTests
{
    private static readonly DateTimeOffset Now = new(2026, 9, 25, 16, 0, 0, TimeSpan.Zero);

    private sealed class FixedClock : IDateTimeProvider
    {
        public DateTimeOffset Now => ActivityValidatorTests.Now;
    }

    private static readonly CreateActivityRequestValidator Create = new(new FixedClock());
    private static readonly UpdateActivityRequestValidator Update = new(new FixedClock());

    private static CreateActivityRequest Request(
        ActivityType type,
        int? amountMl = null,
        int? durationMinutes = null,
        DiaperKind? diaperKind = null,
        bool inProgress = false) =>
        new(type, Now.AddMinutes(-10), null, amountMl, durationMinutes, diaperKind, inProgress);

    private static string[] ErrorsFor(CreateActivityRequest request, string property) =>
        Create.Validate(request).Errors
            .Where(e => e.PropertyName == property)
            .Select(e => e.ErrorMessage)
            .ToArray();

    [Fact]
    public void An_activity_without_details_stays_valid()
    {
        Assert.True(Create.Validate(Request(ActivityType.Feeding)).IsValid);
        Assert.True(Create.Validate(Request(ActivityType.Other)).IsValid);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(120)]
    [InlineData(500)]
    public void Feeding_accepts_an_amount_between_1_and_500_ml(int amount)
    {
        Assert.True(Create.Validate(Request(ActivityType.Feeding, amountMl: amount)).IsValid);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    [InlineData(501)]
    public void Feeding_rejects_an_amount_outside_1_to_500_ml(int amount)
    {
        Assert.Contains(
            "Cantitatea trebuie sa fie intre 1 si 500 ml.",
            ErrorsFor(Request(ActivityType.Feeding, amountMl: amount), nameof(CreateActivityRequest.AmountMl)));
    }

    [Fact]
    public void An_amount_is_rejected_on_anything_but_feeding()
    {
        Assert.Contains(
            "Cantitatea se poate nota doar la masa.",
            ErrorsFor(Request(ActivityType.Sleep, amountMl: 100), nameof(CreateActivityRequest.AmountMl)));
    }

    [Theory]
    [InlineData(ActivityType.Sleep)]
    [InlineData(ActivityType.Feeding)]
    public void Sleep_and_feeding_accept_a_duration(ActivityType type)
    {
        Assert.True(Create.Validate(Request(type, durationMinutes: 45)).IsValid);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1441)]
    public void A_duration_must_be_between_1_minute_and_a_day(int minutes)
    {
        Assert.NotEmpty(
            ErrorsFor(Request(ActivityType.Sleep, durationMinutes: minutes), nameof(CreateActivityRequest.DurationMinutes)));
    }

    [Fact]
    public void A_duration_is_rejected_on_a_diaper()
    {
        Assert.Contains(
            "Durata se poate nota doar la somn sau la masa.",
            ErrorsFor(Request(ActivityType.Diaper, durationMinutes: 5), nameof(CreateActivityRequest.DurationMinutes)));
    }

    [Fact]
    public void Diaper_kind_is_accepted_only_on_a_diaper()
    {
        Assert.True(Create.Validate(Request(ActivityType.Diaper, diaperKind: DiaperKind.Both)).IsValid);
        Assert.Contains(
            "Tipul scutecului se poate nota doar la scutec.",
            ErrorsFor(Request(ActivityType.Feeding, diaperKind: DiaperKind.Wet), nameof(CreateActivityRequest.DiaperKind)));
    }

    [Fact]
    public void An_unknown_diaper_kind_is_rejected()
    {
        Assert.Contains(
            "Tipul scutecului nu este valid.",
            ErrorsFor(Request(ActivityType.Diaper, diaperKind: (DiaperKind)42), nameof(CreateActivityRequest.DiaperKind)));
    }

    [Fact]
    public void Only_a_sleep_can_be_in_progress()
    {
        Assert.True(Create.Validate(Request(ActivityType.Sleep, inProgress: true)).IsValid);
        Assert.Contains(
            "Doar un somn poate fi in desfasurare.",
            ErrorsFor(Request(ActivityType.Feeding, inProgress: true), nameof(CreateActivityRequest.InProgress)));
    }

    [Fact]
    public void A_sleep_in_progress_has_no_duration_yet()
    {
        Assert.Contains(
            "Un somn care inca dureaza nu are inca durata.",
            ErrorsFor(
                Request(ActivityType.Sleep, durationMinutes: 30, inProgress: true),
                nameof(CreateActivityRequest.DurationMinutes)));
    }

    [Fact]
    public void Update_uses_the_same_rules()
    {
        var waking = new UpdateActivityRequest(ActivityType.Sleep, Now.AddHours(-1), null, DurationMinutes: 60);
        var wrong = new UpdateActivityRequest(ActivityType.Medicine, Now.AddHours(-1), null, AmountMl: 5);

        Assert.True(Update.Validate(waking).IsValid);
        Assert.False(Update.Validate(wrong).IsValid);
    }
}
