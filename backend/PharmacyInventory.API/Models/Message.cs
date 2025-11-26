namespace PharmacyInventory.API.Models;

public class Message
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? AdminId { get; set; } // Admin who sent the message (null if system message)
    public string Subject { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public User? Admin { get; set; }
}

