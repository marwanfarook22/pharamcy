namespace PharmacyInventory.API.DTOs;

public class ExpiryAlertDto
{
    public int Id { get; set; }
    public int BatchId { get; set; }
    public string BatchNumber { get; set; } = string.Empty;
    public int MedicineId { get; set; }
    public string MedicineName { get; set; } = string.Empty;
    public DateOnly ExpiryDate { get; set; }
    public int Quantity { get; set; }
    public string AlertType { get; set; } = string.Empty;
    public DateTime AlertDate { get; set; }
    public bool IsResolved { get; set; }
    public int DaysUntilExpiry { get; set; }
}

public class ResolveExpiryAlertDto
{
    public bool IsResolved { get; set; }
}

