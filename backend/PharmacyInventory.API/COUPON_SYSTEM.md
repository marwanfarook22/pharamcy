# Coupon/Sales System

## Summary

A comprehensive coupon and sales system has been implemented that allows administrators to create, manage, and send discount coupons to users.

## Features

### Discount Types
- **Percentage Discount**: 10%, 25%, 50%, 75%, etc. (with optional maximum discount cap)
- **Fixed Amount Discount**: $5, $10, $20, etc.
- **Free Shipping**: Removes shipping cost from order

### Coupon Management
- Create coupons with custom codes
- Set discount values and types
- Configure minimum purchase requirements
- Set maximum discount caps (for percentage discounts)
- Set start and end dates
- Set usage limits (total number of uses)
- Activate/Deactivate coupons
- View usage statistics
- Delete unused coupons

### Admin Features
- **Coupon Management Dashboard**: Full CRUD operations for coupons
- **Send Coupons via Messages**: Include coupon codes in messages to users
- **Bulk Operations**: Send coupons to multiple users at once

### User Features
- Apply coupon codes during checkout
- Real-time coupon validation
- See discount amount before placing order
- Automatic discount calculation

## Database Schema

### Coupon Table
- `Id` (Primary Key)
- `Code` (Unique, Max 50 chars)
- `Name` (Max 200 chars)
- `DiscountType` (Percentage, FixedAmount, FreeShipping)
- `DiscountValue` (decimal)
- `MinimumPurchase` (nullable decimal)
- `MaximumDiscount` (nullable decimal)
- `StartDate` (DateTime)
- `EndDate` (nullable DateTime)
- `UsageLimit` (nullable int)
- `UsedCount` (int, default 0)
- `IsActive` (bool, default true)
- `CreatedAt` (DateTime)
- `CreatedByAdminId` (nullable int, FK to Users)

### Order Table Updates
- `CouponId` (nullable int, FK to Coupons)
- `DiscountAmount` (nullable decimal)

## API Endpoints

### Coupon Endpoints

**Admin Only:**
- `GET /api/coupons` - Get all coupons (with optional activeOnly filter)
- `GET /api/coupons/{id}` - Get specific coupon
- `POST /api/coupons` - Create new coupon
- `PUT /api/coupons/{id}` - Update coupon
- `PATCH /api/coupons/{id}/toggle-status` - Toggle active status
- `DELETE /api/coupons/{id}` - Delete coupon (only if unused)

**Public (Authenticated):**
- `GET /api/coupons/active` - Get all active coupons
- `POST /api/coupons/validate` - Validate coupon code

### Order Endpoints (Updated)
- `POST /api/orders` - Now accepts optional `couponCode` parameter

## Usage Examples

### Create Percentage Discount Coupon
```json
{
  "code": "SAVE25",
  "name": "25% Off Sale",
  "discountType": "Percentage",
  "discountValue": 25,
  "minimumPurchase": 50,
  "maximumDiscount": 20,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "usageLimit": 100
}
```

### Create Fixed Amount Coupon
```json
{
  "code": "SAVE10",
  "name": "$10 Off",
  "discountType": "FixedAmount",
  "discountValue": 10,
  "minimumPurchase": 30,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": null,
  "usageLimit": null
}
```

### Create Free Shipping Coupon
```json
{
  "code": "FREESHIP",
  "name": "Free Shipping",
  "discountType": "FreeShipping",
  "discountValue": 0,
  "minimumPurchase": 25,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": null,
  "usageLimit": 500
}
```

## Validation Rules

1. **Coupon Code**: Must be unique, case-insensitive
2. **Percentage Discount**: Value must be between 0-100
3. **Fixed Amount**: Value must be positive
4. **Date Validation**: 
   - Start date must be in the future or present
   - End date must be after start date (if provided)
5. **Usage Limit**: Must be positive integer (if provided)
6. **Minimum Purchase**: Must be positive (if provided)
7. **Maximum Discount**: Must be positive (if provided, for percentage discounts)

## Coupon Application Logic

1. **Percentage Discount**:
   - Calculates: `discount = subtotal × (percentage / 100)`
   - Applies maximum discount cap if set
   - Cannot exceed subtotal

2. **Fixed Amount Discount**:
   - Applies fixed discount amount
   - Cannot exceed subtotal

3. **Free Shipping**:
   - Sets shipping cost to $0
   - Discount amount equals shipping cost

## Frontend Components

1. **CouponManagement.jsx**: Admin dashboard for managing coupons
2. **Checkout.jsx**: Updated to accept and validate coupon codes
3. **MessageManagement.jsx**: Updated to include coupon codes in messages

## Next Steps

1. **Create Database Migration**:
   ```bash
   cd backend/PharmacyInventory.API
   dotnet ef migrations add AddCouponSystem
   dotnet ef database update
   ```

2. **Test the System**:
   - Create coupons from admin dashboard
   - Send coupons to users via messages
   - Apply coupons during checkout
   - Verify discount calculations

## Notes

- Coupons are case-insensitive (automatically converted to uppercase)
- Coupon usage is tracked automatically
- Expired or inactive coupons cannot be applied
- Coupons with reached usage limits cannot be applied
- Minimum purchase requirements are validated before applying discount
- Free shipping coupons override shipping cost calculation

