namespace PharmacyInventory.API.DTOs;

public class BillDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string BillNumber { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public decimal SubTotal { get; set; }
    public decimal Tax { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public OrderDto? Order { get; set; }
}

public class CreateBillDto
{
    public int OrderId { get; set; }
    public decimal Tax { get; set; } = 0;
}

