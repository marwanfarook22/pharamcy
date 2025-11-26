namespace PharmacyInventory.API.DTOs;

public class BrandDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int MedicineCount { get; set; }
}

public class CreateBrandDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UpdateBrandDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
}





