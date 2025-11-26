namespace PharmacyInventory.API.DTOs;

public class RefundRequestDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime RequestDate { get; set; }
    public DateTime? ResponseDate { get; set; }
    public decimal RefundAmount { get; set; }
    public decimal OrderTotalAmount { get; set; }
    public string? RefundMethod { get; set; }
    public string? Notes { get; set; }
    public int? AdminId { get; set; }
    public string? AdminName { get; set; }
    public string OrderStatus { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public List<RefundRequestItemDto> OrderItems { get; set; } = new();
}

public class RefundRequestItemDto
{
    public int Id { get; set; }
    public int MedicineId { get; set; }
    public string MedicineName { get; set; } = string.Empty;
    public string BatchNumber { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal SubTotal { get; set; }
}

public class CreateRefundRequestDto
{
    public int OrderId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public decimal? RefundAmount { get; set; } // Optional: if null, refunds full order amount
    public string? Notes { get; set; }
    public List<int>? OrderItemIds { get; set; } // Optional: specific order items to refund (for partial refunds)
}

public class UpdateRefundRequestStatusDto
{
    public string Status { get; set; } = string.Empty;
    public string? RefundMethod { get; set; }
    public string? Notes { get; set; }
}

public class ApproveRefundRequestDto
{
    public string? RefundMethod { get; set; }
    public string? Notes { get; set; }
}

public class RejectRefundRequestDto
{
    public string? Notes { get; set; }
}

