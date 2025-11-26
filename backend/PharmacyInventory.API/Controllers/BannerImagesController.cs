using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmacyInventory.API.Data;
using PharmacyInventory.API.DTOs;
using PharmacyInventory.API.Models;

namespace PharmacyInventory.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BannerImagesController : ControllerBase
{
    private readonly AppDbContext _context;

    public BannerImagesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/bannerimages
    // Public endpoint - no auth required for viewing banners
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BannerImageDto>>> GetBannerImages([FromQuery] bool activeOnly = false)
    {
        try
        {
            var query = _context.BannerImages.AsQueryable();

            if (activeOnly)
            {
                query = query.Where(b => b.IsActive);
            }

            var banners = await query
                .OrderBy(b => b.DisplayOrder)
                .ThenByDescending(b => b.CreatedAt)
                .ToListAsync();

            var result = banners.Select(b => new BannerImageDto
            {
                Id = b.Id,
                ImageUrl = b.ImageUrl,
                Title = b.Title,
                Description = b.Description,
                LinkUrl = b.LinkUrl,
                IsActive = b.IsActive,
                DisplayOrder = b.DisplayOrder,
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt
            }).ToList();

            return Ok(result);
        }
        catch (Exception ex)
        {
            // Log the error for debugging
            Console.WriteLine($"Error fetching banner images: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            
            // Return a more helpful error message
            return StatusCode(500, new { 
                message = "Failed to fetch banner images. Please ensure the bannerimages table exists in the database.",
                error = ex.Message,
                details = ex.InnerException?.Message
            });
        }
    }

    // GET: api/bannerimages/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<BannerImageDto>> GetBannerImage(int id)
    {
        var banner = await _context.BannerImages.FindAsync(id);

        if (banner == null)
        {
            return NotFound();
        }

        var result = new BannerImageDto
        {
            Id = banner.Id,
            ImageUrl = banner.ImageUrl,
            Title = banner.Title,
            Description = banner.Description,
            LinkUrl = banner.LinkUrl,
            IsActive = banner.IsActive,
            DisplayOrder = banner.DisplayOrder,
            CreatedAt = banner.CreatedAt,
            UpdatedAt = banner.UpdatedAt
        };

        return Ok(result);
    }

    // POST: api/bannerimages
    [HttpPost]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<BannerImageDto>> CreateBannerImage([FromBody] CreateBannerImageDto createDto)
    {
        if (string.IsNullOrWhiteSpace(createDto.ImageUrl))
        {
            return BadRequest(new { message = "Image URL is required" });
        }

        var banner = new BannerImage
        {
            ImageUrl = createDto.ImageUrl,
            Title = createDto.Title,
            Description = createDto.Description,
            LinkUrl = createDto.LinkUrl,
            IsActive = createDto.IsActive,
            DisplayOrder = createDto.DisplayOrder,
            CreatedAt = DateTime.UtcNow
        };

        _context.BannerImages.Add(banner);
        await _context.SaveChangesAsync();

        var result = new BannerImageDto
        {
            Id = banner.Id,
            ImageUrl = banner.ImageUrl,
            Title = banner.Title,
            Description = banner.Description,
            LinkUrl = banner.LinkUrl,
            IsActive = banner.IsActive,
            DisplayOrder = banner.DisplayOrder,
            CreatedAt = banner.CreatedAt,
            UpdatedAt = banner.UpdatedAt
        };

        return CreatedAtAction(nameof(GetBannerImage), new { id = banner.Id }, result);
    }

    // PUT: api/bannerimages/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> UpdateBannerImage(int id, [FromBody] UpdateBannerImageDto updateDto)
    {
        var banner = await _context.BannerImages.FindAsync(id);

        if (banner == null)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(updateDto.ImageUrl))
        {
            banner.ImageUrl = updateDto.ImageUrl;
        }

        if (updateDto.Title != null)
        {
            banner.Title = updateDto.Title;
        }

        if (updateDto.Description != null)
        {
            banner.Description = updateDto.Description;
        }

        if (updateDto.LinkUrl != null)
        {
            banner.LinkUrl = updateDto.LinkUrl;
        }

        if (updateDto.IsActive.HasValue)
        {
            banner.IsActive = updateDto.IsActive.Value;
        }

        if (updateDto.DisplayOrder.HasValue)
        {
            banner.DisplayOrder = updateDto.DisplayOrder.Value;
        }

        banner.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/bannerimages/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> DeleteBannerImage(int id)
    {
        var banner = await _context.BannerImages.FindAsync(id);

        if (banner == null)
        {
            return NotFound();
        }

        _context.BannerImages.Remove(banner);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Banner image deleted successfully" });
    }

    // PATCH: api/bannerimages/{id}/toggle-status
    [HttpPatch("{id}/toggle-status")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> ToggleBannerStatus(int id)
    {
        var banner = await _context.BannerImages.FindAsync(id);

        if (banner == null)
        {
            return NotFound();
        }

        banner.IsActive = !banner.IsActive;
        banner.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { 
            message = $"Banner image {(banner.IsActive ? "enabled" : "disabled")} successfully",
            isActive = banner.IsActive
        });
    }
}

