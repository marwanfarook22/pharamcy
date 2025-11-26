namespace PharmacyInventory.API.Models;

public class Medicine
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public int? BrandId { get; set; }
    public decimal UnitPrice { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool HasDiscount { get; set; } = false;
    public decimal? DiscountPercentage { get; set; }
    public decimal? OriginalPrice { get; set; }

    // Navigation properties
    public Category? Category { get; set; }
    public Brand? Brand { get; set; }
    public ICollection<MedicineBatch> MedicineBatches { get; set; } = new List<MedicineBatch>();
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}

