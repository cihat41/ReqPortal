namespace TalepSistemi.API.DTOs;

public class RequestDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string? Justification { get; set; }
    public decimal? EstimatedCost { get; set; }
    public string Status { get; set; } = string.Empty;
    public int RequesterId { get; set; }
    public string RequesterName { get; set; } = string.Empty;
    public string? FormData { get; set; }
    public DateTime? DueDate { get; set; }
    public int? SlaHours { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class CreateRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = "Medium";
    public string? Justification { get; set; }
    public decimal? EstimatedCost { get; set; }
    public int? SlaHours { get; set; }
    public string? FormData { get; set; }
    public bool SaveAsDraft { get; set; } = false;
}

public class UpdateRequestDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Type { get; set; }
    public string? Category { get; set; }
    public string? Priority { get; set; }
    public string? Justification { get; set; }
    public decimal? EstimatedCost { get; set; }
    public string? FormData { get; set; }
}

