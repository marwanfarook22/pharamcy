namespace PharmacyInventory.API.DTOs;

public class MedicineBatchDto
{
    public int Id { get; set; }
    public int MedicineId { get; set; }
    public string MedicineName { get; set; } = string.Empty;
    public string BatchNumber { get; set; } = string.Empty;
    public DateOnly ExpiryDate { get; set; }
    public int Quantity { get; set; }
    public int? SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public DateOnly? PurchaseDate { get; set; }
    public decimal UnitCost { get; set; }
    public int DaysUntilExpiry { get; set; }
}

public class CreateBatchDto
{
    public int MedicineId { get; set; }
    public string BatchNumber { get; set; } = string.Empty;
    public DateOnly ExpiryDate { get; set; }
    public int Quantity { get; set; }
    public int? SupplierId { get; set; }
    public DateOnly? PurchaseDate { get; set; }
    public decimal UnitCost { get; set; }
}

public class UpdateBatchDto
{
    public string? BatchNumber { get; set; }
    public DateOnly? ExpiryDate { get; set; }
    public int? Quantity { get; set; }
    public int? SupplierId { get; set; }
    public DateOnly? PurchaseDate { get; set; }
    public decimal? UnitCost { get; set; }
}

public class IncrementQuantityDto
{
    public int Quantity { get; set; }
}

