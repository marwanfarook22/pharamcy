using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmacyInventory.API.Data;
using PharmacyInventory.API.DTOs;
using PharmacyInventory.API.Models;

namespace PharmacyInventory.API.Controllers;

[ApiController]
[Route("api/expiryalerts")]
[Authorize]
public class ExpiryAlertsController : ControllerBase
{
    private readonly AppDbContext _context;
    private const int NearExpiryDays = 30; // Days before expiry to trigger "Near Expiry" alert

    public ExpiryAlertsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpiryAlertDto>>> GetExpiryAlerts([FromQuery] bool? unresolvedOnly)
    {
        var query = _context.ExpiryAlerts
            .Include(e => e.Batch)
                .ThenInclude(b => b.Medicine)
            .AsQueryable();

        if (unresolvedOnly == true)
        {
            query = query.Where(e => !e.IsResolved);
        }

        var alerts = await query
            .OrderByDescending(e => e.AlertDate)
            .ToListAsync();

        var result = alerts.Select(a => new ExpiryAlertDto
        {
            Id = a.Id,
            BatchId = a.BatchId,
            BatchNumber = a.Batch.BatchNumber,
            MedicineId = a.Batch.MedicineId,
            MedicineName = a.Batch.Medicine.Name,
            ExpiryDate = a.Batch.ExpiryDate,
            Quantity = a.Batch.Quantity,
            AlertType = a.AlertType,
            AlertDate = a.AlertDate,
            IsResolved = a.IsResolved,
            DaysUntilExpiry = (a.Batch.ExpiryDate.ToDateTime(TimeOnly.MinValue) - DateOnly.FromDateTime(DateTime.UtcNow).ToDateTime(TimeOnly.MinValue)).Days
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpiryAlertDto>> GetExpiryAlert(int id)
    {
        var alert = await _context.ExpiryAlerts
            .Include(e => e.Batch)
                .ThenInclude(b => b.Medicine)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (alert == null)
        {
            return NotFound(new { message = "Expiry alert not found" });
        }

        var result = new ExpiryAlertDto
        {
            Id = alert.Id,
            BatchId = alert.BatchId,
            BatchNumber = alert.Batch.BatchNumber,
            MedicineId = alert.Batch.MedicineId,
            MedicineName = alert.Batch.Medicine.Name,
            ExpiryDate = alert.Batch.ExpiryDate,
            Quantity = alert.Batch.Quantity,
            AlertType = alert.AlertType,
            AlertDate = alert.AlertDate,
            IsResolved = alert.IsResolved,
            DaysUntilExpiry = (alert.Batch.ExpiryDate.ToDateTime(TimeOnly.MinValue) - DateOnly.FromDateTime(DateTime.UtcNow).ToDateTime(TimeOnly.MinValue)).Days
        };

        return Ok(result);
    }

    [HttpPut("{id}/resolve")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult> ResolveExpiryAlert(int id, [FromBody] ResolveExpiryAlertDto resolveDto)
    {
        var alert = await _context.ExpiryAlerts
            .Include(e => e.Batch)
                .ThenInclude(b => b.Medicine)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (alert == null)
        {
            return NotFound(new { message = "Expiry alert not found" });
        }

        // If resolving an expired alert (not unresolving), delete the medicine and all related data
        if (!alert.IsResolved && alert.AlertType == "Expired" && resolveDto.IsResolved)
        {
            var medicine = alert.Batch.Medicine;
            var medicineId = medicine.Id;

            // Delete all batches for this medicine
            var allBatches = await _context.MedicineBatches
                .Where(b => b.MedicineId == medicineId)
                .ToListAsync();

            // Delete all expiry alerts for these batches
            var allAlerts = await _context.ExpiryAlerts
                .Where(e => allBatches.Select(b => b.Id).Contains(e.BatchId))
                .ToListAsync();

            _context.ExpiryAlerts.RemoveRange(allAlerts);
            _context.MedicineBatches.RemoveRange(allBatches);

            // Delete related data
            var cartItems = await _context.CartItems
                .Where(ci => ci.MedicineId == medicineId)
                .ToListAsync();
            _context.CartItems.RemoveRange(cartItems);

            var comments = await _context.Comments
                .Where(c => c.MedicineId == medicineId)
                .ToListAsync();
            _context.Comments.RemoveRange(comments);

            // Delete the medicine itself
            _context.Medicines.Remove(medicine);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Expired alert resolved. Medicine and all related data have been deleted." });
        }

        // For near expiry alerts, apply 50% discount when resolving
        if (!alert.IsResolved && alert.AlertType == "Near Expiry" && resolveDto.IsResolved)
        {
            var medicine = alert.Batch.Medicine;
            
            // Only apply discount if not already discounted
            if (!medicine.HasDiscount)
            {
                // Store original price
                medicine.OriginalPrice = medicine.UnitPrice;
                
                // Apply 50% discount
                medicine.UnitPrice = medicine.UnitPrice * 0.5m;
                medicine.HasDiscount = true;
                medicine.DiscountPercentage = 50;
                
                // Explicitly mark as modified to ensure Entity Framework tracks the changes
                _context.Entry(medicine).Property(m => m.UnitPrice).IsModified = true;
                _context.Entry(medicine).Property(m => m.HasDiscount).IsModified = true;
                _context.Entry(medicine).Property(m => m.DiscountPercentage).IsModified = true;
                _context.Entry(medicine).Property(m => m.OriginalPrice).IsModified = true;
            }
        }
        // If unresolving a near expiry alert, remove the discount
        else if (alert.IsResolved && alert.AlertType == "Near Expiry" && !resolveDto.IsResolved)
        {
            var medicine = alert.Batch.Medicine;
            
            // Restore original price if discount was applied
            if (medicine.HasDiscount && medicine.OriginalPrice.HasValue)
            {
                medicine.UnitPrice = medicine.OriginalPrice.Value;
                medicine.HasDiscount = false;
                medicine.DiscountPercentage = null;
                medicine.OriginalPrice = null;
                
                // Explicitly mark as modified to ensure Entity Framework tracks the changes
                _context.Entry(medicine).Property(m => m.UnitPrice).IsModified = true;
                _context.Entry(medicine).Property(m => m.HasDiscount).IsModified = true;
                _context.Entry(medicine).Property(m => m.DiscountPercentage).IsModified = true;
                _context.Entry(medicine).Property(m => m.OriginalPrice).IsModified = true;
            }
        }

        // Update the alert status
        alert.IsResolved = resolveDto.IsResolved;
        await _context.SaveChangesAsync();

        var message = resolveDto.IsResolved 
            ? (alert.AlertType == "Near Expiry" ? "Alert resolved successfully. 50% discount applied to the product." : "Alert resolved successfully")
            : "Alert unresolved";
        return Ok(new { message });
    }

    [HttpPost("check-all")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult> CheckAllExpiryAlerts()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var nearExpiryDate = today.AddDays(NearExpiryDays);

        // Get all batches with quantity > 0
        var batches = await _context.MedicineBatches
            .Include(b => b.Medicine)
            .Where(b => b.Quantity > 0)
            .ToListAsync();

        var alertsCreated = 0;
        var alertsUpdated = 0;

        foreach (var batch in batches)
        {
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
                    alertsUpdated++;
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
                        alertsCreated++;
                    }
                    // If resolvedAlert exists, skip - don't create a new alert for previously resolved items
                }
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Expiry check completed",
            alertsCreated,
            alertsUpdated,
            totalBatchesChecked = batches.Count
        });
    }
}

