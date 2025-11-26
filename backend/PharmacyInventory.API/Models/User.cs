namespace PharmacyInventory.API.Models;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Role { get; set; } = "Customer"; // Admin, Pharmacist, Customer
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int PurchaseCount { get; set; } = 0;

    // Navigation properties
    public ICollection<Cart> Carts { get; set; } = new List<Cart>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}

