namespace PharmacyInventory.API.DTOs;

public class MedicineDto
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
    public DateTime CreatedAt { get; set; }
    public bool HasDiscount { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public decimal? OriginalPrice { get; set; }
}

public class CreateMedicineDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public int? BrandId { get; set; }
    public decimal UnitPrice { get; set; }
    public string? ImageUrl { get; set; }
}

public class UpdateMedicineDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public int? BrandId { get; set; }
    public decimal? UnitPrice { get; set; }
    public string? ImageUrl { get; set; }
}

