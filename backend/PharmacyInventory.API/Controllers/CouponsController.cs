using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmacyInventory.API.Data;
using PharmacyInventory.API.DTOs;
using PharmacyInventory.API.Models;
using System.Security.Claims;

namespace PharmacyInventory.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CouponsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CouponsController(AppDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    // Get all coupons (Admin only)
    [HttpGet]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<IEnumerable<CouponDto>>> GetCoupons([FromQuery] bool? activeOnly)
    {
        var query = _context.Coupons
            .Include(c => c.CreatedByAdmin)
            .AsQueryable();

        if (activeOnly == true)
        {
            query = query.Where(c => c.IsActive);
        }

        var coupons = await query
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        var result = coupons.Select(c => new CouponDto
        {
            Id = c.Id,
            Code = c.Code,
            Name = c.Name,
            DiscountType = c.DiscountType,
            DiscountValue = c.DiscountValue,
            MinimumPurchase = c.MinimumPurchase,
            MaximumDiscount = c.MaximumDiscount,
            StartDate = c.StartDate,
            EndDate = c.EndDate,
            UsageLimit = c.UsageLimit,
            UsedCount = c.UsedCount,
            IsActive = c.IsActive,
            CreatedAt = c.CreatedAt,
            CreatedByAdminId = c.CreatedByAdminId,
            CreatedByAdminName = c.CreatedByAdmin?.FullName
        }).ToList();

        return Ok(result);
    }

    // Get active coupons (for users)
    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<CouponDto>>> GetActiveCoupons()
    {
        var now = DateTime.UtcNow;
        var coupons = await _context.Coupons
            .Where(c => c.IsActive 
                && c.StartDate <= now 
                && (c.EndDate == null || c.EndDate >= now)
                && (c.UsageLimit == null || c.UsedCount < c.UsageLimit))
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        var result = coupons.Select(c => new CouponDto
        {
            Id = c.Id,
            Code = c.Code,
            Name = c.Name,
            DiscountType = c.DiscountType,
            DiscountValue = c.DiscountValue,
            MinimumPurchase = c.MinimumPurchase,
            MaximumDiscount = c.MaximumDiscount,
            StartDate = c.StartDate,
            EndDate = c.EndDate,
            UsageLimit = c.UsageLimit,
            UsedCount = c.UsedCount,
            IsActive = c.IsActive,
            CreatedAt = c.CreatedAt
        }).ToList();

        return Ok(result);
    }

    // Get coupon by ID
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<CouponDto>> GetCoupon(int id)
    {
        var coupon = await _context.Coupons
            .Include(c => c.CreatedByAdmin)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (coupon == null)
        {
            return NotFound(new { message = "Coupon not found" });
        }

        var result = new CouponDto
        {
            Id = coupon.Id,
            Code = coupon.Code,
            Name = coupon.Name,
            DiscountType = coupon.DiscountType,
            DiscountValue = coupon.DiscountValue,
            MinimumPurchase = coupon.MinimumPurchase,
            MaximumDiscount = coupon.MaximumDiscount,
            StartDate = coupon.StartDate,
            EndDate = coupon.EndDate,
            UsageLimit = coupon.UsageLimit,
            UsedCount = coupon.UsedCount,
            IsActive = coupon.IsActive,
            CreatedAt = coupon.CreatedAt,
            CreatedByAdminId = coupon.CreatedByAdminId,
            CreatedByAdminName = coupon.CreatedByAdmin?.FullName
        };

        return Ok(result);
    }

    // Validate coupon code
    [HttpPost("validate")]
    public async Task<ActionResult<CouponValidationResultDto>> ValidateCoupon([FromBody] ValidateCouponDto validateDto)
    {
        var coupon = await _context.Coupons
            .FirstOrDefaultAsync(c => c.Code.ToUpper() == validateDto.Code.ToUpper());

        if (coupon == null)
        {
            return Ok(new CouponValidationResultDto
            {
                IsValid = false,
                ErrorMessage = "Invalid coupon code"
            });
        }

        var now = DateTime.UtcNow;

        // Check if coupon is active
        if (!coupon.IsActive)
        {
            return Ok(new CouponValidationResultDto
            {
                IsValid = false,
                ErrorMessage = "This coupon is not active"
            });
        }

        // Check date validity
        if (coupon.StartDate > now)
        {
            return Ok(new CouponValidationResultDto
            {
                IsValid = false,
                ErrorMessage = "This coupon is not yet valid"
            });
        }

        if (coupon.EndDate.HasValue && coupon.EndDate < now)
        {
            return Ok(new CouponValidationResultDto
            {
                IsValid = false,
                ErrorMessage = "This coupon has expired"
            });
        }

        // Check usage limit
        if (coupon.UsageLimit.HasValue && coupon.UsedCount >= coupon.UsageLimit.Value)
        {
            return Ok(new CouponValidationResultDto
            {
                IsValid = false,
                ErrorMessage = "This coupon has reached its usage limit"
            });
        }

        // Check minimum purchase
        if (coupon.MinimumPurchase.HasValue && validateDto.OrderAmount < coupon.MinimumPurchase.Value)
        {
            return Ok(new CouponValidationResultDto
            {
                IsValid = false,
                ErrorMessage = $"Minimum purchase of ${coupon.MinimumPurchase.Value:F2} required"
            });
        }

        // Calculate discount
        decimal discountAmount = 0;
        decimal finalAmount = validateDto.OrderAmount;

        if (coupon.DiscountType == "Percentage")
        {
            discountAmount = validateDto.OrderAmount * (coupon.DiscountValue / 100m);
            if (coupon.MaximumDiscount.HasValue && discountAmount > coupon.MaximumDiscount.Value)
            {
                discountAmount = coupon.MaximumDiscount.Value;
            }
            finalAmount = validateDto.OrderAmount - discountAmount;
        }
        else if (coupon.DiscountType == "FixedAmount")
        {
            discountAmount = coupon.DiscountValue;
            if (discountAmount > validateDto.OrderAmount)
            {
                discountAmount = validateDto.OrderAmount;
            }
            finalAmount = validateDto.OrderAmount - discountAmount;
        }
        else if (coupon.DiscountType == "FreeShipping")
        {
            // Free shipping will be handled separately in order creation
            discountAmount = 0; // Shipping cost will be set to 0
            finalAmount = validateDto.OrderAmount;
        }

        var couponDto = new CouponDto
        {
            Id = coupon.Id,
            Code = coupon.Code,
            Name = coupon.Name,
            DiscountType = coupon.DiscountType,
            DiscountValue = coupon.DiscountValue,
            MinimumPurchase = coupon.MinimumPurchase,
            MaximumDiscount = coupon.MaximumDiscount,
            StartDate = coupon.StartDate,
            EndDate = coupon.EndDate,
            UsageLimit = coupon.UsageLimit,
            UsedCount = coupon.UsedCount,
            IsActive = coupon.IsActive,
            CreatedAt = coupon.CreatedAt
        };

        return Ok(new CouponValidationResultDto
        {
            IsValid = true,
            Coupon = couponDto,
            DiscountAmount = discountAmount,
            FinalAmount = finalAmount
        });
    }

    // Create coupon (Admin only)
    [HttpPost]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<ActionResult<CouponDto>> CreateCoupon([FromBody] CreateCouponDto createDto)
    {
        // Validate discount type
        var validDiscountTypes = new[] { "Percentage", "FixedAmount", "FreeShipping" };
        if (!validDiscountTypes.Contains(createDto.DiscountType))
        {
            return BadRequest(new { message = "Invalid discount type. Must be Percentage, FixedAmount, or FreeShipping" });
        }

        // Validate discount value
        if (createDto.DiscountType == "Percentage" && (createDto.DiscountValue < 0 || createDto.DiscountValue > 100))
        {
            return BadRequest(new { message = "Percentage discount must be between 0 and 100" });
        }

        if ((createDto.DiscountType == "FixedAmount" || createDto.DiscountType == "FreeShipping") && createDto.DiscountValue < 0)
        {
            return BadRequest(new { message = "Discount value cannot be negative" });
        }

        // Check if code already exists
        if (await _context.Coupons.AnyAsync(c => c.Code.ToUpper() == createDto.Code.ToUpper()))
        {
            return BadRequest(new { message = "Coupon code already exists" });
        }

        var adminId = GetUserId();

        var coupon = new Coupon
        {
            Code = createDto.Code.ToUpper(),
            Name = createDto.Name,
            DiscountType = createDto.DiscountType,
            DiscountValue = createDto.DiscountValue,
            MinimumPurchase = createDto.MinimumPurchase,
            MaximumDiscount = createDto.MaximumDiscount,
            StartDate = createDto.StartDate,
            EndDate = createDto.EndDate,
            UsageLimit = createDto.UsageLimit,
            UsedCount = 0,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedByAdminId = adminId
        };

        _context.Coupons.Add(coupon);
        await _context.SaveChangesAsync();

        var result = new CouponDto
        {
            Id = coupon.Id,
            Code = coupon.Code,
            Name = coupon.Name,
            DiscountType = coupon.DiscountType,
            DiscountValue = coupon.DiscountValue,
            MinimumPurchase = coupon.MinimumPurchase,
            MaximumDiscount = coupon.MaximumDiscount,
            StartDate = coupon.StartDate,
            EndDate = coupon.EndDate,
            UsageLimit = coupon.UsageLimit,
            UsedCount = coupon.UsedCount,
            IsActive = coupon.IsActive,
            CreatedAt = coupon.CreatedAt,
            CreatedByAdminId = coupon.CreatedByAdminId
        };

        return CreatedAtAction(nameof(GetCoupon), new { id = coupon.Id }, result);
    }

    // Update coupon (Admin only)
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> UpdateCoupon(int id, [FromBody] UpdateCouponDto updateDto)
    {
        var coupon = await _context.Coupons.FindAsync(id);

        if (coupon == null)
        {
            return NotFound(new { message = "Coupon not found" });
        }

        if (updateDto.Name != null) coupon.Name = updateDto.Name;
        if (updateDto.DiscountType != null)
        {
            var validDiscountTypes = new[] { "Percentage", "FixedAmount", "FreeShipping" };
            if (!validDiscountTypes.Contains(updateDto.DiscountType))
            {
                return BadRequest(new { message = "Invalid discount type" });
            }
            coupon.DiscountType = updateDto.DiscountType;
        }
        if (updateDto.DiscountValue.HasValue) coupon.DiscountValue = updateDto.DiscountValue.Value;
        if (updateDto.MinimumPurchase.HasValue) coupon.MinimumPurchase = updateDto.MinimumPurchase;
        if (updateDto.MaximumDiscount.HasValue) coupon.MaximumDiscount = updateDto.MaximumDiscount;
        if (updateDto.StartDate.HasValue) coupon.StartDate = updateDto.StartDate.Value;
        if (updateDto.EndDate.HasValue) coupon.EndDate = updateDto.EndDate;
        if (updateDto.UsageLimit.HasValue) coupon.UsageLimit = updateDto.UsageLimit;
        if (updateDto.IsActive.HasValue) coupon.IsActive = updateDto.IsActive.Value;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // Toggle coupon active status (Admin only)
    [HttpPatch("{id}/toggle-status")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> ToggleCouponStatus(int id)
    {
        var coupon = await _context.Coupons.FindAsync(id);

        if (coupon == null)
        {
            return NotFound(new { message = "Coupon not found" });
        }

        coupon.IsActive = !coupon.IsActive;
        await _context.SaveChangesAsync();

        return Ok(new { isActive = coupon.IsActive });
    }

    // Delete coupon (Admin only)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Pharmacist")]
    public async Task<IActionResult> DeleteCoupon(int id)
    {
        var coupon = await _context.Coupons.FindAsync(id);

        if (coupon == null)
        {
            return NotFound(new { message = "Coupon not found" });
        }

        // Check if coupon has been used
        var usedCount = await _context.Orders.CountAsync(o => o.CouponId == id);
        if (usedCount > 0)
        {
            return BadRequest(new { message = "Cannot delete coupon that has been used. Deactivate it instead." });
        }

        _context.Coupons.Remove(coupon);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

