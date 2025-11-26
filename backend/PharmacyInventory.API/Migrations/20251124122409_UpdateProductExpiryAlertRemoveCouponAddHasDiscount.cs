using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharmacyInventory.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProductExpiryAlertRemoveCouponAddHasDiscount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductExpiryAlerts_Coupons_CouponId",
                table: "ProductExpiryAlerts");

            migrationBuilder.DropIndex(
                name: "IX_ProductExpiryAlerts_CouponId",
                table: "ProductExpiryAlerts");

            migrationBuilder.DropColumn(
                name: "CouponId",
                table: "ProductExpiryAlerts");

            migrationBuilder.AddColumn<bool>(
                name: "HasDiscount",
                table: "ProductExpiryAlerts",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HasDiscount",
                table: "ProductExpiryAlerts");

            migrationBuilder.AddColumn<int>(
                name: "CouponId",
                table: "ProductExpiryAlerts",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductExpiryAlerts_CouponId",
                table: "ProductExpiryAlerts",
                column: "CouponId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductExpiryAlerts_Coupons_CouponId",
                table: "ProductExpiryAlerts",
                column: "CouponId",
                principalTable: "Coupons",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
