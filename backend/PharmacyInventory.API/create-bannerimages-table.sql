-- Create bannerimages table
USE smart_inventory_db;

-- Drop table if exists (to recreate it)
DROP TABLE IF EXISTS `bannerimages`;

-- Create bannerimages table
CREATE TABLE `bannerimages` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `ImageUrl` VARCHAR(500) NOT NULL,
  `Title` VARCHAR(200) NULL,
  `Description` VARCHAR(500) NULL,
  `LinkUrl` VARCHAR(500) NULL,
  `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
  `DisplayOrder` INT NOT NULL DEFAULT 0,
  `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `UpdatedAt` DATETIME(6) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`Id`),
  INDEX `idx_isactive` (`IsActive`),
  INDEX `idx_displayorder` (`DisplayOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify table structure
DESCRIBE bannerimages;

-- Show table creation confirmation
SELECT 'bannerimages table created successfully!' AS Status;
