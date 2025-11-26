namespace PharmacyInventory.API.DTOs;

public class SupplierReturnRequestDto
{
    public int Id { get; set; }
    public int BatchId { get; set; }
    public string BatchNumber { get; set; } = string.Empty;
    public int MedicineId { get; set; }
    public string MedicineName { get; set; } = string.Empty;
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime RequestDate { get; set; }
    public DateTime? ResponseDate { get; set; }
    public string? Notes { get; set; }
    public string? NewBatchNumber { get; set; }
    public DateOnly? NewExpiryDate { get; set; }
    public int? NewQuantity { get; set; }
    public DateOnly ExpiryDate { get; set; }
}

public class CreateSupplierReturnRequestDto
{
    public int BatchId { get; set; }
    public int MedicineId { get; set; }
    public int SupplierId { get; set; }
    public int Quantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class ApproveSupplierReturnRequestDto
{
    public string? NewBatchNumber { get; set; }
    public DateOnly? NewExpiryDate { get; set; }
    public int? NewQuantity { get; set; }
    public string? Notes { get; set; }
}

public class RejectSupplierReturnRequestDto
{
    public string? Notes { get; set; }
}

