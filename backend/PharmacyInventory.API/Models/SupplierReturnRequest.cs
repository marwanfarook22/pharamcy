namespace PharmacyInventory.API.Models;

public class SupplierReturnRequest
{
    public int Id { get; set; }
    public int BatchId { get; set; }
    public int MedicineId { get; set; }
    public int SupplierId { get; set; }
    public int Quantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public DateTime RequestDate { get; set; } = DateTime.UtcNow;
    public DateTime? ResponseDate { get; set; }
    public string? Notes { get; set; }
    
    // New batch details (filled when approved)
    public string? NewBatchNumber { get; set; }
    public DateOnly? NewExpiryDate { get; set; }
    public int? NewQuantity { get; set; }

    // Navigation properties
    public MedicineBatch Batch { get; set; } = null!;
    public Medicine Medicine { get; set; } = null!;
    public Supplier Supplier { get; set; } = null!;
}

