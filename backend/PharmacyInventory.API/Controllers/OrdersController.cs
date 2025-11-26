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
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    private decimal CalculateShippingCost(decimal subtotal)
    {
        // Shipping cost ranges from $5.00 to $10.00 based on order total
        // Orders under $50: $10.00 shipping
        // Orders $50-$100: $7.50 shipping
        // Orders over $100: $5.00 shipping
        if (subtotal < 50)
        {
            return 10.00m;
        }
        else if (subtotal < 100)
        {
            return 7.50m;
        }
        else
        {
            return 5.00m;
        }
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrders([FromQuery] string? status)
    {
        try
        {
            var userId = GetUserId();
            var isAdmin = User.IsInRole("Admin") || User.IsInRole("Pharmacist");

            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Medicine)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Batch)
                .Include(o => o.Payments)
                .AsQueryable();

            if (!isAdmin)
            {
                query = query.Where(o => o.UserId == userId);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(o => o.Status == status);
            }

            var orders = await query.OrderByDescending(o => o.OrderDate).ToListAsync();

            var result = orders.Select(o => new OrderDto
            {
                Id = o.Id,
                UserId = o.UserId,
                UserName = o.User?.FullName ?? "Unknown",
                OrderDate = o.OrderDate,
                Status = o.Status,
                SubTotal = o.SubTotal,
                ShippingCost = o.ShippingCost,
                CouponId = o.CouponId,
                CouponCode = o.Coupon?.Code,
                DiscountAmount = o.DiscountAmount,
                TotalAmount = o.TotalAmount,
                PurchaseSource = o.PurchaseSource,
                Items = o.OrderItems
                    .Where(oi => oi.Medicine != null && oi.Batch != null) // Filter out items with null references
                    .Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        MedicineId = oi.MedicineId,
                        MedicineName = oi.Medicine?.Name ?? "Unknown",
                        BatchNumber = oi.Batch?.BatchNumber ?? "N/A",
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        SubTotal = oi.UnitPrice * oi.Quantity
                    }).ToList(),
                Payments = o.Payments.Select(p => new PaymentDto
                {
                    Id = p.Id,
                    OrderId = p.OrderId,
                    PaymentDate = p.PaymentDate,
                    Amount = p.Amount,
                    Method = p.Method,
                    Status = "Paid" // Status column was removed from database, defaulting to "Paid"
                }).ToList()
            }).ToList();

            return Ok(result);
        }
        catch (Exception ex)
        {
            // Log the exception for debugging
            Console.WriteLine($"Error in GetOrders: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            return StatusCode(500, new { message = "An error occurred while retrieving orders", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrder(int id)
    {
        try
        {
            var userId = GetUserId();
            var isAdmin = User.IsInRole("Admin") || User.IsInRole("Pharmacist");

            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Coupon)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Medicine)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Batch)
                .Include(o => o.Payments)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            if (!isAdmin && order.UserId != userId)
            {
                return Forbid();
            }

            var result = new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                UserName = order.User?.FullName ?? "Unknown",
                OrderDate = order.OrderDate,
                Status = order.Status,
                SubTotal = order.SubTotal,
                ShippingCost = order.ShippingCost,
                CouponId = order.CouponId,
                CouponCode = order.Coupon?.Code,
                DiscountAmount = order.DiscountAmount,
                TotalAmount = order.TotalAmount,
                PurchaseSource = order.PurchaseSource,
                Items = order.OrderItems
                    .Where(oi => oi.Medicine != null && oi.Batch != null) // Filter out items with null references
                    .Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        MedicineId = oi.MedicineId,
                        MedicineName = oi.Medicine?.Name ?? "Unknown",
                        BatchNumber = oi.Batch?.BatchNumber ?? "N/A",
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        SubTotal = oi.UnitPrice * oi.Quantity
                    }).ToList(),
                Payments = order.Payments.Select(p => new PaymentDto
                {
                    Id = p.Id,
                    OrderId = p.OrderId,
                    PaymentDate = p.PaymentDate,
                    Amount = p.Amount,
                    Method = p.Method,
                    Status = "Paid" // Status column was removed from database, defaulting to "Paid"
                }).ToList()
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            // Log the exception for debugging
            Console.WriteLine($"Error in GetOrder: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            return StatusCode(500, new { message = "An error occurred while retrieving the order", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CreateOrderDto createDto)
    {
        var userId = GetUserId();
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("Pharmacist");

        // Get user's cart
        var cart = await _context.Carts
            .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Medicine)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null || !cart.CartItems.Any())
        {
            return BadRequest(new { message = "Cart is empty" });
        }

        // Create order
        var order = new Order
        {
            UserId = userId,
            OrderDate = DateTime.UtcNow,
            Status = "Pending",
            SubTotal = 0,
            ShippingCost = 0,
            TotalAmount = 0,
            PurchaseSource = isAdmin ? "Pharmacy" : "Website"
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        decimal subtotal = 0;

        // Process each cart item using FEFO (First Expiry First Out)
        foreach (var cartItem in cart.CartItems)
        {
            var remainingQuantity = cartItem.Quantity;

            // Get batches sorted by expiry date (FEFO)
            var batches = await _context.MedicineBatches
                .Where(b => b.MedicineId == cartItem.MedicineId && b.Quantity > 0)
                .OrderBy(b => b.ExpiryDate)
                .ToListAsync();

            foreach (var batch in batches)
            {
                if (remainingQuantity <= 0) break;

                var quantityToTake = Math.Min(remainingQuantity, batch.Quantity);

                // Create order item
                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    MedicineId = cartItem.MedicineId,
                    BatchId = batch.Id,
                    Quantity = quantityToTake,
                    UnitPrice = cartItem.Medicine.UnitPrice
                };

                _context.OrderItems.Add(orderItem);

                // Update batch quantity
                batch.Quantity -= quantityToTake;

                subtotal += orderItem.UnitPrice * quantityToTake;
                remainingQuantity -= quantityToTake;
            }

            if (remainingQuantity > 0)
            {
                // Not enough stock
                _context.Orders.Remove(order);
                await _context.SaveChangesAsync();
                return BadRequest(new { message = $"Insufficient stock for {cartItem.Medicine.Name}" });
            }
        }

        // Calculate shipping cost (ranges from $5.00 to $10.00)
        decimal shippingCost = CalculateShippingCost(subtotal);
        
        // Apply coupon if provided
        decimal discountAmount = 0;
        Coupon? appliedCoupon = null;
        
        if (!string.IsNullOrEmpty(createDto.CouponCode))
        {
            appliedCoupon = await _context.Coupons
                .FirstOrDefaultAsync(c => c.Code.ToUpper() == createDto.CouponCode.ToUpper());
            
            if (appliedCoupon != null)
            {
                var now = DateTime.UtcNow;
                
                // Validate coupon
                bool isValid = appliedCoupon.IsActive
                    && appliedCoupon.StartDate <= now
                    && (appliedCoupon.EndDate == null || appliedCoupon.EndDate >= now)
                    && (appliedCoupon.UsageLimit == null || appliedCoupon.UsedCount < appliedCoupon.UsageLimit)
                    && (!appliedCoupon.MinimumPurchase.HasValue || subtotal >= appliedCoupon.MinimumPurchase.Value);
                
                if (isValid)
                {
                    // Calculate discount
                    if (appliedCoupon.DiscountType == "Percentage")
                    {
                        discountAmount = subtotal * (appliedCoupon.DiscountValue / 100m);
                        if (appliedCoupon.MaximumDiscount.HasValue && discountAmount > appliedCoupon.MaximumDiscount.Value)
                        {
                            discountAmount = appliedCoupon.MaximumDiscount.Value;
                        }
                    }
                    else if (appliedCoupon.DiscountType == "FixedAmount")
                    {
                        discountAmount = appliedCoupon.DiscountValue;
                        if (discountAmount > subtotal)
                        {
                            discountAmount = subtotal;
                        }
                    }
                    else if (appliedCoupon.DiscountType == "FreeShipping")
                    {
                        discountAmount = shippingCost; // Free shipping discount
                        shippingCost = 0;
                    }
                    
                    // Apply coupon to order
                    order.CouponId = appliedCoupon.Id;
                    order.DiscountAmount = discountAmount;
                    
                    // Increment coupon usage
                    appliedCoupon.UsedCount++;
                }
            }
        }
        
        // Set order amounts
        order.SubTotal = subtotal;
        order.ShippingCost = shippingCost;
        order.TotalAmount = subtotal + shippingCost - discountAmount;
        await _context.SaveChangesAsync();

        // Increment user's purchase count
        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            user.PurchaseCount++;
            await _context.SaveChangesAsync();
        }

        // Create payment record if provided
        // Note: All orders start as "Pending" regardless of payment method
        // Admin will manually update status to "Paid" after confirming payment
        if (createDto.PaymentMethod != null)
        {
            var payment = new Payment
            {
                OrderId = order.Id,
                PaymentDate = DateTime.UtcNow,
                Amount = order.TotalAmount,
                Method = createDto.PaymentMethod
            };

            _context.Payments.Add(payment);
            // Order status remains "Pending" - admin will update to "Paid" after confirming payment
            await _context.SaveChangesAsync();
        }

        // Automatically create a bill (invoice) for the order
        await CreateBillForOrder(order.Id, order.TotalAmount);

        // Clear cart
        _context.CartItems.RemoveRange(cart.CartItems);
        await _context.SaveChangesAsync();

        // Return created order
        return await GetOrder(order.Id);
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto updateDto)
    {
        var order = await _context.Orders.FindAsync(id);

        if (order == null)
        {
            return NotFound();
        }

        order.Status = updateDto.Status;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task CreateBillForOrder(int orderId, decimal totalAmount)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null) return;

        // Generate unique bill number (format: BILL-YYYYMMDD-XXXX)
        var datePrefix = DateTime.UtcNow.ToString("yyyyMMdd");
        var billCount = await _context.Bills
            .CountAsync(b => b.BillNumber.StartsWith($"BILL-{datePrefix}-"));
        var billNumber = $"BILL-{datePrefix}-{(billCount + 1):D4}";

        // Ensure uniqueness
        while (await _context.Bills.AnyAsync(b => b.BillNumber == billNumber))
        {
            billCount++;
            billNumber = $"BILL-{datePrefix}-{(billCount + 1):D4}";
        }

        var bill = new Bill
        {
            OrderId = orderId,
            BillNumber = billNumber,
            IssueDate = DateTime.UtcNow,
            SubTotal = order.SubTotal,
            Tax = 0, // Can be configured later if tax is needed
            TotalAmount = totalAmount, // Includes shipping
            Status = "Issued"
        };

        _context.Bills.Add(bill);
        await _context.SaveChangesAsync();
    }
}






