using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmacyInventory.API.Data;
using PharmacyInventory.API.DTOs;
using PharmacyInventory.API.Models;

namespace PharmacyInventory.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BrandsController : ControllerBase
{
    private readonly AppDbContext _context;

    public BrandsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BrandDto>>> GetBrands()
    {
        var brands = await _context.Brands
            .Include(b => b.Medicines)
            .ToListAsync();

        var result = brands.Select(b => new BrandDto
        {
            Id = b.Id,
            Name = b.Name,
            Description = b.Description,
            MedicineCount = b.Medicines.Count
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BrandDto>> GetBrand(int id)
    {
        var brand = await _context.Brands
            .Include(b => b.Medicines)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (brand == null)
        {
            return NotFound();
        }

        var result = new BrandDto
        {
            Id = brand.Id,
            Name = brand.Name,
            Description = brand.Description,
            MedicineCount = brand.Medicines.Count
        };

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<BrandDto>> CreateBrand([FromBody] CreateBrandDto createDto)
    {
        if (string.IsNullOrWhiteSpace(createDto.Name))
        {
            return BadRequest(new { message = "Brand name is required" });
        }

        // Check if brand with same name already exists
        var existingBrand = await _context.Brands
            .FirstOrDefaultAsync(b => b.Name.ToLower() == createDto.Name.ToLower());

        if (existingBrand != null)
        {
            return Conflict(new { message = "Brand with this name already exists" });
        }

        var brand = new Brand
        {
            Name = createDto.Name,
            Description = createDto.Description
        };

        _context.Brands.Add(brand);
        await _context.SaveChangesAsync();

        var result = new BrandDto
        {
            Id = brand.Id,
            Name = brand.Name,
            Description = brand.Description,
            MedicineCount = 0
        };

        return CreatedAtAction(nameof(GetBrand), new { id = brand.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> UpdateBrand(int id, [FromBody] UpdateBrandDto updateDto)
    {
        var brand = await _context.Brands.FindAsync(id);

        if (brand == null)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(updateDto.Name))
        {
            // Check if another brand with the same name exists
            var existingBrand = await _context.Brands
                .FirstOrDefaultAsync(b => b.Name.ToLower() == updateDto.Name.ToLower() && b.Id != id);

            if (existingBrand != null)
            {
                return Conflict(new { message = "Brand with this name already exists" });
            }

            brand.Name = updateDto.Name;
        }

        if (updateDto.Description != null)
        {
            brand.Description = updateDto.Description;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> DeleteBrand(int id)
    {
        var brand = await _context.Brands
            .Include(b => b.Medicines)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (brand == null)
        {
            return NotFound();
        }

        if (brand.Medicines.Any())
        {
            return BadRequest(new { message = "Cannot delete brand that has associated medicines. Please remove or reassign medicines first." });
        }

        _context.Brands.Remove(brand);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Brand deleted successfully" });
    }
}





