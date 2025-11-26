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
public class BatchesController : ControllerBase
{
    private readonly AppDbContext _context;
    private const int NearExpiryDays = 30; // Days before expiry to trigger "Near Expiry" alert

    public BatchesController(AppDbContext context)
    {
        _context = context;
    }

    private async Task CheckAndCreateExpiryAlert(MedicineBatch batch)
    {
        if (batch.Quantity <= 0) return; // Don't create alerts for empty batches

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var daysUntilExpiry = (batch.ExpiryDate.ToDateTime(TimeOnly.MinValue) - today.ToDateTime(TimeOnly.MinValue)).Days;
        string? alertType = null;

        // Determine alert type
        if (daysUntilExpiry < 0)
        {
            alertType = "Expired";
        }
        else if (daysUntilExpiry <= NearExpiryDays)
        {
            alertType = "Near Expiry";
        }

        if (alertType != null)
        {
            // First, check if there's an unresolved alert for this batch and alert type
            var existingUnresolvedAlert = await _context.ExpiryAlerts
                .FirstOrDefaultAsync(e => e.BatchId == batch.Id && e.AlertType == alertType && !e.IsResolved);

            if (existingUnresolvedAlert != null)
            {
                // Update existing unresolved alert date
                existingUnresolvedAlert.AlertDate = DateTime.UtcNow;
            }
            else
            {
                // Check if there was a resolved alert before - if yes, don't create a new one
                var resolvedAlert = await _context.ExpiryAlerts
                    .FirstOrDefaultAsync(e => e.BatchId == batch.Id && e.AlertType == alertType && e.IsResolved);

                if (resolvedAlert == null)
                {
                    // No alert exists at all (resolved or unresolved), create a new one
                    var newAlert = new ExpiryAlert
                    {
                        BatchId = batch.Id,
                        AlertType = alertType,
                        AlertDate = DateTime.UtcNow,
                        IsResolved = false
                    };
                    _context.ExpiryAlerts.Add(newAlert);
                }
                // If resolvedAlert exists, skip - don't create a new alert for previously resolved items
            }
        }
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MedicineBatchDto>>> GetBatches([FromQuery] int? medicineId)
    {
        var query = _context.MedicineBatches
            .Include(b => b.Medicine)
            .Include(b => b.Supplier)
            .AsQueryable();

        if (medicineId.HasValue)
        {
            query = query.Where(b => b.MedicineId == medicineId);
        }

        var batches = await query.ToListAsync();

        var result = batches.Select(b => new MedicineBatchDto
        {
            Id = b.Id,
            MedicineId = b.MedicineId,
            MedicineName = b.Medicine.Name,
            BatchNumber = b.BatchNumber,
            ExpiryDate = b.ExpiryDate,
            Quantity = b.Quantity,
            SupplierId = b.SupplierId,
            SupplierName = b.Supplier?.Name,
            PurchaseDate = b.PurchaseDate,
            UnitCost = b.UnitCost,
            DaysUntilExpiry = (b.ExpiryDate.ToDateTime(TimeOnly.MinValue) - DateOnly.FromDateTime(DateTime.UtcNow).ToDateTime(TimeOnly.MinValue)).Days
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MedicineBatchDto>> GetBatch(int id)
    {
        var batch = await _context.MedicineBatches
            .Include(b => b.Medicine)
            .Include(b => b.Supplier)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (batch == null)
        {
            return NotFound();
        }

        var result = new MedicineBatchDto
        {
            Id = batch.Id,
            MedicineId = batch.MedicineId,
            MedicineName = batch.Medicine.Name,
            BatchNumber = batch.BatchNumber,
            ExpiryDate = batch.ExpiryDate,
            Quantity = batch.Quantity,
            SupplierId = batch.SupplierId,
            SupplierName = batch.Supplier?.Name,
            PurchaseDate = batch.PurchaseDate,
            UnitCost = batch.UnitCost,
            DaysUntilExpiry = (batch.ExpiryDate.ToDateTime(TimeOnly.MinValue) - DateOnly.FromDateTime(DateTime.UtcNow).ToDateTime(TimeOnly.MinValue)).Days
        };

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<MedicineBatchDto>> CreateBatch([FromBody] CreateBatchDto createDto)
    {
        var medicine = await _context.Medicines.FindAsync(createDto.MedicineId);
        if (medicine == null)
        {
            return BadRequest(new { message = "Medicine not found" });
        }

        var batch = new MedicineBatch
        {
            MedicineId = createDto.MedicineId,
            BatchNumber = createDto.BatchNumber,
            ExpiryDate = createDto.ExpiryDate,
            Quantity = createDto.Quantity,
            SupplierId = createDto.SupplierId,
            PurchaseDate = createDto.PurchaseDate,
            UnitCost = createDto.UnitCost
        };

        _context.MedicineBatches.Add(batch);
        await _context.SaveChangesAsync();

        // Check and create expiry alert if needed
        await CheckAndCreateExpiryAlert(batch);
        await _context.SaveChangesAsync();

        var result = new MedicineBatchDto
        {
            Id = batch.Id,
            MedicineId = batch.MedicineId,
            MedicineName = medicine.Name,
            BatchNumber = batch.BatchNumber,
            ExpiryDate = batch.ExpiryDate,
            Quantity = batch.Quantity,
            SupplierId = batch.SupplierId,
            PurchaseDate = batch.PurchaseDate,
            UnitCost = batch.UnitCost,
            DaysUntilExpiry = (batch.ExpiryDate.ToDateTime(TimeOnly.MinValue) - DateOnly.FromDateTime(DateTime.UtcNow).ToDateTime(TimeOnly.MinValue)).Days
        };

        return CreatedAtAction(nameof(GetBatch), new { id = batch.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> UpdateBatch(int id, [FromBody] UpdateBatchDto updateDto)
    {
        var batch = await _context.MedicineBatches.FindAsync(id);

        if (batch == null)
        {
            return NotFound();
        }

        if (updateDto.BatchNumber != null) batch.BatchNumber = updateDto.BatchNumber;
        if (updateDto.ExpiryDate.HasValue) batch.ExpiryDate = updateDto.ExpiryDate.Value;
        if (updateDto.Quantity.HasValue) batch.Quantity = updateDto.Quantity.Value;
        if (updateDto.SupplierId.HasValue) batch.SupplierId = updateDto.SupplierId;
        if (updateDto.PurchaseDate.HasValue) batch.PurchaseDate = updateDto.PurchaseDate;
        if (updateDto.UnitCost.HasValue) batch.UnitCost = updateDto.UnitCost.Value;

        await _context.SaveChangesAsync();

        // Check and create expiry alert if needed (especially if expiry date or quantity changed)
        if (updateDto.ExpiryDate.HasValue || updateDto.Quantity.HasValue)
        {
            await CheckAndCreateExpiryAlert(batch);
            await _context.SaveChangesAsync();
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> DeleteBatch(int id)
    {
        var batch = await _context.MedicineBatches.FindAsync(id);

        if (batch == null)
        {
            return NotFound();
        }

        _context.MedicineBatches.Remove(batch);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id}/increment-quantity")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<MedicineBatchDto>> IncrementQuantity(int id, [FromBody] IncrementQuantityDto incrementDto)
    {
        var batch = await _context.MedicineBatches
            .Include(b => b.Medicine)
            .Include(b => b.Supplier)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (batch == null)
        {
            return NotFound(new { message = "Batch not found" });
        }

        if (incrementDto.Quantity <= 0)
        {
            return BadRequest(new { message = "Quantity must be greater than 0" });
        }

        // Increment the quantity
        batch.Quantity += incrementDto.Quantity;

        await _context.SaveChangesAsync();

        var result = new MedicineBatchDto
        {
            Id = batch.Id,
            MedicineId = batch.MedicineId,
            MedicineName = batch.Medicine.Name,
            BatchNumber = batch.BatchNumber,
            ExpiryDate = batch.ExpiryDate,
            Quantity = batch.Quantity,
            SupplierId = batch.SupplierId,
            SupplierName = batch.Supplier?.Name,
            PurchaseDate = batch.PurchaseDate,
            UnitCost = batch.UnitCost,
            DaysUntilExpiry = (batch.ExpiryDate.ToDateTime(TimeOnly.MinValue) - DateOnly.FromDateTime(DateTime.UtcNow).ToDateTime(TimeOnly.MinValue)).Days
        };

        return Ok(result);
    }

    [HttpPatch("medicine/{medicineId}/increment-quantity")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<MedicineBatchDto>> IncrementQuantityByMedicine(int medicineId, [FromBody] IncrementQuantityDto incrementDto)
    {
        var medicine = await _context.Medicines.FindAsync(medicineId);
        if (medicine == null)
        {
            return NotFound(new { message = "Medicine not found" });
        }

        if (incrementDto.Quantity <= 0)
        {
            return BadRequest(new { message = "Quantity must be greater than 0" });
        }

        // Find the first available batch for this medicine (preferably one that's not expired)
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var batch = await _context.MedicineBatches
            .Include(b => b.Medicine)
            .Include(b => b.Supplier)
            .Where(b => b.MedicineId == medicineId && b.ExpiryDate >= today)
            .OrderBy(b => b.ExpiryDate)
            .FirstOrDefaultAsync();

        // If no valid batch found, use the first batch regardless of expiry
        if (batch == null)
        {
            batch = await _context.MedicineBatches
                .Include(b => b.Medicine)
                .Include(b => b.Supplier)
                .Where(b => b.MedicineId == medicineId)
                .OrderBy(b => b.ExpiryDate)
                .FirstOrDefaultAsync();
        }

        // If still no batch exists, return error (batch must be created first)
        if (batch == null)
        {
            return BadRequest(new { message = "No batch found for this medicine. Please create a batch first." });
        }

        // Increment the quantity
        batch.Quantity += incrementDto.Quantity;

        await _context.SaveChangesAsync();

        var result = new MedicineBatchDto
        {
            Id = batch.Id,
            MedicineId = batch.MedicineId,
            MedicineName = batch.Medicine.Name,
            BatchNumber = batch.BatchNumber,
            ExpiryDate = batch.ExpiryDate,
            Quantity = batch.Quantity,
            SupplierId = batch.SupplierId,
            SupplierName = batch.Supplier?.Name,
            PurchaseDate = batch.PurchaseDate,
            UnitCost = batch.UnitCost,
            DaysUntilExpiry = (batch.ExpiryDate.ToDateTime(TimeOnly.MinValue) - DateOnly.FromDateTime(DateTime.UtcNow).ToDateTime(TimeOnly.MinValue)).Days
        };

        return Ok(result);
    }

    [HttpGet("out-of-stock")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<IEnumerable<OutOfStockBatchDto>>> GetOutOfStockBatches()
    {
        var batches = await _context.MedicineBatches
            .Include(b => b.Medicine)
            .Include(b => b.Supplier)
            .Where(b => b.Quantity == 0)
            .OrderBy(b => b.Medicine.Name)
            .ThenBy(b => b.ExpiryDate)
            .ToListAsync();

        var result = batches.Select(b => new OutOfStockBatchDto
        {
            Id = b.Id,
            MedicineId = b.MedicineId,
            MedicineName = b.Medicine.Name,
            BatchNumber = b.BatchNumber,
            ExpiryDate = b.ExpiryDate,
            Quantity = b.Quantity,
            SupplierId = b.SupplierId,
            SupplierName = b.Supplier?.Name,
            PurchaseDate = b.PurchaseDate,
            UnitCost = b.UnitCost,
            DaysUntilExpiry = (b.ExpiryDate.ToDateTime(TimeOnly.MinValue) - DateOnly.FromDateTime(DateTime.UtcNow).ToDateTime(TimeOnly.MinValue)).Days
        }).ToList();

        return Ok(result);
    }

    [HttpGet("fefo/{medicineId}")]
    public async Task<ActionResult<IEnumerable<MedicineBatchDto>>> GetBatchesFEFO(int medicineId)
    {
        // FEFO: First Expiry First Out - sort by expiry date ascending
        var batches = await _context.MedicineBatches
            .Include(b => b.Medicine)
            .Include(b => b.Supplier)
            .Where(b => b.MedicineId == medicineId && b.Quantity > 0)
            .OrderBy(b => b.ExpiryDate)
            .ToListAsync();

        var result = batches.Select(b => new MedicineBatchDto
        {
            Id = b.Id,
            MedicineId = b.MedicineId,
            MedicineName = b.Medicine.Name,
            BatchNumber = b.BatchNumber,
            ExpiryDate = b.ExpiryDate,
            Quantity = b.Quantity,
            SupplierId = b.SupplierId,
            SupplierName = b.Supplier?.Name,
            PurchaseDate = b.PurchaseDate,
            UnitCost = b.UnitCost,
            DaysUntilExpiry = (b.ExpiryDate.ToDateTime(TimeOnly.MinValue) - DateOnly.FromDateTime(DateTime.UtcNow).ToDateTime(TimeOnly.MinValue)).Days
        }).ToList();

        return Ok(result);
    }
}

