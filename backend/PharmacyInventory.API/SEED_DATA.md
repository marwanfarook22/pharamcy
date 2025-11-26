# Database Seed Data

This document describes the seed data that will be automatically populated when the application starts.

## Overview

The `DbSeeder` class automatically seeds the database with initial test data when the application starts, but **only if the tables are empty**. This ensures you don't lose existing data and prevents duplicate entries.

## Seeded Data

### Users (4 users)

| Email | Password | Role | Full Name |
|-------|----------|------|-----------|
| admin@pharmacy.com | Admin123! | Admin | Admin User |
| pharmacist@pharmacy.com | Pharmacist123! | Pharmacist | John Pharmacist |
| customer@example.com | Customer123! | Customer | Sarah Customer |
| mike@example.com | Customer123! | Customer | Mike Johnson |

**Note:** All passwords are hashed using BCrypt, matching the authentication system.

### Categories (8 categories)

1. **Pain Relief** - Medications for pain management and relief
2. **Antibiotics** - Antibacterial medications for treating infections
3. **Vitamins & Supplements** - Nutritional supplements and vitamins
4. **Cold & Flu** - Medications for cold and flu symptoms
5. **Digestive Health** - Medications for digestive system health
6. **Cardiovascular** - Medications for heart and blood pressure
7. **Diabetes** - Medications for diabetes management
8. **Skin Care** - Topical medications and skin treatments

### Suppliers (5 suppliers)

1. **PharmaCorp International**
   - Email: contact@pharmacorp.com
   - Phone: +1-800-555-0101

2. **MedSupply Co.**
   - Email: sales@medsupply.com
   - Phone: +1-800-555-0102

3. **Global Pharmaceuticals**
   - Email: info@globalpharma.com
   - Phone: +1-800-555-0103

4. **BioMed Solutions**
   - Email: orders@biomed.com
   - Phone: +1-800-555-0104

5. **HealthFirst Distributors**
   - Email: support@healthfirst.com
   - Phone: +1-800-555-0105

### Medicines (23 medicines)

The seeder creates 23 different medicines across all categories:

#### Pain Relief (4 medicines)
- Paracetamol 500mg - $5.99
- Ibuprofen 400mg - $8.49
- Aspirin 100mg - $4.99
- Naproxen 250mg - $9.99

#### Antibiotics (3 medicines)
- Amoxicillin 500mg - $12.99
- Azithromycin 250mg - $15.99
- Ciprofloxacin 500mg - $18.99

#### Vitamins & Supplements (4 medicines)
- Vitamin D3 1000 IU - $7.99
- Vitamin C 1000mg - $6.49
- Multivitamin Complex - $11.99
- Calcium + Vitamin D - $9.49

#### Cold & Flu (3 medicines)
- Cold & Flu Relief - $8.99
- Cough Syrup - $6.99
- Nasal Decongestant - $5.49

#### Digestive Health (3 medicines)
- Antacid Tablets - $4.99
- Probiotics 10 Billion CFU - $14.99
- Laxative Tablets - $5.99

#### Cardiovascular (2 medicines)
- Aspirin 81mg (Low Dose) - $6.99
- Omega-3 Fish Oil - $12.99

#### Diabetes (2 medicines)
- Blood Glucose Test Strips - $24.99
- Metformin 500mg - $9.99

#### Skin Care (3 medicines)
- Hydrocortisone Cream 1% - $7.49
- Antibacterial Ointment - $5.99
- Moisturizing Lotion - $8.99

## How It Works

1. **Automatic Seeding**: The seeder runs automatically when the application starts
2. **Idempotent**: It only seeds if tables are empty (checks `AnyAsync()`)
3. **Safe**: Won't overwrite existing data or create duplicates
4. **Error Handling**: Logs errors if seeding fails but doesn't crash the app

## Usage

### First Time Setup

1. **Drop and recreate database** (if needed):
   ```sql
   DROP DATABASE IF EXISTS smart_inventory_db;
   CREATE DATABASE smart_inventory_db;
   ```

2. **Run migrations**:
   ```bash
   cd backend/PharmacyInventory.API
   dotnet ef database update
   ```

3. **Start the application**:
   ```bash
   dotnet run
   ```

   The seeder will automatically populate the database on first startup.

### Testing Login Credentials

After seeding, you can test the application with these credentials:

**Admin Access:**
- Email: `admin@pharmacy.com`
- Password: `Admin123!`

**Pharmacist Access:**
- Email: `pharmacist@pharmacy.com`
- Password: `Pharmacist123!`

**Customer Access:**
- Email: `customer@example.com`
- Password: `Customer123!`

## Customization

To modify the seed data, edit `backend/PharmacyInventory.API/Data/DbSeeder.cs`. The seeder checks if data exists before adding, so you can:

- Add more users, categories, suppliers, or medicines
- Modify existing seed data
- Change prices, descriptions, etc.

**Important:** The seeder only runs if tables are empty. To re-seed:
1. Clear the specific tables you want to re-seed
2. Restart the application

## File Location

- **Seeder Class**: `backend/PharmacyInventory.API/Data/DbSeeder.cs`
- **Integration**: `backend/PharmacyInventory.API/Program.cs` (lines 68-82)

