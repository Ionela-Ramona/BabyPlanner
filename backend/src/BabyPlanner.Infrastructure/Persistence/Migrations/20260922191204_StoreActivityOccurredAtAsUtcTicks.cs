using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BabyPlanner.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class StoreActivityOccurredAtAsUtcTicks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<long>(
                name: "OccurredAt",
                table: "Activities",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(DateTimeOffset),
                oldType: "TEXT");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "OccurredAt",
                table: "Activities",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "INTEGER");
        }
    }
}
