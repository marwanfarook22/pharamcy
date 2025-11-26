-- Create Messages table for admin-to-user messaging
USE smart_inventory_db;

CREATE TABLE IF NOT EXISTS Messages (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    AdminId INT NULL,
    Subject VARCHAR(200) NOT NULL,
    Content VARCHAR(2000) NOT NULL,
    IsRead BOOLEAN NOT NULL DEFAULT FALSE,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ReadAt DATETIME NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (AdminId) REFERENCES Users(Id) ON DELETE SET NULL,
    INDEX idx_UserId (UserId),
    INDEX idx_AdminId (AdminId),
    INDEX idx_IsRead (IsRead),
    INDEX idx_CreatedAt (CreatedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

