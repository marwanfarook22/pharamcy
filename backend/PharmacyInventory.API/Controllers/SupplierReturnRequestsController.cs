using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmacyInventory.API.Data;
using PharmacyInventory.API.DTOs;

namespace PharmacyInventory.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SupplierReturnRequestsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SupplierReturnRequestsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<IEnumerable<SupplierReturnRequestDto>>> GetReturnRequests([FromQuery] string? status)
    {
        var query = _context.SupplierReturnRequests
            .Include(r => r.Batch)
            .Include(r => r.Medicine)
            .Include(r => r.Supplier)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(r => r.Status == status);
        }

        var requests = await query.OrderByDescending(r => r.RequestDate).ToListAsync();

        var result = requests.Select(r => new SupplierReturnRequestDto
        {
            Id = r.Id,
            BatchId = r.BatchId,
            BatchNumber = r.Batch.BatchNumber,
            MedicineId = r.MedicineId,
            MedicineName = r.Medicine.Name,
            SupplierId = r.SupplierId,
            SupplierName = r.Supplier.Name,
            Quantity = r.Quantity,
            Reason = r.Reason,
            Status = r.Status,
            RequestDate = r.RequestDate,
            ResponseDate = r.ResponseDate,
            Notes = r.Notes,
            NewBatchNumber = r.NewBatchNumber,
            NewExpiryDate = r.NewExpiryDate,
            NewQuantity = r.NewQuantity,
            ExpiryDate = r.Batch.ExpiryDate
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<SupplierReturnRequestDto>> GetReturnRequest(int id)
    {
        var request = await _context.SupplierReturnRequests
            .Include(r => r.Batch)
            .Include(r => r.Medicine)
            .Include(r => r.Supplier)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null)
        {
            return NotFound();
        }

        var result = new SupplierReturnRequestDto
        {
            Id = request.Id,
            BatchId = request.BatchId,
            BatchNumber = request.Batch.BatchNumber,
            MedicineId = request.MedicineId,
            MedicineName = request.Medicine.Name,
            SupplierId = request.SupplierId,
            SupplierName = request.Supplier.Name,
            Quantity = request.Quantity,
            Reason = request.Reason,
            Status = request.Status,
            RequestDate = request.RequestDate,
            ResponseDate = request.ResponseDate,
            Notes = request.Notes,
            NewBatchNumber = request.NewBatchNumber,
            NewExpiryDate = request.NewExpiryDate,
            NewQuantity = request.NewQuantity,
            ExpiryDate = request.Batch.ExpiryDate
        };

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<SupplierReturnRequestDto>> CreateReturnRequest([FromBody] CreateSupplierReturnRequestDto createDto)
    {
        // Validate batch exists
        var batch = await _context.MedicineBatches
            .Include(b => b.Medicine)
            .Include(b => b.Supplier)
            .FirstOrDefaultAsync(b => b.Id == createDto.BatchId);

        if (batch == null)
        {
            return BadRequest(new { message = "Batch not found" });
        }

        // Validate that batch has a supplier
        if (!batch.SupplierId.HasValue)
        {
            return BadRequest(new { message = "Batch does not have an associated supplier. Cannot create return request." });
        }

        // Validate quantity doesn't exceed available quantity
        if (createDto.Quantity > batch.Quantity)
        {
            return BadRequest(new { message = $"Requested quantity ({createDto.Quantity}) exceeds available quantity ({batch.Quantity})" });
        }

        // Check if there's already a pending request for this batch
        var existingRequest = await _context.SupplierReturnRequests
            .FirstOrDefaultAsync(r => r.BatchId == createDto.BatchId && r.Status == "Pending");

        if (existingRequest != null)
        {
            return BadRequest(new { message = "There is already a pending return request for this batch" });
        }

        var request = new Models.SupplierReturnRequest
        {
            BatchId = createDto.BatchId,
            MedicineId = batch.MedicineId, // Use MedicineId from batch, not from DTO
            SupplierId = batch.SupplierId.Value, // Use supplier from batch (we validated it exists)
            Quantity = createDto.Quantity,
            Reason = createDto.Reason,
            Status = "Pending",
            RequestDate = DateTime.UtcNow,
            Notes = createDto.Notes
        };

        _context.SupplierReturnRequests.Add(request);
        await _context.SaveChangesAsync();

        // Reload with includes
        var createdRequest = await _context.SupplierReturnRequests
            .Include(r => r.Batch)
            .Include(r => r.Medicine)
            .Include(r => r.Supplier)
            .FirstOrDefaultAsync(r => r.Id == request.Id);

        var result = new SupplierReturnRequestDto
        {
            Id = createdRequest!.Id,
            BatchId = createdRequest.BatchId,
            BatchNumber = createdRequest.Batch.BatchNumber,
            MedicineId = createdRequest.MedicineId,
            MedicineName = createdRequest.Medicine.Name,
            SupplierId = createdRequest.SupplierId,
            SupplierName = createdRequest.Supplier.Name,
            Quantity = createdRequest.Quantity,
            Reason = createdRequest.Reason,
            Status = createdRequest.Status,
            RequestDate = createdRequest.RequestDate,
            ResponseDate = createdRequest.ResponseDate,
            Notes = createdRequest.Notes,
            NewBatchNumber = createdRequest.NewBatchNumber,
            NewExpiryDate = createdRequest.NewExpiryDate,
            NewQuantity = createdRequest.NewQuantity,
            ExpiryDate = createdRequest.Batch.ExpiryDate
        };

        return CreatedAtAction(nameof(GetReturnRequest), new { id = request.Id }, result);
    }

    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> ApproveReturnRequest(int id, [FromBody] ApproveSupplierReturnRequestDto approveDto)
    {
        var request = await _context.SupplierReturnRequests
            .Include(r => r.Batch)
                .ThenInclude(b => b.Medicine)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null)
        {
            return NotFound(new { message = "Return request not found" });
        }

        if (request.Status != "Pending")
        {
            return BadRequest(new { message = $"Cannot approve request with status: {request.Status}" });
        }

        // Validate new batch details
        if (string.IsNullOrWhiteSpace(approveDto.NewBatchNumber) || 
            !approveDto.NewExpiryDate.HasValue || 
            !approveDto.NewQuantity.HasValue || 
            approveDto.NewQuantity.Value <= 0)
        {
            return BadRequest(new { message = "New batch number, expiry date, and quantity are required" });
        }

        // Validate new expiry date is in the future and longer than old one
        if (approveDto.NewExpiryDate.Value <= request.Batch.ExpiryDate)
        {
            return BadRequest(new { message = "New expiry date must be later than the current expiry date" });
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Update request status
            request.Status = "Approved";
            request.ResponseDate = DateTime.UtcNow;
            request.NewBatchNumber = approveDto.NewBatchNumber;
            request.NewExpiryDate = approveDto.NewExpiryDate;
            request.NewQuantity = approveDto.NewQuantity;
            request.Notes = approveDto.Notes;

            // Create new batch with longer expiry
            var newBatch = new Models.MedicineBatch
            {
                MedicineId = request.MedicineId,
                BatchNumber = approveDto.NewBatchNumber!,
                ExpiryDate = approveDto.NewExpiryDate.Value,
                Quantity = approveDto.NewQuantity.Value,
                SupplierId = request.SupplierId,
                PurchaseDate = DateOnly.FromDateTime(DateTime.UtcNow),
                UnitCost = request.Batch.UnitCost
            };

            _context.MedicineBatches.Add(newBatch);
            await _context.SaveChangesAsync(); // Save to get the new batch ID

            // Store old batch ID before updating
            var oldBatchId = request.BatchId;

            // Update request's BatchId to point to new batch (to avoid foreign key constraint violation)
            request.BatchId = newBatch.Id;
            await _context.SaveChangesAsync(); // Save the BatchId update first

            // Update all OrderItems that reference the old batch to reference the new batch
            var orderItems = await _context.OrderItems
                .Where(oi => oi.BatchId == oldBatchId)
                .ToListAsync();
            
            foreach (var orderItem in orderItems)
            {
                orderItem.BatchId = newBatch.Id;
            }

            // Save OrderItems changes
            await _context.SaveChangesAsync();

            // Delete old batch (now safe since OrderItems and SupplierReturnRequest are updated)
            var oldBatch = await _context.MedicineBatches.FindAsync(oldBatchId);
            if (oldBatch != null)
            {
                _context.MedicineBatches.Remove(oldBatch);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { 
                message = "Return request approved. Old batch deleted and new batch created successfully.",
                newBatchId = newBatch.Id
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "Error processing approval", error = ex.Message });
        }
    }

    [HttpPut("{id}/reject")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> RejectReturnRequest(int id, [FromBody] RejectSupplierReturnRequestDto rejectDto)
    {
        var request = await _context.SupplierReturnRequests.FindAsync(id);

        if (request == null)
        {
            return NotFound(new { message = "Return request not found" });
        }

        if (request.Status != "Pending")
        {
            return BadRequest(new { message = $"Cannot reject request with status: {request.Status}" });
        }

        request.Status = "Rejected";
        request.ResponseDate = DateTime.UtcNow;
        request.Notes = rejectDto.Notes;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Return request rejected successfully" });
    }

    [HttpGet("by-supplier/{supplierId}")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<IEnumerable<SupplierReturnRequestDto>>> GetReturnRequestsBySupplier(int supplierId, [FromQuery] string? status)
    {
        var query = _context.SupplierReturnRequests
            .Include(r => r.Batch)
            .Include(r => r.Medicine)
            .Include(r => r.Supplier)
            .Where(r => r.SupplierId == supplierId)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(r => r.Status == status);
        }

        var requests = await query.OrderByDescending(r => r.RequestDate).ToListAsync();

        var result = requests.Select(r => new SupplierReturnRequestDto
        {
            Id = r.Id,
            BatchId = r.BatchId,
            BatchNumber = r.Batch.BatchNumber,
            MedicineId = r.MedicineId,
            MedicineName = r.Medicine.Name,
            SupplierId = r.SupplierId,
            SupplierName = r.Supplier.Name,
            Quantity = r.Quantity,
            Reason = r.Reason,
            Status = r.Status,
            RequestDate = r.RequestDate,
            ResponseDate = r.ResponseDate,
            Notes = r.Notes,
            NewBatchNumber = r.NewBatchNumber,
            NewExpiryDate = r.NewExpiryDate,
            NewQuantity = r.NewQuantity,
            ExpiryDate = r.Batch.ExpiryDate
        }).ToList();

        return Ok(result);
    }
}

