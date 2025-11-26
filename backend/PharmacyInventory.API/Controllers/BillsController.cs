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
public class BillsController : ControllerBase
{
    private readonly AppDbContext _context;

    public BillsController(AppDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BillDto>>> GetBills([FromQuery] int? orderId)
    {
        var userId = GetUserId();
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("Pharmacist");

        var query = _context.Bills
            .Include(b => b.Order)
                .ThenInclude(o => o.User)
            .Include(b => b.Order)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Medicine)
            .Include(b => b.Order)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Batch)
            .AsQueryable();

        if (!isAdmin)
        {
            query = query.Where(b => b.Order.UserId == userId);
        }

        if (orderId.HasValue)
        {
            query = query.Where(b => b.OrderId == orderId.Value);
        }

        var bills = await query.OrderByDescending(b => b.IssueDate).ToListAsync();

        var result = bills.Select(b => new BillDto
        {
            Id = b.Id,
            OrderId = b.OrderId,
            BillNumber = b.BillNumber,
            IssueDate = b.IssueDate,
            SubTotal = b.SubTotal,
            Tax = b.Tax,
            TotalAmount = b.TotalAmount,
            Status = b.Status,
            Order = new OrderDto
            {
                Id = b.Order.Id,
                UserId = b.Order.UserId,
                UserName = b.Order.User.FullName,
                OrderDate = b.Order.OrderDate,
                Status = b.Order.Status,
                TotalAmount = b.Order.TotalAmount,
                PurchaseSource = b.Order.PurchaseSource,
                Items = b.Order.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    MedicineId = oi.MedicineId,
                    MedicineName = oi.Medicine.Name,
                    BatchNumber = oi.Batch.BatchNumber,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    SubTotal = oi.UnitPrice * oi.Quantity
                }).ToList(),
                Payments = new List<PaymentDto>()
            }
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BillDto>> GetBill(int id)
    {
        var userId = GetUserId();
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("Pharmacist");

        var bill = await _context.Bills
            .Include(b => b.Order)
                .ThenInclude(o => o.User)
            .Include(b => b.Order)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Medicine)
            .Include(b => b.Order)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Batch)
            .Include(b => b.Order)
                .ThenInclude(o => o.Payments)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (bill == null)
        {
            return NotFound();
        }

        if (!isAdmin && bill.Order.UserId != userId)
        {
            return Forbid();
        }

        var result = new BillDto
        {
            Id = bill.Id,
            OrderId = bill.OrderId,
            BillNumber = bill.BillNumber,
            IssueDate = bill.IssueDate,
            SubTotal = bill.SubTotal,
            Tax = bill.Tax,
            TotalAmount = bill.TotalAmount,
            Status = bill.Status,
            Order = new OrderDto
            {
                Id = bill.Order.Id,
                UserId = bill.Order.UserId,
                UserName = bill.Order.User.FullName,
                OrderDate = bill.Order.OrderDate,
                Status = bill.Order.Status,
                TotalAmount = bill.Order.TotalAmount,
                Items = bill.Order.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    MedicineId = oi.MedicineId,
                    MedicineName = oi.Medicine.Name,
                    BatchNumber = oi.Batch.BatchNumber,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    SubTotal = oi.UnitPrice * oi.Quantity
                }).ToList(),
                Payments = bill.Order.Payments.Select(p => new PaymentDto
                {
                    Id = p.Id,
                    OrderId = p.OrderId,
                    PaymentDate = p.PaymentDate,
                    Amount = p.Amount,
                    Method = p.Method,
                    Status = "Paid" // Status column was removed from database, defaulting to "Paid"
                }).ToList()
            }
        };

        return Ok(result);
    }

    [HttpGet("order/{orderId}")]
    public async Task<ActionResult<BillDto>> GetBillByOrderId(int orderId)
    {
        var userId = GetUserId();
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("Pharmacist");

        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
        {
            return NotFound(new { message = "Order not found" });
        }

        if (!isAdmin && order.UserId != userId)
        {
            return Forbid();
        }

        var bill = await _context.Bills
            .Include(b => b.Order)
                .ThenInclude(o => o.User)
            .Include(b => b.Order)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Medicine)
            .Include(b => b.Order)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Batch)
            .Include(b => b.Order)
                .ThenInclude(o => o.Payments)
            .FirstOrDefaultAsync(b => b.OrderId == orderId);

        if (bill == null)
        {
            return NotFound(new { message = "Bill not found for this order" });
        }

        var result = new BillDto
        {
            Id = bill.Id,
            OrderId = bill.OrderId,
            BillNumber = bill.BillNumber,
            IssueDate = bill.IssueDate,
            SubTotal = bill.SubTotal,
            Tax = bill.Tax,
            TotalAmount = bill.TotalAmount,
            Status = bill.Status,
            Order = new OrderDto
            {
                Id = bill.Order.Id,
                UserId = bill.Order.UserId,
                UserName = bill.Order.User.FullName,
                OrderDate = bill.Order.OrderDate,
                Status = bill.Order.Status,
                TotalAmount = bill.Order.TotalAmount,
                Items = bill.Order.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    MedicineId = oi.MedicineId,
                    MedicineName = oi.Medicine.Name,
                    BatchNumber = oi.Batch.BatchNumber,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    SubTotal = oi.UnitPrice * oi.Quantity
                }).ToList(),
                Payments = bill.Order.Payments.Select(p => new PaymentDto
                {
                    Id = p.Id,
                    OrderId = p.OrderId,
                    PaymentDate = p.PaymentDate,
                    Amount = p.Amount,
                    Method = p.Method,
                    Status = "Paid" // Status column was removed from database, defaulting to "Paid"
                }).ToList()
            }
        };

        return Ok(result);
    }
}

