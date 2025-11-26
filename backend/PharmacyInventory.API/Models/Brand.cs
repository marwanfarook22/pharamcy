namespace PharmacyInventory.API.Models;

public class Brand
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Navigation properties
    public ICollection<Medicine> Medicines { get; set; } = new List<Medicine>();
}

