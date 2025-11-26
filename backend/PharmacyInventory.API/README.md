# Smart Inventory & Expiry Management - Pharmacy Store API

ASP.NET Core 8.0 Web API for managing pharmacy inventory with expiry tracking, FEFO (First Expiry First Out) ordering, and automated expiry alerts.

## Features

- ✅ JWT Authentication & Authorization
- ✅ Medicine & Batch Management
- ✅ FEFO (First Expiry First Out) Order Processing
- ✅ Automated Expiry Alerts (30 days & expired)
- ✅ Shopping Cart & Order Management
- ✅ Payment Processing
- ✅ Category & Supplier Management
- ✅ Role-based Access Control (Admin, Pharmacist, Customer)
- ✅ MySQL Database with EF Core (Pomelo)

## Quick Start

### 1. Database Setup

Ensure XAMPP MySQL is running, then create the database:

```sql
CREATE DATABASE IF NOT EXISTS smart_inventory_db;
USE smart_inventory_db;
```

Run the provided SQL script to create all tables.

### 2. Install EF Core Tools (if not already installed)

```bash
dotnet tool install --global dotnet-ef
```

### 3. Create and Apply Migrations

```bash
cd backend/PharmacyInventory.API
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 4. Run the API

```bash
dotnet run
```

API will be available at:
- Swagger UI: `https://localhost:5001/swagger`
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`

## Project Structure

```
PharmacyInventory.API/
├── Controllers/          # API Controllers
│   ├── AuthController.cs
│   ├── MedicinesController.cs
│   ├── BatchesController.cs
│   ├── CategoriesController.cs
│   ├── SuppliersController.cs
│   ├── CartController.cs
│   ├── OrdersController.cs
│   ├── PaymentsController.cs
│   └── ExpiryAlertsController.cs
├── Models/              # Entity Models
│   ├── User.cs
│   ├── Medicine.cs
│   ├── MedicineBatch.cs
│   ├── Category.cs
│   ├── Supplier.cs
│   ├── Cart.cs
│   ├── CartItem.cs
│   ├── Order.cs
│   ├── OrderItem.cs
│   ├── Payment.cs
│   └── ExpiryAlert.cs
├── DTOs/                # Data Transfer Objects
│   ├── AuthDTOs.cs
│   ├── MedicineDTOs.cs
│   ├── BatchDTOs.cs
│   ├── CategoryDTOs.cs
│   ├── SupplierDTOs.cs
│   ├── CartDTOs.cs
│   ├── OrderDTOs.cs
│   ├── PaymentDTOs.cs
│   └── ExpiryAlertDTOs.cs
├── Data/
│   └── AppDbContext.cs  # EF Core DbContext
├── Services/
│   ├── IAuthService.cs
│   └── AuthService.cs
├── Program.cs           # Application entry point
└── appsettings.json     # Configuration
```

## API Documentation

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed API endpoint documentation.

## Configuration

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=smart_inventory_db;User=root;Password=;Port=3306;"
  },
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyForPharmacyInventorySystem2024!",
    "Issuer": "PharmacyInventoryAPI",
    "Audience": "PharmacyInventoryClient",
    "ExpirationInMinutes": 60
  }
}
```

## Key Implementation Details

### FEFO (First Expiry First Out)
- Orders automatically process batches by expiry date (earliest first)
- Ensures oldest stock is sold first
- Available via `/api/batches/fefo/{medicineId}` endpoint

### Expiry Alerts
- Automatically created when batches are added/updated
- Alerts for batches expiring within 30 days
- Alerts for expired batches
- Can be manually triggered via `/api/expiryalerts/check-all`

### Stock Management
- Stock tracked per batch
- Orders reduce batch quantities using FEFO
- Stock availability checked before adding to cart

### Authentication
- JWT-based authentication
- Password hashing with BCrypt
- Role-based authorization (Admin, Pharmacist, Customer)

## Testing with Swagger

1. Start the API: `dotnet run`
2. Navigate to: `https://localhost:5001/swagger`
3. Register a user: `POST /api/auth/register`
4. Login: `POST /api/auth/login` (copy the token)
5. Click "Authorize" button in Swagger
6. Enter: `Bearer <your-token>`
7. Test endpoints

## Common Commands

```bash
# Create migration
dotnet ef migrations add <MigrationName>

# Apply migrations
dotnet ef database update

# Remove last migration
dotnet ef migrations remove

# Build project
dotnet build

# Run project
dotnet run

# Clean build artifacts
dotnet clean
```

## Dependencies

- **.NET 8.0 SDK**
- **Pomelo.EntityFrameworkCore.MySql** (8.0.0) - MySQL provider for EF Core
- **Microsoft.EntityFrameworkCore** (8.0.0) - EF Core
- **Microsoft.AspNetCore.Authentication.JwtBearer** (8.0.0) - JWT authentication
- **BCrypt.Net-Next** (4.0.3) - Password hashing
- **Swashbuckle.AspNetCore** (6.5.0) - Swagger/OpenAPI

## Notes

- All timestamps stored in UTC
- DateOnly used for expiry dates (requires .NET 6+)
- CORS configured for React apps (ports 3000, 5173)
- JWT tokens expire after 60 minutes (configurable)

## License

This project is part of a graduation project for Smart Inventory & Expiry Management System.

