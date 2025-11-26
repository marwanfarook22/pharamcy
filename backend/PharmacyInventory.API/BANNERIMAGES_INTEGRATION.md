# BannerImages Table Integration

## Summary

The `bannerimages` table has been integrated into the Entity Framework codebase.

## What Was Added

1. **Model**: `Models/BannerImage.cs`
   - Properties: Id, ImageUrl, Title, Description, LinkUrl, IsActive, DisplayOrder, CreatedAt, UpdatedAt

2. **DbContext**: Updated `Data/AppDbContext.cs`
   - Added `DbSet<BannerImage> BannerImages`
   - Added entity configuration in `OnModelCreating`

## Verify Table Exists in Database

Run the SQL script to check if the table exists:
```sql
-- Run this in MySQL/phpMyAdmin
USE smart_inventory_db;
SHOW TABLES LIKE 'bannerimages';
DESCRIBE bannerimages;
```

Or use the provided script:
```bash
# Run the check script
mysql -u root -p smart_inventory_db < check-bannerimages-table.sql
```

## Next Steps

### Option 1: If Table Already Exists in Database

If you manually created the table and it already exists, you need to sync Entity Framework with the existing table:

1. **Create a migration that matches your existing table structure:**
   ```bash
   cd backend/PharmacyInventory.API
   dotnet ef migrations add AddBannerImagesTable
   ```

2. **Edit the migration file** to match your actual table structure (if different from the model)

3. **Mark the migration as applied** (since table already exists):
   ```bash
   dotnet ef database update --connection "Server=localhost;Database=smart_inventory_db;User=root;Password=;Port=3306;"
   ```
   
   Or manually mark it:
   ```sql
   INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
   VALUES ('20241123000000_AddBannerImagesTable', '8.0.0');
   ```

### Option 2: If Table Doesn't Exist Yet

If the table doesn't exist, create a migration and apply it:

```bash
cd backend/PharmacyInventory.API
dotnet ef migrations add AddBannerImagesTable
dotnet ef database update
```

## Expected Table Structure

Based on the model, the table should have these columns:
- `Id` (INT, Primary Key, Auto Increment)
- `ImageUrl` (VARCHAR(500), NOT NULL)
- `Title` (VARCHAR(200), NULLABLE)
- `Description` (VARCHAR(500), NULLABLE)
- `LinkUrl` (VARCHAR(500), NULLABLE)
- `IsActive` (BOOLEAN/TINYINT, Default: true)
- `DisplayOrder` (INT, Default: 0)
- `CreatedAt` (DATETIME)
- `UpdatedAt` (DATETIME, NULLABLE)

## If Your Table Structure is Different

If your manually created table has a different structure, you may need to:

1. Update the `BannerImage.cs` model to match your table
2. Update the entity configuration in `AppDbContext.cs`
3. Create a migration that matches your existing structure

## Testing

After integration, you can test by:

1. **Querying banner images:**
   ```csharp
   var banners = _context.BannerImages.Where(b => b.IsActive).OrderBy(b => b.DisplayOrder).ToList();
   ```

2. **Creating a Controller** (if needed):
   - Create `Controllers/BannerImagesController.cs`
   - Add CRUD endpoints for managing banner images

## Notes

- The table name in the database should be `BannerImages` (EF Core pluralizes by default) or `bannerimages` (if you created it with lowercase)
- If your table uses a different name, you can specify it in the entity configuration:
  ```csharp
  entity.ToTable("bannerimages"); // Use this if your table is lowercase
  ```





