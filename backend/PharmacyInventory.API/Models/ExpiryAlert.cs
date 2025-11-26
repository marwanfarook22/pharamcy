namespace PharmacyInventory.API.Models;

public class ExpiryAlert
{
    public int Id { get; set; }
    public int BatchId { get; set; }
    public string AlertType { get; set; } = string.Empty; // "Expired" or "Near Expiry"
    public DateTime AlertDate { get; set; }
    public bool IsResolved { get; set; }

    // Navigation properties
    public MedicineBatch Batch { get; set; } = null!;
}

