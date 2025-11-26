namespace PharmacyInventory.API.Models;

public class Supplier
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }

    // Navigation properties
    public ICollection<MedicineBatch> MedicineBatches { get; set; } = new List<MedicineBatch>();
}

