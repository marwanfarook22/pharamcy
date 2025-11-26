namespace PharmacyInventory.API.DTOs;

public class OutOfStockBatchDto
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

public class OutOfStockMedicineDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public int? BrandId { get; set; }
    public string? BrandName { get; set; }
    public decimal UnitPrice { get; set; }
    public string? ImageUrl { get; set; }
    public int TotalStock { get; set; }
    public int BatchCount { get; set; }
}

