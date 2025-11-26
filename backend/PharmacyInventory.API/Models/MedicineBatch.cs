namespace PharmacyInventory.API.Models;

public class MedicineBatch
{
    public int Id { get; set; }
    public int MedicineId { get; set; }
    public string BatchNumber { get; set; } = string.Empty;
    public DateOnly ExpiryDate { get; set; }
    public int Quantity { get; set; }
    public int? SupplierId { get; set; }
    public DateOnly? PurchaseDate { get; set; }
    public decimal UnitCost { get; set; }

    // Navigation properties
    public Medicine Medicine { get; set; } = null!;
    public Supplier? Supplier { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<ExpiryAlert> ExpiryAlerts { get; set; } = new List<ExpiryAlert>();
}

