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
public class MedicinesController : ControllerBase
{
    private readonly AppDbContext _context;

    public MedicinesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MedicineDto>>> GetMedicines([FromQuery] int? categoryId, [FromQuery] string? search)
    {
        var query = _context.Medicines
            .Include(m => m.Category)
            .Include(m => m.Brand)
            .Include(m => m.MedicineBatches)
            .AsQueryable();

        if (categoryId.HasValue)
        {
            query = query.Where(m => m.CategoryId == categoryId);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(m => 
                (m.Name != null && m.Name.ToLower().Contains(searchLower)) ||
                (m.Description != null && m.Description.ToLower().Contains(searchLower))
            );
        }

        var medicines = await query.ToListAsync();

        var result = medicines.Select(m => new MedicineDto
        {
            Id = m.Id,
            Name = m.Name,
            Description = m.Description,
            CategoryId = m.CategoryId,
            CategoryName = m.Category?.Name,
            BrandId = m.BrandId,
            BrandName = m.Brand?.Name,
            UnitPrice = m.UnitPrice,
            ImageUrl = m.ImageUrl,
            TotalStock = m.MedicineBatches.Sum(b => b.Quantity),
            CreatedAt = m.CreatedAt,
            HasDiscount = m.HasDiscount,
            DiscountPercentage = m.DiscountPercentage,
            OriginalPrice = m.OriginalPrice
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MedicineDto>> GetMedicine(int id)
    {
        var medicine = await _context.Medicines
            .Include(m => m.Category)
            .Include(m => m.Brand)
            .Include(m => m.MedicineBatches)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (medicine == null)
        {
            return NotFound();
        }

        var result = new MedicineDto
        {
            Id = medicine.Id,
            Name = medicine.Name,
            Description = medicine.Description,
            CategoryId = medicine.CategoryId,
            CategoryName = medicine.Category?.Name,
            BrandId = medicine.BrandId,
            BrandName = medicine.Brand?.Name,
            UnitPrice = medicine.UnitPrice,
            ImageUrl = medicine.ImageUrl,
            TotalStock = medicine.MedicineBatches.Sum(b => b.Quantity),
            CreatedAt = medicine.CreatedAt,
            HasDiscount = medicine.HasDiscount,
            DiscountPercentage = medicine.DiscountPercentage,
            OriginalPrice = medicine.OriginalPrice
        };

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<MedicineDto>> CreateMedicine([FromBody] CreateMedicineDto createDto)
    {
        var medicine = new Medicine
        {
            Name = createDto.Name,
            Description = createDto.Description,
            CategoryId = createDto.CategoryId,
            BrandId = createDto.BrandId,
            UnitPrice = createDto.UnitPrice,
            ImageUrl = createDto.ImageUrl,
            CreatedAt = DateTime.UtcNow
        };

        _context.Medicines.Add(medicine);
        await _context.SaveChangesAsync();

        var result = new MedicineDto
        {
            Id = medicine.Id,
            Name = medicine.Name,
            Description = medicine.Description,
            CategoryId = medicine.CategoryId,
            UnitPrice = medicine.UnitPrice,
            ImageUrl = medicine.ImageUrl,
            TotalStock = 0,
            CreatedAt = medicine.CreatedAt,
            HasDiscount = medicine.HasDiscount,
            DiscountPercentage = medicine.DiscountPercentage,
            OriginalPrice = medicine.OriginalPrice
        };

        return CreatedAtAction(nameof(GetMedicine), new { id = medicine.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> UpdateMedicine(int id, [FromBody] UpdateMedicineDto updateDto)
    {
        var medicine = await _context.Medicines.FindAsync(id);

        if (medicine == null)
        {
            return NotFound();
        }

        if (updateDto.Name != null) medicine.Name = updateDto.Name;
        if (updateDto.Description != null) medicine.Description = updateDto.Description;
        if (updateDto.CategoryId.HasValue) medicine.CategoryId = updateDto.CategoryId;
        if (updateDto.BrandId.HasValue) medicine.BrandId = updateDto.BrandId;
        if (updateDto.UnitPrice.HasValue) medicine.UnitPrice = updateDto.UnitPrice.Value;
        if (updateDto.ImageUrl != null) medicine.ImageUrl = updateDto.ImageUrl;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> DeleteMedicine(int id)
    {
        var medicine = await _context.Medicines.FindAsync(id);

        if (medicine == null)
        {
            return NotFound();
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Get all batches for this medicine first
            var allBatches = await _context.MedicineBatches
                .Where(b => b.MedicineId == id)
                .ToListAsync();

            var allBatchIds = allBatches.Select(b => b.Id).ToList();

            // Delete all supplier return requests for this medicine
            var returnRequests = await _context.SupplierReturnRequests
                .Where(r => r.MedicineId == id)
                .ToListAsync();
            _context.SupplierReturnRequests.RemoveRange(returnRequests);

            // Delete all order items for this medicine (to allow medicine deletion)
            var orderItems = await _context.OrderItems
                .Where(oi => oi.MedicineId == id)
                .ToListAsync();
            _context.OrderItems.RemoveRange(orderItems);

            // Delete all batches for this medicine (CartItems will cascade)
            _context.MedicineBatches.RemoveRange(allBatches);

            // Delete the medicine itself (now safe since all dependencies are removed)
            _context.Medicines.Remove(medicine);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { 
                message = $"Medicine '{medicine.Name}' deleted successfully. Removed: {allBatches.Count} batch(es), {returnRequests.Count} return request(s), and {orderItems.Count} order item(s)." 
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "Error deleting medicine", error = ex.Message });
        }
    }

    [HttpGet("out-of-stock")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<IEnumerable<OutOfStockMedicineDto>>> GetOutOfStockMedicines()
    {
        var medicines = await _context.Medicines
            .Include(m => m.Category)
            .Include(m => m.Brand)
            .Include(m => m.MedicineBatches)
            .ToListAsync();

        var outOfStockMedicines = medicines
            .Where(m => m.MedicineBatches.Sum(b => b.Quantity) == 0)
            .Select(m => new OutOfStockMedicineDto
            {
                Id = m.Id,
                Name = m.Name,
                Description = m.Description,
                CategoryId = m.CategoryId,
                CategoryName = m.Category?.Name,
                BrandId = m.BrandId,
                BrandName = m.Brand?.Name,
                UnitPrice = m.UnitPrice,
                ImageUrl = m.ImageUrl,
                TotalStock = 0,
                BatchCount = m.MedicineBatches.Count
            })
            .OrderBy(m => m.Name)
            .ToList();

        return Ok(outOfStockMedicines);
    }

    [HttpGet("low-stock")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<IEnumerable<OutOfStockMedicineDto>>> GetLowStockMedicines([FromQuery] int threshold = 10)
    {
        var medicines = await _context.Medicines
            .Include(m => m.Category)
            .Include(m => m.Brand)
            .Include(m => m.MedicineBatches)
            .ToListAsync();

        var lowStockMedicines = medicines
            .Where(m => 
            {
                var totalStock = m.MedicineBatches.Sum(b => b.Quantity);
                return totalStock > 0 && totalStock <= threshold;
            })
            .Select(m => new OutOfStockMedicineDto
            {
                Id = m.Id,
                Name = m.Name,
                Description = m.Description,
                CategoryId = m.CategoryId,
                CategoryName = m.Category?.Name,
                UnitPrice = m.UnitPrice,
                ImageUrl = m.ImageUrl,
                TotalStock = m.MedicineBatches.Sum(b => b.Quantity),
                BatchCount = m.MedicineBatches.Count
            })
            .OrderBy(m => m.TotalStock)
            .ThenBy(m => m.Name)
            .ToList();

        return Ok(lowStockMedicines);
    }
}

