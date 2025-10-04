using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dorfkiste.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOfferSalesAndDeliveryFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "DeliveryAvailable",
                table: "Offers",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "DeliveryCost",
                table: "Offers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Deposit",
                table: "Offers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsForSale",
                table: "Offers",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "SalePrice",
                table: "Offers",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeliveryAvailable",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "DeliveryCost",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "Deposit",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "IsForSale",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "SalePrice",
                table: "Offers");
        }
    }
}
