using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharmacyInventory.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBannerImagesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Check if BannerImages table already exists before creating it
            migrationBuilder.Sql(@"
                SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'bannerimages');
                SET @sqlstmt := IF(@exist = 0, 
                    'CREATE TABLE `bannerimages` (
                        `Id` int NOT NULL AUTO_INCREMENT,
                        `ImageUrl` varchar(500) CHARACTER SET utf8mb4 NOT NULL,
                        `Title` varchar(200) CHARACTER SET utf8mb4 NULL,
                        `Description` varchar(500) CHARACTER SET utf8mb4 NULL,
                        `LinkUrl` varchar(500) CHARACTER SET utf8mb4 NULL,
                        `IsActive` tinyint(1) NOT NULL DEFAULT TRUE,
                        `DisplayOrder` int NOT NULL DEFAULT 0,
                        `CreatedAt` datetime(6) NOT NULL,
                        `UpdatedAt` datetime(6) NULL,
                        CONSTRAINT `PK_BannerImages` PRIMARY KEY (`Id`)
                    ) CHARACTER SET=utf8mb4', 
                    'SELECT ''Table bannerimages already exists''');
                PREPARE stmt FROM @sqlstmt;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BannerImages");
        }
    }
}
