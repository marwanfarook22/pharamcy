namespace PharmacyInventory.API.Models;

public class Payment
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public decimal Amount { get; set; }
    public string Method { get; set; } = "Cash"; // Cash, Credit Card, Wallet

    // Navigation properties
    public Order Order { get; set; } = null!;
}

