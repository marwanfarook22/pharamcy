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
public class PaymentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PaymentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<IEnumerable<PaymentDto>>> GetPayments([FromQuery] int? orderId)
    {
        var query = _context.Payments
            .Include(p => p.Order)
            .AsQueryable();

        if (orderId.HasValue)
        {
            query = query.Where(p => p.OrderId == orderId);
        }

        var payments = await query.OrderByDescending(p => p.PaymentDate).ToListAsync();

        var result = payments.Select(p => new PaymentDto
        {
            Id = p.Id,
            OrderId = p.OrderId,
            PaymentDate = p.PaymentDate,
            Amount = p.Amount,
            Method = p.Method,
            Status = "Paid" // Status column was removed from database, defaulting to "Paid"
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PaymentDto>> GetPayment(int id)
    {
        var payment = await _context.Payments
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (payment == null)
        {
            return NotFound();
        }

        var result = new PaymentDto
        {
            Id = payment.Id,
            OrderId = payment.OrderId,
            PaymentDate = payment.PaymentDate,
            Amount = payment.Amount,
            Method = payment.Method,
            Status = "Paid" // Status column was removed from database, defaulting to "Paid"
        };

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<PaymentDto>> CreatePayment([FromBody] CreatePaymentDto createDto)
    {
        var order = await _context.Orders.FindAsync(createDto.OrderId);

        if (order == null)
        {
            return NotFound(new { message = "Order not found" });
        }

        var payment = new Payment
        {
            OrderId = createDto.OrderId,
            PaymentDate = DateTime.UtcNow,
            Amount = createDto.Amount,
            Method = createDto.Method
        };

        _context.Payments.Add(payment);

        // Update order status
        order.Status = "Paid";
        await _context.SaveChangesAsync();

        var result = new PaymentDto
        {
            Id = payment.Id,
            OrderId = payment.OrderId,
            PaymentDate = payment.PaymentDate,
            Amount = payment.Amount,
            Method = payment.Method,
            Status = "Paid" // Status column was removed from database, defaulting to "Paid"
        };

        return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, result);
    }
}

