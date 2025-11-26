# Messages Feature - Admin to User Messaging

## Summary

A complete messaging system has been added to allow administrators to send messages to users. Users can view, read, and manage messages they receive from admins.

## What Was Added

### Backend

1. **Model**: `Models/Message.cs`
   - Properties: Id, UserId, AdminId, Subject, Content, IsRead, CreatedAt, ReadAt
   - Navigation properties to User (recipient) and Admin (sender)

2. **DTOs**: `DTOs/MessageDTOs.cs`
   - `MessageDto` - For displaying messages
   - `CreateMessageDto` - For creating a single message
   - `SendMessageToMultipleDto` - For sending to multiple users
   - `MarkAsReadDto` - For marking messages as read/unread

3. **Controller**: `Controllers/MessagesController.cs`
   - `GET /api/messages/my-messages` - Get current user's messages (with optional unread filter)
   - `GET /api/messages/{id}` - Get specific message
   - `PUT /api/messages/{id}/read` - Mark message as read/unread
   - `GET /api/messages/unread-count` - Get unread message count
   - `POST /api/messages` - Admin: Send message to single user
   - `POST /api/messages/send-to-multiple` - Admin: Send message to multiple users
   - `GET /api/messages` - Admin: Get all messages (with filters)
   - `DELETE /api/messages/{id}` - Admin: Delete message

4. **DbContext**: Updated `Data/AppDbContext.cs`
   - Added `DbSet<Message> Messages`
   - Added entity configuration in `OnModelCreating`

### Frontend

1. **Component**: `components/messages/Messages.jsx`
   - User-friendly interface to view messages
   - Filter by all/unread/read
   - View message details in modal
   - Mark messages as read/unread
   - Shows unread count badge

2. **API Integration**: Updated `services/api.js`
   - Added `messagesAPI` with all message-related endpoints

3. **Navigation**: Updated `components/layout/Navbar.jsx`
   - Added Messages link with unread count badge
   - Auto-refreshes unread count every 30 seconds

4. **Routing**: Updated `App.jsx`
   - Added route `/messages` for the Messages page

5. **Admin Feature**: Updated `components/admin/UserManagement.jsx`
   - Added "Send Message" button for each user
   - Modal form to compose and send messages to users

## Database Setup

### Option 1: Using SQL Script (Quick Setup)

Run the SQL script to create the table:

```bash
mysql -u root -p smart_inventory_db < create-messages-table.sql
```

Or manually in phpMyAdmin/MySQL:

```sql
USE smart_inventory_db;
SOURCE create-messages-table.sql;
```

### Option 2: Using Entity Framework Migrations (Recommended)

1. **Create Migration**:
   ```bash
   cd backend/PharmacyInventory.API
   dotnet ef migrations add AddMessagesTable
   ```

2. **Apply Migration**:
   ```bash
   dotnet ef database update
   ```

## Features

### For Users

- View all messages from admins
- Filter messages (all/unread/read)
- See unread message count in navigation
- Open message details in modal
- Mark messages as read/unread
- View sender name and timestamp

### For Admins

- Send messages to individual users from User Management page
- Send messages to multiple users at once (via API)
- View all messages sent to users
- Delete messages
- Filter messages by user or read status

## API Endpoints

### User Endpoints (Requires Authentication)

- `GET /api/messages/my-messages?unreadOnly=true` - Get user's messages
- `GET /api/messages/{id}` - Get specific message
- `PUT /api/messages/{id}/read` - Mark as read/unread
- `GET /api/messages/unread-count` - Get unread count

### Admin Endpoints (Requires Admin/Pharmacist Role)

- `POST /api/messages` - Send message to single user
- `POST /api/messages/send-to-multiple` - Send to multiple users
- `GET /api/messages?userId=1&unreadOnly=true` - Get all messages (with filters)
- `DELETE /api/messages/{id}` - Delete message

## Usage Examples

### Send Message to Single User (Admin)

```javascript
await messagesAPI.sendMessage({
  userId: 5,
  subject: "Order Update",
  content: "Your order #123 has been shipped!"
});
```

### Send Message to Multiple Users (Admin)

```javascript
await messagesAPI.sendToMultiple({
  userIds: [1, 2, 3, 4, 5],
  subject: "System Maintenance",
  content: "The system will be under maintenance on Sunday."
});
```

### Get User's Messages

```javascript
// Get all messages
const response = await messagesAPI.getMyMessages();

// Get only unread messages
const unreadResponse = await messagesAPI.getMyMessages(true);
```

### Mark Message as Read

```javascript
await messagesAPI.markAsRead(messageId, true); // Mark as read
await messagesAPI.markAsRead(messageId, false); // Mark as unread
```

## Testing

1. **Start the backend API**:
   ```bash
   cd backend/PharmacyInventory.API
   dotnet run
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test as Admin**:
   - Login as admin
   - Go to Admin Dashboard > User Management
   - Click the mail icon next to a user
   - Send a test message

4. **Test as User**:
   - Login as a regular user
   - Click "Messages" in the sidebar
   - View the message sent by admin
   - Mark it as read

## Notes

- Messages are stored with UTC timestamps
- Unread count refreshes every 30 seconds in the navbar
- Users can only access their own messages
- Admins can access all messages
- Messages are soft-deleted (can be restored if needed)
- Maximum subject length: 200 characters
- Maximum content length: 2000 characters

