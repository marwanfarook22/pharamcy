using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmacyInventory.API.Data;
using PharmacyInventory.API.DTOs;
using PharmacyInventory.API.Models;
using BCrypt.Net;

namespace PharmacyInventory.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Pharmacist")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers([FromQuery] string? role, [FromQuery] string? search)
    {
        var query = _context.Users.AsQueryable();

        // Filter by role if provided
        if (!string.IsNullOrEmpty(role))
        {
            query = query.Where(u => u.Role == role);
        }

        // Search by name or email
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(u => 
                u.FullName.Contains(search) || 
                u.Email.Contains(search));
        }

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        var result = users.Select(u => new UserDto
        {
            Id = u.Id,
            FullName = u.FullName,
            Email = u.Email,
            Phone = u.Phone,
            Role = u.Role,
            CreatedAt = u.CreatedAt,
            PurchaseCount = u.PurchaseCount
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var result = new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role,
            CreatedAt = user.CreatedAt,
            PurchaseCount = user.PurchaseCount
        };

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto createDto)
    {
        // Check if email already exists
        if (await _context.Users.AnyAsync(u => u.Email == createDto.Email))
        {
            return BadRequest(new { message = "Email already exists" });
        }

        // Validate role
        var validRoles = new[] { "Admin", "Pharmacist", "Customer" };
        if (!validRoles.Contains(createDto.Role))
        {
            return BadRequest(new { message = "Invalid role. Must be Admin, Pharmacist, or Customer" });
        }

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(createDto.Password);

        var user = new User
        {
            FullName = createDto.FullName,
            Email = createDto.Email,
            PasswordHash = passwordHash,
            Phone = createDto.Phone,
            Role = createDto.Role,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var result = new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role,
            CreatedAt = user.CreatedAt,
            PurchaseCount = user.PurchaseCount
        };

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updateDto)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // Check if email is being changed and if it already exists
        if (!string.IsNullOrEmpty(updateDto.Email) && updateDto.Email != user.Email)
        {
            if (await _context.Users.AnyAsync(u => u.Email == updateDto.Email && u.Id != id))
            {
                return BadRequest(new { message = "Email already exists" });
            }
            user.Email = updateDto.Email;
        }

        // Update fields
        if (updateDto.FullName != null) user.FullName = updateDto.FullName;
        if (updateDto.Phone != null) user.Phone = updateDto.Phone;
        if (updateDto.Role != null)
        {
            var validRoles = new[] { "Admin", "Pharmacist", "Customer" };
            if (!validRoles.Contains(updateDto.Role))
            {
                return BadRequest(new { message = "Invalid role. Must be Admin, Pharmacist, or Customer" });
            }
            user.Role = updateDto.Role;
        }

        // Update password if provided
        if (!string.IsNullOrEmpty(updateDto.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updateDto.Password);
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // Prevent deleting yourself (optional - you can remove this check)
        var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        if (user.Id == currentUserId)
        {
            return BadRequest(new { message = "Cannot delete your own account" });
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetUserStats()
    {
        var totalUsers = await _context.Users.CountAsync();
        var adminCount = await _context.Users.CountAsync(u => u.Role == "Admin");
        var pharmacistCount = await _context.Users.CountAsync(u => u.Role == "Pharmacist");
        var customerCount = await _context.Users.CountAsync(u => u.Role == "Customer");
        var recentUsers = await _context.Users
            .OrderByDescending(u => u.CreatedAt)
            .Take(5)
            .CountAsync();

        return Ok(new
        {
            totalUsers,
            adminCount,
            pharmacistCount,
            customerCount,
            recentUsers
        });
    }

    [HttpGet("best-customers")]
    public async Task<ActionResult<IEnumerable<BestCustomerDto>>> GetBestCustomers([FromQuery] int limit = 10)
    {
        var customers = await _context.Users
            .Where(u => u.Role == "Customer")
            .Include(u => u.Orders)
            .OrderByDescending(u => u.PurchaseCount)
            .Take(limit)
            .ToListAsync();

        var result = customers.Select(c => new BestCustomerDto
        {
            Id = c.Id,
            FullName = c.FullName,
            Email = c.Email,
            Phone = c.Phone,
            PurchaseCount = c.PurchaseCount,
            TotalSpent = c.Orders
                .Where(o => o.Status == "Paid" || o.Status == "Completed")
                .Sum(o => o.TotalAmount)
        })
        .OrderByDescending(c => c.PurchaseCount)
        .ToList();

        return Ok(result);
    }
}


