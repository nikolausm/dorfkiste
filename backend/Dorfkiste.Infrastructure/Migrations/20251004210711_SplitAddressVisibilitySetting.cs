using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dorfkiste.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SplitAddressVisibilitySetting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ShowAddress",
                table: "UserPrivacySettings",
                newName: "ShowStreet");

            migrationBuilder.AddColumn<bool>(
                name: "ShowCity",
                table: "UserPrivacySettings",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShowCity",
                table: "UserPrivacySettings");

            migrationBuilder.RenameColumn(
                name: "ShowStreet",
                table: "UserPrivacySettings",
                newName: "ShowAddress");
        }
    }
}
