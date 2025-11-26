using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using PharmacyInventory.API.Data;
using PharmacyInventory.API.DTOs;
using PharmacyInventory.API.Models;

namespace PharmacyInventory.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CommentsController(AppDbContext context)
    {
        _context = context;
    }

    private int? GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? int.Parse(userIdClaim) : null;
    }

    // GET: api/comments?medicineId=1
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CommentDto>>> GetComments([FromQuery] int? medicineId)
    {
        var query = _context.Comments
            .Include(c => c.User)
            .Include(c => c.Medicine)
            .AsQueryable();

        if (medicineId.HasValue)
        {
            query = query.Where(c => c.MedicineId == medicineId.Value);
        }

        var comments = await query
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        var result = comments.Select(c => new CommentDto
        {
            Id = c.Id,
            MedicineId = c.MedicineId,
            UserId = c.UserId,
            UserName = c.User.FullName,
            Content = c.Content,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt
        }).ToList();

        return Ok(result);
    }

    // GET: api/comments/5
    [HttpGet("{id}")]
    public async Task<ActionResult<CommentDto>> GetComment(int id)
    {
        var comment = await _context.Comments
            .Include(c => c.User)
            .Include(c => c.Medicine)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (comment == null)
        {
            return NotFound();
        }

        var result = new CommentDto
        {
            Id = comment.Id,
            MedicineId = comment.MedicineId,
            UserId = comment.UserId,
            UserName = comment.User.FullName,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt
        };

        return Ok(result);
    }

    // POST: api/comments
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<CommentDto>> CreateComment([FromBody] CreateCommentDto createDto)
    {
        var userId = GetUserId();
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        // Verify medicine exists
        var medicine = await _context.Medicines.FindAsync(createDto.MedicineId);
        if (medicine == null)
        {
            return NotFound(new { message = "Medicine not found" });
        }

        // Validate content
        if (string.IsNullOrWhiteSpace(createDto.Content))
        {
            return BadRequest(new { message = "Comment content cannot be empty" });
        }

        if (createDto.Content.Length > 1000)
        {
            return BadRequest(new { message = "Comment content cannot exceed 1000 characters" });
        }

        var comment = new Comment
        {
            MedicineId = createDto.MedicineId,
            UserId = userId.Value,
            Content = createDto.Content.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        // Load user for response
        await _context.Entry(comment)
            .Reference(c => c.User)
            .LoadAsync();

        var result = new CommentDto
        {
            Id = comment.Id,
            MedicineId = comment.MedicineId,
            UserId = comment.UserId,
            UserName = comment.User.FullName,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt
        };

        return CreatedAtAction(nameof(GetComment), new { id = comment.Id }, result);
    }

    // PUT: api/comments/5
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateComment(int id, [FromBody] UpdateCommentDto updateDto)
    {
        var userId = GetUserId();
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var comment = await _context.Comments.FindAsync(id);
        if (comment == null)
        {
            return NotFound();
        }

        // Users can only update their own comments
        if (comment.UserId != userId.Value)
        {
            return Forbid();
        }

        // Validate content
        if (string.IsNullOrWhiteSpace(updateDto.Content))
        {
            return BadRequest(new { message = "Comment content cannot be empty" });
        }

        if (updateDto.Content.Length > 1000)
        {
            return BadRequest(new { message = "Comment content cannot exceed 1000 characters" });
        }

        comment.Content = updateDto.Content.Trim();
        comment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/comments/5
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteComment(int id)
    {
        var userId = GetUserId();
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var comment = await _context.Comments.FindAsync(id);
        if (comment == null)
        {
            return NotFound();
        }

        var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "";
        var isAdmin = userRole == "Admin" || userRole == "Pharmacist";

        // Users can only delete their own comments, admins can delete any
        if (!isAdmin && comment.UserId != userId.Value)
        {
            return Forbid();
        }

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}


