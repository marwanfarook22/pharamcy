namespace PharmacyInventory.API.Models;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int MedicineId { get; set; }
    public int BatchId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }

    // Navigation properties
    public Order Order { get; set; } = null!;
    public Medicine Medicine { get; set; } = null!;
    public MedicineBatch Batch { get; set; } = null!;
}

