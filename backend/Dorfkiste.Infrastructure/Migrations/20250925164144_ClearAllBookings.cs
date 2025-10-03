using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dorfkiste.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ClearAllBookings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Clear all bookings from the database
            migrationBuilder.Sql("DELETE FROM Bookings;");

            // Reset the auto-increment counter for the Bookings table
            migrationBuilder.Sql("DELETE FROM sqlite_sequence WHERE name = 'Bookings';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
