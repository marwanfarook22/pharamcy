namespace PharmacyInventory.API.Models;

public class RefundRequest
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int UserId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Processing, Completed
    public DateTime RequestDate { get; set; } = DateTime.UtcNow;
    public DateTime? ResponseDate { get; set; }
    public decimal RefundAmount { get; set; }
    public string? RefundMethod { get; set; } // Original Payment Method, Cash, Wallet, Credit
    public string? Notes { get; set; }
    public int? AdminId { get; set; } // Admin who processed the request

    // Navigation properties
    public Order Order { get; set; } = null!;
    public User User { get; set; } = null!;
    public User? Admin { get; set; }
}


