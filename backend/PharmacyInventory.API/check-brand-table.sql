-- Check Brand Table and BrandId in Medicines Table
-- Run this in MySQL to verify the Brand table and BrandId column

USE smart_inventory_db;

-- 1. Check if Brand table exists
SHOW TABLES LIKE 'Brands';
SHOW TABLES LIKE 'Brand';

-- 2. Check Brand table structure (if it exists)
SELECT 'Brand Table Structure:' AS Info;
DESCRIBE Brands;
-- OR if table name is 'Brand' (singular)
-- DESCRIBE Brand;

-- 3. Check all columns in Medicines table
SELECT 'Medicines Table Structure:' AS Info;
DESCRIBE Medicines;

-- 4. Check if BrandId column exists in Medicines table
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_KEY,
    EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'smart_inventory_db'
    AND TABLE_NAME = 'Medicines'
    AND COLUMN_NAME = 'BrandId';

-- 5. Check foreign key constraints for BrandId
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'smart_inventory_db'
    AND TABLE_NAME = 'Medicines'
    AND COLUMN_NAME = 'BrandId';

-- 6. Show all data from Brands table (if exists)
SELECT 'Brands Data:' AS Info;
SELECT * FROM Brands;
-- OR if table name is 'Brand' (singular)
-- SELECT * FROM Brand;

-- 7. Show sample medicines with BrandId
SELECT 
    Id,
    Name,
    BrandId,
    CategoryId,
    UnitPrice
FROM Medicines
LIMIT 10;

-- 8. Count medicines by BrandId
SELECT 
    BrandId,
    COUNT(*) AS MedicineCount
FROM Medicines
GROUP BY BrandId;

-- 9. Check for medicines with NULL BrandId
SELECT 
    COUNT(*) AS MedicinesWithNullBrandId
FROM Medicines
WHERE BrandId IS NULL;

-- 10. Check for medicines with invalid BrandId (orphaned references)
SELECT 
    m.Id,
    m.Name,
    m.BrandId
FROM Medicines m
LEFT JOIN Brands b ON m.BrandId = b.Id
WHERE m.BrandId IS NOT NULL AND b.Id IS NULL;

