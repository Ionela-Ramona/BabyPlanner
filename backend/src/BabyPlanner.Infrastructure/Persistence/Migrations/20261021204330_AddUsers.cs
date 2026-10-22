using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BabyPlanner.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Babies",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 256, nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            // Bebelusii de dinainte de conturi nu au proprietar. Nu ii stergem: ii mutam in
            // contul demo (DbSeeder.DemoEmail / DemoPassword), care se creeaza doar daca
            // exista astfel de bebelusi. Hash-ul e calculat o data cu PasswordHasher<User>
            // pentru parola demo; contine sarea si numarul de iteratii, deci ramane valid.
            migrationBuilder.Sql(
                """
                INSERT INTO "Users" ("Email", "PasswordHash")
                SELECT 'demo@babyplanner.local', 'AQAAAAIAAYagAAAAEK/NQ2GwJGNfXsEws+cOeogYccFgd+rUYAHl8cbJJZiUq2hMGb3NKc2QzTvcDg9obg=='
                WHERE EXISTS (SELECT 1 FROM "Babies");

                UPDATE "Babies"
                SET "UserId" = (SELECT "Id" FROM "Users" WHERE "Email" = 'demo@babyplanner.local')
                WHERE "UserId" = 0;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Babies_UserId",
                table: "Babies",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Babies_Users_UserId",
                table: "Babies",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Babies_Users_UserId",
                table: "Babies");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Babies_UserId",
                table: "Babies");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Babies");
        }
    }
}
