using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharmacyInventory.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBrandTableAndBrandIdToMedicine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Check if BrandId column already exists before adding it
            migrationBuilder.Sql(@"
                SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'Medicines' 
                AND COLUMN_NAME = 'BrandId');
                SET @sqlstmt := IF(@exist = 0, 
                    'ALTER TABLE `Medicines` ADD `BrandId` int NULL', 
                    'SELECT ''Column BrandId already exists''');
                PREPARE stmt FROM @sqlstmt;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");

            // Check if Brands table already exists before creating it
            migrationBuilder.Sql(@"
                SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'Brands');
                SET @sqlstmt := IF(@exist = 0, 
                    'CREATE TABLE `Brands` (
                        `Id` int NOT NULL AUTO_INCREMENT,
                        `Name` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
                        `Description` varchar(255) CHARACTER SET utf8mb4 NULL,
                        CONSTRAINT `PK_Brands` PRIMARY KEY (`Id`)
                    ) CHARACTER SET=utf8mb4', 
                    'SELECT ''Table Brands already exists''');
                PREPARE stmt FROM @sqlstmt;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");

            // Check if index already exists before creating it
            migrationBuilder.Sql(@"
                SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'Medicines' 
                AND INDEX_NAME = 'IX_Medicines_BrandId');
                SET @sqlstmt := IF(@exist = 0, 
                    'CREATE INDEX `IX_Medicines_BrandId` ON `Medicines` (`BrandId`)', 
                    'SELECT ''Index IX_Medicines_BrandId already exists''');
                PREPARE stmt FROM @sqlstmt;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");

            // Check if foreign key already exists before creating it
            migrationBuilder.Sql(@"
                SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'Medicines' 
                AND CONSTRAINT_NAME = 'FK_Medicines_Brands_BrandId');
                SET @sqlstmt := IF(@exist = 0, 
                    'ALTER TABLE `Medicines` ADD CONSTRAINT `FK_Medicines_Brands_BrandId` 
                    FOREIGN KEY (`BrandId`) REFERENCES `Brands` (`Id`) ON DELETE SET NULL', 
                    'SELECT ''Foreign key FK_Medicines_Brands_BrandId already exists''');
                PREPARE stmt FROM @sqlstmt;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Medicines_Brands_BrandId",
                table: "Medicines");

            migrationBuilder.DropTable(
                name: "Brands");

            migrationBuilder.DropIndex(
                name: "IX_Medicines_BrandId",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "BrandId",
                table: "Medicines");
        }
    }
}
