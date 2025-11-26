-- Database Diagnostic Script
-- Run this in MySQL to check for issues

USE smart_inventory_db;

-- 1. Check if all tables exist
SHOW TABLES;

-- 2. Check OrderItems table structure
DESCRIBE OrderItems;

-- 3. Check for orphaned OrderItems (OrderItems with invalid BatchId)
SELECT oi.Id, oi.OrderId, oi.MedicineId, oi.BatchId, oi.Quantity, oi.UnitPrice
FROM OrderItems oi
LEFT JOIN MedicineBatches mb ON oi.BatchId = mb.Id
WHERE mb.Id IS NULL;

-- 4. Check for orphaned OrderItems (OrderItems with invalid MedicineId)
SELECT oi.Id, oi.OrderId, oi.MedicineId, oi.BatchId, oi.Quantity, oi.UnitPrice
FROM OrderItems oi
LEFT JOIN Medicines m ON oi.MedicineId = m.Id
WHERE m.Id IS NULL;

-- 5. Check for orphaned OrderItems (OrderItems with invalid OrderId)
SELECT oi.Id, oi.OrderId, oi.MedicineId, oi.BatchId, oi.Quantity, oi.UnitPrice
FROM OrderItems oi
LEFT JOIN Orders o ON oi.OrderId = o.Id
WHERE o.Id IS NULL;

-- 6. Check Orders table structure
DESCRIBE Orders;

-- 7. Check MedicineBatches table structure
DESCRIBE MedicineBatches;

-- 8. Check Medicines table structure
DESCRIBE Medicines;

-- 9. Check foreign key constraints
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'smart_inventory_db'
    AND TABLE_NAME = 'OrderItems'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 10. Count records in each table
SELECT 'Orders' AS TableName, COUNT(*) AS RecordCount FROM Orders
UNION ALL
SELECT 'OrderItems', COUNT(*) FROM OrderItems
UNION ALL
SELECT 'MedicineBatches', COUNT(*) FROM MedicineBatches
UNION ALL
SELECT 'Medicines', COUNT(*) FROM Medicines
UNION ALL
SELECT 'Users', COUNT(*) FROM Users
UNION ALL
SELECT 'Payments', COUNT(*) FROM Payments;

-- 11. Check for any NULL values in critical columns
SELECT 'OrderItems with NULL BatchId' AS Issue, COUNT(*) AS Count
FROM OrderItems WHERE BatchId IS NULL
UNION ALL
SELECT 'OrderItems with NULL MedicineId', COUNT(*)
FROM OrderItems WHERE MedicineId IS NULL
UNION ALL
SELECT 'OrderItems with NULL OrderId', COUNT(*)
FROM OrderItems WHERE OrderId IS NULL;

-- 12. Sample query that matches the API query structure
SELECT 
    o.Id AS OrderId,
    o.UserId,
    o.OrderDate,
    o.Status,
    o.TotalAmount,
    oi.Id AS OrderItemId,
    oi.MedicineId,
    oi.BatchId,
    oi.Quantity,
    oi.UnitPrice,
    m.Id AS MedicineExists,
    mb.Id AS BatchExists
FROM Orders o
LEFT JOIN OrderItems oi ON o.Id = oi.OrderId
LEFT JOIN Medicines m ON oi.MedicineId = m.Id
LEFT JOIN MedicineBatches mb ON oi.BatchId = mb.Id
ORDER BY o.OrderDate DESC
LIMIT 10;





