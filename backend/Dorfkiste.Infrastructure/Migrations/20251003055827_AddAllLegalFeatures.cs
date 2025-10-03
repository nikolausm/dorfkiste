using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dorfkiste.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAllLegalFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletionReason",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EmailVerified",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsAdmin",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "VerificationToken",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "VerificationTokenExpiry",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "RentalContracts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    BookingId = table.Column<int>(type: "INTEGER", nullable: false),
                    LessorId = table.Column<int>(type: "INTEGER", nullable: false),
                    LesseeId = table.Column<int>(type: "INTEGER", nullable: false),
                    OfferTitle = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    OfferDescription = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    OfferType = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    RentalStartDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    RentalEndDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    RentalDays = table.Column<int>(type: "INTEGER", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "TEXT", precision: 10, scale: 2, nullable: false),
                    DepositAmount = table.Column<decimal>(type: "TEXT", precision: 10, scale: 2, nullable: false),
                    PricePerDay = table.Column<decimal>(type: "TEXT", precision: 10, scale: 2, nullable: false),
                    TermsAndConditions = table.Column<string>(type: "TEXT", nullable: false),
                    SpecialConditions = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    SignedByLessorAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    SignedByLesseeAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Status = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0),
                    LastModifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CancellationReason = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RentalContracts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RentalContracts_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RentalContracts_Users_LesseeId",
                        column: x => x.LesseeId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RentalContracts_Users_LessorId",
                        column: x => x.LessorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Reports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ReportType = table.Column<int>(type: "INTEGER", nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0),
                    ResolutionNotes = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ReporterId = table.Column<int>(type: "INTEGER", nullable: false),
                    ReportedOfferId = table.Column<int>(type: "INTEGER", nullable: true),
                    ReportedUserId = table.Column<int>(type: "INTEGER", nullable: true),
                    ReportedMessageId = table.Column<int>(type: "INTEGER", nullable: true),
                    ReviewedById = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reports_Messages_ReportedMessageId",
                        column: x => x.ReportedMessageId,
                        principalTable: "Messages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reports_Offers_ReportedOfferId",
                        column: x => x.ReportedOfferId,
                        principalTable: "Offers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reports_Users_ReportedUserId",
                        column: x => x.ReportedUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reports_Users_ReporterId",
                        column: x => x.ReporterId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reports_Users_ReviewedById",
                        column: x => x.ReviewedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserPrivacySettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    MarketingEmailsConsent = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    DataProcessingConsent = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: true),
                    ProfileVisibilityConsent = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: true),
                    DataSharingConsent = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    MarketingEmailsConsentDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DataProcessingConsentDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ProfileVisibilityConsentDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DataSharingConsentDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPrivacySettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserPrivacySettings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RentalContracts_BookingId",
                table: "RentalContracts",
                column: "BookingId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RentalContracts_CreatedAt",
                table: "RentalContracts",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_RentalContracts_LesseeId",
                table: "RentalContracts",
                column: "LesseeId");

            migrationBuilder.CreateIndex(
                name: "IX_RentalContracts_LesseeId_Status",
                table: "RentalContracts",
                columns: new[] { "LesseeId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_RentalContracts_LessorId",
                table: "RentalContracts",
                column: "LessorId");

            migrationBuilder.CreateIndex(
                name: "IX_RentalContracts_LessorId_Status",
                table: "RentalContracts",
                columns: new[] { "LessorId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_RentalContracts_Status",
                table: "RentalContracts",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_CreatedAt",
                table: "Reports",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_ReportedMessageId",
                table: "Reports",
                column: "ReportedMessageId");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_ReportedOfferId",
                table: "Reports",
                column: "ReportedOfferId");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_ReportedUserId",
                table: "Reports",
                column: "ReportedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_ReporterId",
                table: "Reports",
                column: "ReporterId");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_ReviewedById",
                table: "Reports",
                column: "ReviewedById");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_Status",
                table: "Reports",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_UserPrivacySettings_UserId",
                table: "UserPrivacySettings",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RentalContracts");

            migrationBuilder.DropTable(
                name: "Reports");

            migrationBuilder.DropTable(
                name: "UserPrivacySettings");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DeletionReason",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "EmailVerified",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsAdmin",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "VerificationToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "VerificationTokenExpiry",
                table: "Users");
        }
    }
}
