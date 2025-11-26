namespace PharmacyInventory.API.Models;

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Pending"; // Pending, Paid, Completed
    public decimal SubTotal { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal? DiscountAmount { get; set; } // Discount from coupon
    public int? CouponId { get; set; } // Applied coupon
    public decimal TotalAmount { get; set; }
    public string PurchaseSource { get; set; } = "Website"; // "Website" for customers, "Pharmacy" for admin/pharmacist

    // Navigation properties
    public User User { get; set; } = null!;
    public Coupon? Coupon { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<Bill> Bills { get; set; } = new List<Bill>();
}

