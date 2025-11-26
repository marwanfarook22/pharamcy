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
[Authorize]
public class RefundRequestsController : ControllerBase
{
    private readonly AppDbContext _context;

    public RefundRequestsController(AppDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RefundRequestDto>>> GetRefundRequests([FromQuery] string? status)
    {
        var userId = GetUserId();
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("Pharmacist");

        var query = _context.RefundRequests
            .Include(r => r.Order)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Medicine)
            .Include(r => r.Order)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Batch)
            .Include(r => r.User)
            .Include(r => r.Admin)
            .AsQueryable();

        // Customers can only see their own requests
        if (!isAdmin)
        {
            query = query.Where(r => r.UserId == userId);
        }

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(r => r.Status == status);
        }

        var requests = await query.OrderByDescending(r => r.RequestDate).ToListAsync();

        var result = requests.Select(r => new RefundRequestDto
        {
            Id = r.Id,
            OrderId = r.OrderId,
            UserId = r.UserId,
            UserName = r.User?.FullName ?? "Unknown",
            UserEmail = r.User?.Email ?? "",
            Reason = r.Reason,
            Status = r.Status,
            RequestDate = r.RequestDate,
            ResponseDate = r.ResponseDate,
            RefundAmount = r.RefundAmount,
            OrderTotalAmount = r.Order.TotalAmount,
            RefundMethod = r.RefundMethod,
            Notes = r.Notes,
            AdminId = r.AdminId,
            AdminName = r.Admin?.FullName,
            OrderStatus = r.Order.Status,
            OrderDate = r.Order.OrderDate,
            OrderItems = r.Order.OrderItems.Select(oi => new RefundRequestItemDto
            {
                Id = oi.Id,
                MedicineId = oi.MedicineId,
                MedicineName = oi.Medicine?.Name ?? "Unknown",
                BatchNumber = oi.Batch?.BatchNumber ?? "N/A",
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                SubTotal = oi.UnitPrice * oi.Quantity
            }).ToList()
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RefundRequestDto>> GetRefundRequest(int id)
    {
        var userId = GetUserId();
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("Pharmacist");

        var request = await _context.RefundRequests
            .Include(r => r.Order)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Medicine)
            .Include(r => r.Order)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Batch)
            .Include(r => r.User)
            .Include(r => r.Admin)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null)
        {
            return NotFound(new { message = "Refund request not found" });
        }

        // Customers can only view their own requests
        if (!isAdmin && request.UserId != userId)
        {
            return Forbid();
        }

        var result = new RefundRequestDto
        {
            Id = request.Id,
            OrderId = request.OrderId,
            UserId = request.UserId,
            UserName = request.User?.FullName ?? "Unknown",
            UserEmail = request.User?.Email ?? "",
            Reason = request.Reason,
            Status = request.Status,
            RequestDate = request.RequestDate,
            ResponseDate = request.ResponseDate,
            RefundAmount = request.RefundAmount,
            OrderTotalAmount = request.Order.TotalAmount,
            RefundMethod = request.RefundMethod,
            Notes = request.Notes,
            AdminId = request.AdminId,
            AdminName = request.Admin?.FullName,
            OrderStatus = request.Order.Status,
            OrderDate = request.Order.OrderDate,
            OrderItems = request.Order.OrderItems.Select(oi => new RefundRequestItemDto
            {
                Id = oi.Id,
                MedicineId = oi.MedicineId,
                MedicineName = oi.Medicine?.Name ?? "Unknown",
                BatchNumber = oi.Batch?.BatchNumber ?? "N/A",
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                SubTotal = oi.UnitPrice * oi.Quantity
            }).ToList()
        };

        return Ok(result);
    }

    [HttpGet("by-user/{userId}")]
    public async Task<ActionResult<IEnumerable<RefundRequestDto>>> GetRefundRequestsByUser(int userId, [FromQuery] string? status)
    {
        var currentUserId = GetUserId();
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("Pharmacist");

        // Customers can only view their own requests
        if (!isAdmin && userId != currentUserId)
        {
            return Forbid();
        }

        var query = _context.RefundRequests
            .Include(r => r.Order)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Medicine)
            .Include(r => r.Order)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Batch)
            .Include(r => r.User)
            .Include(r => r.Admin)
            .Where(r => r.UserId == userId)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(r => r.Status == status);
        }

        var requests = await query.OrderByDescending(r => r.RequestDate).ToListAsync();

        var result = requests.Select(r => new RefundRequestDto
        {
            Id = r.Id,
            OrderId = r.OrderId,
            UserId = r.UserId,
            UserName = r.User?.FullName ?? "Unknown",
            UserEmail = r.User?.Email ?? "",
            Reason = r.Reason,
            Status = r.Status,
            RequestDate = r.RequestDate,
            ResponseDate = r.ResponseDate,
            RefundAmount = r.RefundAmount,
            OrderTotalAmount = r.Order.TotalAmount,
            RefundMethod = r.RefundMethod,
            Notes = r.Notes,
            AdminId = r.AdminId,
            AdminName = r.Admin?.FullName,
            OrderStatus = r.Order.Status,
            OrderDate = r.Order.OrderDate,
            OrderItems = r.Order.OrderItems.Select(oi => new RefundRequestItemDto
            {
                Id = oi.Id,
                MedicineId = oi.MedicineId,
                MedicineName = oi.Medicine?.Name ?? "Unknown",
                BatchNumber = oi.Batch?.BatchNumber ?? "N/A",
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                SubTotal = oi.UnitPrice * oi.Quantity
            }).ToList()
        }).ToList();

        return Ok(result);
    }

    [HttpGet("by-order/{orderId}")]
    public async Task<ActionResult<IEnumerable<RefundRequestDto>>> GetRefundRequestsByOrder(int orderId)
    {
        var userId = GetUserId();
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("Pharmacist");

        // Check if order exists and user has access
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
        {
            return NotFound(new { message = "Order not found" });
        }

        if (!isAdmin && order.UserId != userId)
        {
            return Forbid();
        }

        var requests = await _context.RefundRequests
            .Include(r => r.Order)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Medicine)
            .Include(r => r.Order)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Batch)
            .Include(r => r.User)
            .Include(r => r.Admin)
            .Where(r => r.OrderId == orderId)
            .OrderByDescending(r => r.RequestDate)
            .ToListAsync();

        var result = requests.Select(r => new RefundRequestDto
        {
            Id = r.Id,
            OrderId = r.OrderId,
            UserId = r.UserId,
            UserName = r.User?.FullName ?? "Unknown",
            UserEmail = r.User?.Email ?? "",
            Reason = r.Reason,
            Status = r.Status,
            RequestDate = r.RequestDate,
            ResponseDate = r.ResponseDate,
            RefundAmount = r.RefundAmount,
            OrderTotalAmount = r.Order.TotalAmount,
            RefundMethod = r.RefundMethod,
            Notes = r.Notes,
            AdminId = r.AdminId,
            AdminName = r.Admin?.FullName,
            OrderStatus = r.Order.Status,
            OrderDate = r.Order.OrderDate,
            OrderItems = r.Order.OrderItems.Select(oi => new RefundRequestItemDto
            {
                Id = oi.Id,
                MedicineId = oi.MedicineId,
                MedicineName = oi.Medicine?.Name ?? "Unknown",
                BatchNumber = oi.Batch?.BatchNumber ?? "N/A",
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                SubTotal = oi.UnitPrice * oi.Quantity
            }).ToList()
        }).ToList();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<RefundRequestDto>> CreateRefundRequest([FromBody] CreateRefundRequestDto createDto)
    {
        var userId = GetUserId();

        // Validate order exists
        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Medicine)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Batch)
            .FirstOrDefaultAsync(o => o.Id == createDto.OrderId);

        if (order == null)
        {
            return BadRequest(new { message = "Order not found" });
        }

        // Validate order belongs to user
        if (order.UserId != userId)
        {
            return Forbid();
        }

        // Validate order is refundable (Paid or Completed status)
        if (order.Status != "Paid" && order.Status != "Completed")
        {
            return BadRequest(new { message = $"Order with status '{order.Status}' cannot be refunded. Only 'Paid' or 'Completed' orders can be refunded." });
        }

        // Check if there's already a pending refund request for this order
        var existingRequest = await _context.RefundRequests
            .FirstOrDefaultAsync(r => r.OrderId == createDto.OrderId && r.Status == "Pending");

        if (existingRequest != null)
        {
            return BadRequest(new { message = "There is already a pending refund request for this order" });
        }

        // Calculate refund amount based on selected items or full order
        decimal refundAmount;
        if (createDto.OrderItemIds != null && createDto.OrderItemIds.Any())
        {
            // Partial refund: calculate amount for selected items only
            var selectedItems = order.OrderItems
                .Where(oi => createDto.OrderItemIds.Contains(oi.Id))
                .ToList();

            if (!selectedItems.Any())
            {
                return BadRequest(new { message = "No valid order items selected for refund" });
            }

            refundAmount = selectedItems.Sum(oi => oi.UnitPrice * oi.Quantity);
            
            // If a specific refund amount is provided, use it (but validate it)
            if (createDto.RefundAmount.HasValue)
            {
                if (createDto.RefundAmount.Value <= 0 || createDto.RefundAmount.Value > refundAmount)
                {
                    return BadRequest(new { message = $"Refund amount must be between 0 and {refundAmount} for selected items" });
                }
                refundAmount = createDto.RefundAmount.Value;
            }
        }
        else
        {
            // Full order refund
            refundAmount = createDto.RefundAmount ?? order.TotalAmount;
            if (refundAmount <= 0 || refundAmount > order.TotalAmount)
            {
                return BadRequest(new { message = $"Refund amount must be between 0 and {order.TotalAmount}" });
            }
        }

        // Check refund window (7 days from order date)
        var daysSinceOrder = (DateTime.UtcNow - order.OrderDate).TotalDays;
        if (daysSinceOrder > 7)
        {
            return BadRequest(new { message = "Refund requests must be made within 7 days of order date" });
        }

        var request = new RefundRequest
        {
            OrderId = createDto.OrderId,
            UserId = userId,
            Reason = createDto.Reason,
            Status = "Pending",
            RequestDate = DateTime.UtcNow,
            RefundAmount = refundAmount,
            Notes = createDto.Notes
        };

        _context.RefundRequests.Add(request);
        await _context.SaveChangesAsync();

        // Reload with includes
        var createdRequest = await _context.RefundRequests
            .Include(r => r.Order)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Medicine)
            .Include(r => r.Order)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Batch)
            .Include(r => r.User)
            .Include(r => r.Admin)
            .FirstOrDefaultAsync(r => r.Id == request.Id);

        var result = new RefundRequestDto
        {
            Id = createdRequest!.Id,
            OrderId = createdRequest.OrderId,
            UserId = createdRequest.UserId,
            UserName = createdRequest.User?.FullName ?? "Unknown",
            UserEmail = createdRequest.User?.Email ?? "",
            Reason = createdRequest.Reason,
            Status = createdRequest.Status,
            RequestDate = createdRequest.RequestDate,
            ResponseDate = createdRequest.ResponseDate,
            RefundAmount = createdRequest.RefundAmount,
            OrderTotalAmount = createdRequest.Order.TotalAmount,
            RefundMethod = createdRequest.RefundMethod,
            Notes = createdRequest.Notes,
            AdminId = createdRequest.AdminId,
            AdminName = createdRequest.Admin?.FullName,
            OrderStatus = createdRequest.Order.Status,
            OrderDate = createdRequest.Order.OrderDate,
            OrderItems = createdRequest.Order.OrderItems.Select(oi => new RefundRequestItemDto
            {
                Id = oi.Id,
                MedicineId = oi.MedicineId,
                MedicineName = oi.Medicine?.Name ?? "Unknown",
                BatchNumber = oi.Batch?.BatchNumber ?? "N/A",
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                SubTotal = oi.UnitPrice * oi.Quantity
            }).ToList()
        };

        return CreatedAtAction(nameof(GetRefundRequest), new { id = request.Id }, result);
    }

    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> ApproveRefundRequest(int id, [FromBody] ApproveRefundRequestDto approveDto)
    {
        var request = await _context.RefundRequests
            .Include(r => r.Order)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Batch)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null)
        {
            return NotFound(new { message = "Refund request not found" });
        }

        if (request.Status != "Pending")
        {
            return BadRequest(new { message = $"Cannot approve request with status: {request.Status}" });
        }

        var adminId = GetUserId();

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Update request status
            request.Status = "Approved";
            request.ResponseDate = DateTime.UtcNow;
            request.AdminId = adminId;
            request.RefundMethod = approveDto.RefundMethod ?? "Original Payment Method";
            request.Notes = approveDto.Notes;

            // Restore inventory for each order item
            foreach (var orderItem in request.Order.OrderItems)
            {
                var batch = await _context.MedicineBatches.FindAsync(orderItem.BatchId);
                if (batch != null)
                {
                    batch.Quantity += orderItem.Quantity;
                }
            }

            // Update order status to "Refunded"
            request.Order.Status = "Refunded";

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Refund request approved successfully. Inventory restored and order marked as refunded." });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "Error processing approval", error = ex.Message });
        }
    }

    [HttpPut("{id}/reject")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> RejectRefundRequest(int id, [FromBody] RejectRefundRequestDto rejectDto)
    {
        var request = await _context.RefundRequests.FindAsync(id);

        if (request == null)
        {
            return NotFound(new { message = "Refund request not found" });
        }

        if (request.Status != "Pending")
        {
            return BadRequest(new { message = $"Cannot reject request with status: {request.Status}" });
        }

        var adminId = GetUserId();

        request.Status = "Rejected";
        request.ResponseDate = DateTime.UtcNow;
        request.AdminId = adminId;
        request.Notes = rejectDto.Notes;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Refund request rejected successfully" });
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> UpdateRefundRequestStatus(int id, [FromBody] UpdateRefundRequestStatusDto updateDto)
    {
        var request = await _context.RefundRequests.FindAsync(id);

        if (request == null)
        {
            return NotFound(new { message = "Refund request not found" });
        }

        var validStatuses = new[] { "Pending", "Approved", "Rejected", "Processing", "Completed" };
        if (!validStatuses.Contains(updateDto.Status))
        {
            return BadRequest(new { message = $"Invalid status. Must be one of: {string.Join(", ", validStatuses)}" });
        }

        var adminId = GetUserId();

        request.Status = updateDto.Status;
        if (updateDto.Status != "Pending" && request.ResponseDate == null)
        {
            request.ResponseDate = DateTime.UtcNow;
        }
        request.AdminId = adminId;
        request.RefundMethod = updateDto.RefundMethod ?? request.RefundMethod;
        request.Notes = updateDto.Notes ?? request.Notes;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Refund request status updated successfully" });
    }
}

