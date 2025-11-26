# Migration Guide - Smart Inventory & Expiry Management API

## Prerequisites

1. **XAMPP** installed and running
2. **MySQL** service running in XAMPP
3. **.NET 8.0 SDK** installed
4. Database `smart_inventory_db` created (see SQL script below)

## Database Setup

### Step 1: Create Database

Run the following SQL script in phpMyAdmin or MySQL command line:

```sql
CREATE DATABASE IF NOT EXISTS smart_inventory_db;
USE smart_inventory_db;
```

Then run all the CREATE TABLE statements from the provided database schema.

### Step 2: Update Connection String

The connection string in `appsettings.json` is already configured:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=smart_inventory_db;User=root;Password=;Port=3306;"
}
```

**Note:** If your MySQL password is not empty, update the connection string accordingly.

## EF Core Migrations

### Create Initial Migration

```bash
cd backend/PharmacyInventory.API
dotnet ef migrations add InitialCreate
```

### Apply Migrations to Database

```bash
dotnet ef database update
```

### Remove Last Migration (if needed)

```bash
dotnet ef migrations remove
```

## Running the API

### Development Mode

```bash
cd backend/PharmacyInventory.API
dotnet run
```

The API will be available at:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `https://localhost:5001/swagger`

### Production Build

```bash
dotnet build --configuration Release
dotnet run --configuration Release
```

## API Endpoints

### Authentication (No Auth Required)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Medicines (Auth Required)
- `GET /api/medicines` - Get all medicines (optional: ?categoryId=1)
- `GET /api/medicines/{id}` - Get medicine by ID
- `POST /api/medicines` - Create medicine (Admin/Pharmacist only)
- `PUT /api/medicines/{id}` - Update medicine (Admin/Pharmacist only)
- `DELETE /api/medicines/{id}` - Delete medicine (Admin/Pharmacist only)

### Batches (Auth Required)
- `GET /api/batches` - Get all batches (optional: ?medicineId=1)
- `GET /api/batches/{id}` - Get batch by ID
- `GET /api/batches/fefo/{medicineId}` - Get batches sorted by FEFO (First Expiry First Out)
- `POST /api/batches` - Create batch (Admin/Pharmacist only)
- `PUT /api/batches/{id}` - Update batch (Admin/Pharmacist only)
- `DELETE /api/batches/{id}` - Delete batch (Admin/Pharmacist only)

### Categories (Auth Required)
- `GET /api/categories` - Get all categories
- `GET /api/categories/{id}` - Get category by ID
- `POST /api/categories` - Create category (Admin/Pharmacist only)
- `PUT /api/categories/{id}` - Update category (Admin/Pharmacist only)
- `DELETE /api/categories/{id}` - Delete category (Admin/Pharmacist only)

### Suppliers (Auth Required)
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/{id}` - Get supplier by ID
- `POST /api/suppliers` - Create supplier (Admin/Pharmacist only)
- `PUT /api/suppliers/{id}` - Update supplier (Admin/Pharmacist only)
- `DELETE /api/suppliers/{id}` - Delete supplier (Admin/Pharmacist only)

### Cart (Auth Required)
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/{itemId}` - Update cart item quantity
- `DELETE /api/cart/items/{itemId}` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

### Orders (Auth Required)
- `GET /api/orders` - Get orders (optional: ?status=Pending)
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders` - Create order from cart (uses FEFO)
- `PUT /api/orders/{id}/status` - Update order status (Admin/Pharmacist only)

### Payments (Auth Required)
- `GET /api/payments` - Get all payments (Admin/Pharmacist only, optional: ?orderId=1)
- `GET /api/payments/{id}` - Get payment by ID
- `POST /api/payments` - Create payment

### Expiry Alerts (Admin/Pharmacist Only)
- `GET /api/expiryalerts` - Get all alerts (optional: ?unresolvedOnly=true)
- `GET /api/expiryalerts/{id}` - Get alert by ID
- `PUT /api/expiryalerts/{id}/resolve` - Resolve/unresolve alert
- `POST /api/expiryalerts/check-all` - Manually check all batches for expiry

## Authentication

### Register User

```json
POST /api/auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "role": "Customer"
}
```

### Login

```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response includes JWT token:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "john@example.com",
  "fullName": "John Doe",
  "role": "Customer",
  "userId": 1
}
```

### Using JWT Token

Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Key Features

### FEFO (First Expiry First Out)
- Orders automatically use FEFO when processing cart items
- Batches are sorted by expiry date (earliest first)
- Available via `/api/batches/fefo/{medicineId}` endpoint

### Expiry Alerts
- Automatically created when batches are added/updated
- Alerts for batches expiring within 30 days
- Alerts for expired batches
- Can be manually checked via `/api/expiryalerts/check-all`

### Stock Management
- Stock is tracked per batch
- Orders reduce batch quantities
- FEFO ensures oldest stock is used first

## Troubleshooting

### Connection Issues
- Ensure MySQL is running in XAMPP
- Check connection string in `appsettings.json`
- Verify database exists: `SHOW DATABASES;`

### Migration Issues
- Ensure EF Core tools are installed: `dotnet tool install --global dotnet-ef`
- If migrations fail, check MySQL version compatibility
- Use `dotnet ef database update --verbose` for detailed errors

### JWT Token Issues
- Check `JwtSettings` in `appsettings.json`
- Ensure token is included in Authorization header
- Token expires after 60 minutes (configurable)

## Notes

- DateOnly is used for expiry dates (requires .NET 6+)
- All timestamps are stored in UTC
- Password hashing uses BCrypt
- CORS is configured for React apps on ports 3000 and 5173

