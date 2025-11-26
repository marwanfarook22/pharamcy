namespace PharmacyInventory.API.Models;

public class Coupon
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty; // Unique coupon code
    public string Name { get; set; } = string.Empty; // Coupon name/description
    public string DiscountType { get; set; } = string.Empty; // "Percentage", "FixedAmount", "FreeShipping"
    public decimal DiscountValue { get; set; } // Percentage (0-100) or fixed amount
    public decimal? MinimumPurchase { get; set; } // Minimum order amount required
    public decimal? MaximumDiscount { get; set; } // Maximum discount cap (for percentage)
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; } // Null means no expiration
    public int? UsageLimit { get; set; } // Total usage limit (null = unlimited)
    public int UsedCount { get; set; } = 0; // Current usage count
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int? CreatedByAdminId { get; set; } // Admin who created the coupon

    // Navigation properties
    public User? CreatedByAdmin { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
