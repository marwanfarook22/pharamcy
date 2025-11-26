using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharmacyInventory.API.Migrations
{
    /// <inheritdoc />
    public partial class FixSupplierReturnRequestRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SupplierReturnRequests_MedicineBatches_MedicineBatchId",
                table: "SupplierReturnRequests");

            migrationBuilder.DropIndex(
                name: "IX_SupplierReturnRequests_MedicineBatchId",
                table: "SupplierReturnRequests");

            migrationBuilder.DropColumn(
                name: "MedicineBatchId",
                table: "SupplierReturnRequests");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MedicineBatchId",
                table: "SupplierReturnRequests",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SupplierReturnRequests_MedicineBatchId",
                table: "SupplierReturnRequests",
                column: "MedicineBatchId");

            migrationBuilder.AddForeignKey(
                name: "FK_SupplierReturnRequests_MedicineBatches_MedicineBatchId",
                table: "SupplierReturnRequests",
                column: "MedicineBatchId",
                principalTable: "MedicineBatches",
                principalColumn: "Id");
        }
    }
}
