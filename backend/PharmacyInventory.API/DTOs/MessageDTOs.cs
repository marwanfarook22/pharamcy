namespace PharmacyInventory.API.DTOs;

public class MessageDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public int? AdminId { get; set; }
    public string? AdminName { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReadAt { get; set; }
}

public class CreateMessageDto
{
    public int UserId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}

public class SendMessageToMultipleDto
{
    public List<int> UserIds { get; set; } = new();
    public string Subject { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}

public class MarkAsReadDto
{
    public bool IsRead { get; set; } = true;
}

