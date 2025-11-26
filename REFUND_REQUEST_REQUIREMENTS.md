# Refund Request System - Requirements

## Overview
A Refund Request system allows customers to request refunds for their orders. This document outlines all components needed to implement this feature.

## Backend Components Required

### 1. **Model** (`RefundRequest.cs`)
Location: `backend/PharmacyInventory.API/Models/RefundRequest.cs`

**Required Properties:**
- `Id` (int) - Primary key
- `OrderId` (int) - Foreign key to Order
- `UserId` (int) - Foreign key to User (customer who requested)
- `Reason` (string) - Reason for refund request
- `Status` (string) - Status: "Pending", "Approved", "Rejected", "Processing", "Completed"
- `RequestDate` (DateTime) - When the request was created
- `ResponseDate` (DateTime?) - When admin responded
- `RefundAmount` (decimal) - Amount to be refunded
- `RefundMethod` (string) - How refund will be processed: "Original Payment Method", "Cash", "Wallet", "Credit"
- `Notes` (string?) - Admin notes
- `AdminId` (int?) - Admin who processed the request
- Navigation properties: `Order`, `User`, `Admin` (User)

### 2. **DTOs** (`RefundRequestDTOs.cs`)
Location: `backend/PharmacyInventory.API/DTOs/RefundRequestDTOs.cs`

**Required DTOs:**
- `RefundRequestDto` - For returning refund request details
- `CreateRefundRequestDto` - For creating a new refund request
- `UpdateRefundRequestStatusDto` - For admin to approve/reject/update status
- `RefundRequestItemDto` - For including order item details in refund

### 3. **Controller** (`RefundRequestsController.cs`)
Location: `backend/PharmacyInventory.API/Controllers/RefundRequestsController.cs`

**Required Endpoints:**
- `GET /api/refundrequests` - Get all refund requests (Admin/Pharmacist only)
- `GET /api/refundrequests/{id}` - Get specific refund request
- `GET /api/refundrequests/by-user/{userId}` - Get refund requests for a user
- `GET /api/refundrequests/by-order/{orderId}` - Get refund requests for an order
- `POST /api/refundrequests` - Create a new refund request (Customer)
- `PUT /api/refundrequests/{id}/approve` - Approve refund request (Admin/Pharmacist)
- `PUT /api/refundrequests/{id}/reject` - Reject refund request (Admin/Pharmacist)
- `PUT /api/refundrequests/{id}/status` - Update refund status (Admin/Pharmacist)

### 4. **Database Migration**
- Create migration to add `RefundRequests` table
- Add DbSet to `AppDbContext.cs`
- Configure entity relationships in `OnModelCreating`

### 5. **Business Logic Requirements**

**Validation Rules:**
- Order must exist and be in a refundable status (e.g., "Paid" or "Completed")
- Order must have been placed within refund window (e.g., 7-30 days)
- Refund amount cannot exceed order total
- Cannot create duplicate pending refund requests for same order
- User can only request refunds for their own orders

**Refund Processing:**
- When approved, update order status (e.g., to "Refunded")
- Restore inventory quantities for refunded items
- Update payment records if needed
- Send notifications to customer

## Frontend Components Required

### 1. **API Service Methods** (`api.js`)
Location: `frontend/src/services/api.js`

**Required Methods:**
- `createRefundRequest(orderId, data)` - Create refund request
- `getRefundRequests()` - Get all refund requests (admin)
- `getRefundRequest(id)` - Get specific refund request
- `getUserRefundRequests(userId)` - Get user's refund requests
- `approveRefundRequest(id, data)` - Approve refund
- `rejectRefundRequest(id, data)` - Reject refund
- `updateRefundRequestStatus(id, status)` - Update status

### 2. **Customer Components**

**RefundRequestForm.jsx**
- Form for customers to create refund requests
- Show order details
- Allow selecting items to refund (partial refunds)
- Reason selection/input
- Validation

**UserRefundRequests.jsx**
- List user's refund requests
- Show status, dates, amounts
- View details

### 3. **Admin Components**

**RefundRequestsManagement.jsx**
- List all refund requests
- Filter by status
- View request details
- Approve/Reject actions
- Update status
- Show order and customer information

**RefundRequestDetails.jsx**
- Detailed view of refund request
- Order items breakdown
- Customer information
- Action buttons (Approve/Reject)
- Status history

### 4. **Integration Points**

**Order Details Page:**
- Add "Request Refund" button (if order is refundable)
- Show refund request status if exists

**User Dashboard:**
- Link to refund requests
- Show pending refund requests count

**Admin Dashboard:**
- Show pending refund requests count
- Quick access to refund management

## Database Schema

```sql
CREATE TABLE RefundRequests (
    Id INT PRIMARY KEY IDENTITY(1,1),
    OrderId INT NOT NULL,
    UserId INT NOT NULL,
    Reason NVARCHAR(500) NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    RequestDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ResponseDate DATETIME2 NULL,
    RefundAmount DECIMAL(12,2) NOT NULL,
    RefundMethod NVARCHAR(50) NULL,
    Notes NVARCHAR(1000) NULL,
    AdminId INT NULL,
    FOREIGN KEY (OrderId) REFERENCES Orders(Id),
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (AdminId) REFERENCES Users(Id)
);
```

## Status Flow

```
Pending → Approved → Processing → Completed
Pending → Rejected
```

## Additional Considerations

1. **Partial Refunds**: Support refunding specific order items
2. **Refund Reasons**: Predefined list (Defective, Wrong Item, Not Received, etc.)
3. **Notifications**: Email/SMS notifications for status changes
4. **Refund History**: Track all refund operations
5. **Inventory Management**: Restore stock when refund is approved
6. **Payment Gateway Integration**: If using online payments, integrate with payment provider's refund API
7. **Time Limits**: Enforce refund request deadlines (e.g., 7 days after delivery)
8. **Documentation**: Attach proof/receipts if needed

## Security & Authorization

- Customers can only create/view their own refund requests
- Admin/Pharmacist can view all and manage refund requests
- Validate order ownership before allowing refund request creation
- Audit trail for refund operations

## Testing Requirements

- Unit tests for controller actions
- Integration tests for refund workflow
- Validation tests
- Authorization tests
- Edge cases (partial refunds, multiple requests, etc.)


