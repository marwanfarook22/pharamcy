using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmacyInventory.API.Data;
using PharmacyInventory.API.DTOs;
using PharmacyInventory.API.Models;
using System.Security.Claims;

namespace PharmacyInventory.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly AppDbContext _context;

    public MessagesController(AppDbContext context)
    {
        _context = context;
    }

    // Get all messages for the current user
    [HttpGet("my-messages")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMyMessages([FromQuery] bool? unreadOnly)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        var query = _context.Messages
            .Include(m => m.Admin)
            .Where(m => m.UserId == userId);

        if (unreadOnly == true)
        {
            query = query.Where(m => !m.IsRead);
        }

        var messages = await query
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();

        var result = messages.Select(m => new MessageDto
        {
            Id = m.Id,
            UserId = m.UserId,
            UserName = null, // Not needed for user's own messages
            AdminId = m.AdminId,
            AdminName = m.Admin?.FullName,
            Subject = m.Subject,
            Content = m.Content,
            IsRead = m.IsRead,
            CreatedAt = m.CreatedAt,
            ReadAt = m.ReadAt
        }).ToList();

        return Ok(result);
    }

    // Get a specific message by ID (user can only get their own messages)
    [HttpGet("{id}")]
    public async Task<ActionResult<MessageDto>> GetMessage(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "";

        var message = await _context.Messages
            .Include(m => m.Admin)
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (message == null)
        {
            return NotFound(new { message = "Message not found" });
        }

        // Users can only access their own messages, admins can access any
        if (userRole != "Admin" && message.UserId != userId)
        {
            return Forbid();
        }

        var result = new MessageDto
        {
            Id = message.Id,
            UserId = message.UserId,
            UserName = message.User?.FullName,
            AdminId = message.AdminId,
            AdminName = message.Admin?.FullName,
            Subject = message.Subject,
            Content = message.Content,
            IsRead = message.IsRead,
            CreatedAt = message.CreatedAt,
            ReadAt = message.ReadAt
        };

        return Ok(result);
    }

    // Mark message as read/unread
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id, [FromBody] MarkAsReadDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "";

        var message = await _context.Messages.FindAsync(id);

        if (message == null)
        {
            return NotFound(new { message = "Message not found" });
        }

        // Users can only mark their own messages, admins can mark any
        if (userRole != "Admin" && message.UserId != userId)
        {
            return Forbid();
        }

        message.IsRead = dto.IsRead;
        message.ReadAt = dto.IsRead ? DateTime.UtcNow : null;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // Admin: Send message to a single user
    [HttpPost]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<MessageDto>> SendMessage([FromBody] CreateMessageDto createDto)
    {
        var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        // Verify user exists
        var user = await _context.Users.FindAsync(createDto.UserId);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var message = new Message
        {
            UserId = createDto.UserId,
            AdminId = adminId,
            Subject = createDto.Subject,
            Content = createDto.Content,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        var result = new MessageDto
        {
            Id = message.Id,
            UserId = message.UserId,
            UserName = user.FullName,
            AdminId = message.AdminId,
            AdminName = null, // Will be populated if needed
            Subject = message.Subject,
            Content = message.Content,
            IsRead = message.IsRead,
            CreatedAt = message.CreatedAt,
            ReadAt = message.ReadAt
        };

        return CreatedAtAction(nameof(GetMessage), new { id = message.Id }, result);
    }

    // Admin: Send message to multiple users
    [HttpPost("send-to-multiple")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<object>> SendMessageToMultiple([FromBody] SendMessageToMultipleDto createDto)
    {
        var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        if (createDto.UserIds == null || createDto.UserIds.Count == 0)
        {
            return BadRequest(new { message = "At least one user ID is required" });
        }

        // Verify all users exist
        var users = await _context.Users
            .Where(u => createDto.UserIds.Contains(u.Id))
            .ToListAsync();

        if (users.Count != createDto.UserIds.Count)
        {
            return BadRequest(new { message = "One or more users not found" });
        }

        var messages = createDto.UserIds.Select(userId => new Message
        {
            UserId = userId,
            AdminId = adminId,
            Subject = createDto.Subject,
            Content = createDto.Content,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        _context.Messages.AddRange(messages);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Message sent to {messages.Count} user(s)",
            count = messages.Count
        });
    }

    // Admin: Get all messages (for admin dashboard)
    [HttpGet]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetAllMessages([FromQuery] int? userId, [FromQuery] bool? unreadOnly)
    {
        var query = _context.Messages
            .Include(m => m.User)
            .Include(m => m.Admin)
            .AsQueryable();

        if (userId.HasValue)
        {
            query = query.Where(m => m.UserId == userId.Value);
        }

        if (unreadOnly == true)
        {
            query = query.Where(m => !m.IsRead);
        }

        var messages = await query
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();

        var result = messages.Select(m => new MessageDto
        {
            Id = m.Id,
            UserId = m.UserId,
            UserName = m.User?.FullName,
            AdminId = m.AdminId,
            AdminName = m.Admin?.FullName,
            Subject = m.Subject,
            Content = m.Content,
            IsRead = m.IsRead,
            CreatedAt = m.CreatedAt,
            ReadAt = m.ReadAt
        }).ToList();

        return Ok(result);
    }

    // Admin: Delete a message
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> DeleteMessage(int id)
    {
        var message = await _context.Messages.FindAsync(id);

        if (message == null)
        {
            return NotFound(new { message = "Message not found" });
        }

        _context.Messages.Remove(message);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // Get unread message count for current user
    [HttpGet("unread-count")]
    public async Task<ActionResult<object>> GetUnreadCount()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var count = await _context.Messages
            .CountAsync(m => m.UserId == userId && !m.IsRead);

        return Ok(new { count });
    }
}

