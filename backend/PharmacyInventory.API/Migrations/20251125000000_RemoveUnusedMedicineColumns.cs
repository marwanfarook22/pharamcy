using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharmacyInventory.API.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUnusedMedicineColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ItemType",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "OriginalPrice",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "HasDiscount",
                table: "Medicines");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ItemType",
                table: "Medicines",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Medicine")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<decimal>(
                name: "OriginalPrice",
                table: "Medicines",
                type: "decimal(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasDiscount",
                table: "Medicines",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }
    }
}

