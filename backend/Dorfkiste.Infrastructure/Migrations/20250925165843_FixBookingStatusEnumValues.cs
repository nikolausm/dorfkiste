using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dorfkiste.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixBookingStatusEnumValues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update existing booking status values to match the new enum
            // Old: Confirmed = 1, Completed = 2
            // New: Confirmed = 0, Completed = 1
            migrationBuilder.Sql("UPDATE Bookings SET Status = 0 WHERE Status = 1;"); // Confirmed: 1 -> 0
            migrationBuilder.Sql("UPDATE Bookings SET Status = 1 WHERE Status = 2;"); // Completed: 2 -> 1

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "Bookings",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "Bookings",
                type: "INTEGER",
                nullable: false,
                defaultValue: 1,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 0);

            // Reverse the status value changes
            // New: Confirmed = 0, Completed = 1
            // Old: Confirmed = 1, Completed = 2
            migrationBuilder.Sql("UPDATE Bookings SET Status = 2 WHERE Status = 1;"); // Completed: 1 -> 2
            migrationBuilder.Sql("UPDATE Bookings SET Status = 1 WHERE Status = 0;"); // Confirmed: 0 -> 1
        }
    }
}
