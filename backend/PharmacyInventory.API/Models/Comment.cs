namespace PharmacyInventory.API.Models;

public class Comment
{
    public int Id { get; set; }
    public int MedicineId { get; set; }
    public int UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public Medicine Medicine { get; set; } = null!;
    public User User { get; set; } = null!;
}


