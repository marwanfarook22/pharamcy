namespace PharmacyInventory.API.Models;

public class Bill
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string BillNumber { get; set; } = string.Empty; // Unique invoice number
    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    public decimal SubTotal { get; set; }
    public decimal Tax { get; set; } = 0; // Tax amount (can be 0 or calculated)
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Issued"; // Issued, Paid, Cancelled

    // Navigation properties
    public Order Order { get; set; } = null!;
}

