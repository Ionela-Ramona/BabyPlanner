using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BabyPlanner.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddStructuredActivityDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AmountMl",
                table: "Activities",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DiaperKind",
                table: "Activities",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DurationMinutes",
                table: "Activities",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "InProgress",
                table: "Activities",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AmountMl",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "DiaperKind",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "DurationMinutes",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "InProgress",
                table: "Activities");
        }
    }
}
