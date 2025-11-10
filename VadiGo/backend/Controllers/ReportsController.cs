using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TalepSistemi.API.Data;
using OfficeOpenXml;

namespace TalepSistemi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReportsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("dashboard-stats")]
    public async Task<ActionResult<object>> GetDashboardStats(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        // DateTime parametrelerini UTC'ye çevir
        var start = startDate.HasValue
            ? DateTime.SpecifyKind(startDate.Value, DateTimeKind.Utc)
            : DateTime.UtcNow.AddMonths(-1);
        var end = endDate.HasValue
            ? DateTime.SpecifyKind(endDate.Value, DateTimeKind.Utc)
            : DateTime.UtcNow;

        var totalRequests = await _context.Requests
            .Where(r => r.CreatedAt >= start && r.CreatedAt <= end)
            .CountAsync();

        var requestsByStatus = await _context.Requests
            .Where(r => r.CreatedAt >= start && r.CreatedAt <= end)
            .GroupBy(r => r.Status)
            .Select(g => new { status = g.Key, count = g.Count() })
            .ToListAsync();

        var requestsByCategory = await _context.Requests
            .Where(r => r.CreatedAt >= start && r.CreatedAt <= end)
            .GroupBy(r => r.Category)
            .Select(g => new { category = g.Key, count = g.Count() })
            .ToListAsync();

        var requestsByPriority = await _context.Requests
            .Where(r => r.CreatedAt >= start && r.CreatedAt <= end)
            .GroupBy(r => r.Priority)
            .Select(g => new { priority = g.Key, count = g.Count() })
            .ToListAsync();

        var approvals = await _context.Approvals
            .Where(a => a.CreatedAt >= start && a.CreatedAt <= end && a.ApprovedAt.HasValue)
            .Select(a => new { a.CreatedAt, a.ApprovedAt })
            .ToListAsync();

        var avgApprovalTime = approvals.Any()
            ? approvals.Average(a => (a.ApprovedAt!.Value - a.CreatedAt).TotalHours)
            : 0;

        return Ok(new
        {
            totalRequests,
            requestsByStatus,
            requestsByCategory,
            requestsByPriority,
            avgApprovalTimeHours = avgApprovalTime
        });
    }

    [HttpGet("requests-over-time")]
    public async Task<ActionResult<object>> GetRequestsOverTime(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string groupBy = "day")
    {
        // DateTime parametrelerini UTC'ye çevir
        var start = startDate.HasValue
            ? DateTime.SpecifyKind(startDate.Value, DateTimeKind.Utc)
            : DateTime.UtcNow.AddMonths(-1);
        var end = endDate.HasValue
            ? DateTime.SpecifyKind(endDate.Value, DateTimeKind.Utc)
            : DateTime.UtcNow;

        var requests = await _context.Requests
            .Where(r => r.CreatedAt >= start && r.CreatedAt <= end)
            .Select(r => new { r.CreatedAt, r.Status })
            .ToListAsync();

        var grouped = groupBy.ToLower() switch
        {
            "month" => requests
                .GroupBy(r => new { r.CreatedAt.Year, r.CreatedAt.Month })
                .Select(g => new
                {
                    date = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("yyyy-MM"),
                    count = g.Count()
                })
                .OrderBy(x => x.date),
            "week" => requests
                .GroupBy(r => new { r.CreatedAt.Year, Week = (r.CreatedAt.DayOfYear - 1) / 7 })
                .Select(g => new
                {
                    date = $"{g.Key.Year}-W{g.Key.Week:00}",
                    count = g.Count()
                })
                .OrderBy(x => x.date),
            _ => requests
                .GroupBy(r => r.CreatedAt.Date)
                .Select(g => new
                {
                    date = g.Key.ToString("yyyy-MM-dd"),
                    count = g.Count()
                })
                .OrderBy(x => x.date)
        };

        return Ok(grouped);
    }

    [HttpGet("sla-compliance")]
    public async Task<ActionResult<object>> GetSlaCompliance(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        // DateTime parametrelerini UTC'ye çevir
        var start = startDate.HasValue
            ? DateTime.SpecifyKind(startDate.Value, DateTimeKind.Utc)
            : DateTime.UtcNow.AddMonths(-1);
        var end = endDate.HasValue
            ? DateTime.SpecifyKind(endDate.Value, DateTimeKind.Utc)
            : DateTime.UtcNow;

        var requests = await _context.Requests
            .Where(r => r.CreatedAt >= start && r.CreatedAt <= end)
            .Where(r => r.DueDate.HasValue)
            .Select(r => new
            {
                r.Id,
                r.DueDate,
                r.CompletedAt,
                r.Status
            })
            .ToListAsync();

        var totalWithSla = requests.Count;
        var completed = requests.Where(r => r.CompletedAt.HasValue).ToList();
        var onTime = completed.Where(r => r.CompletedAt <= r.DueDate).Count();
        var late = completed.Where(r => r.CompletedAt > r.DueDate).Count();
        var overdue = requests.Where(r => !r.CompletedAt.HasValue && r.DueDate < DateTime.UtcNow).Count();

        return Ok(new
        {
            totalWithSla,
            completed = completed.Count,
            onTime,
            late,
            overdue,
            complianceRate = totalWithSla > 0 ? (double)onTime / totalWithSla * 100 : 0
        });
    }

    [HttpGet("top-requesters")]
    public async Task<ActionResult<object>> GetTopRequesters(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int limit = 10)
    {
        // DateTime parametrelerini UTC'ye çevir
        var start = startDate.HasValue
            ? DateTime.SpecifyKind(startDate.Value, DateTimeKind.Utc)
            : DateTime.UtcNow.AddMonths(-1);
        var end = endDate.HasValue
            ? DateTime.SpecifyKind(endDate.Value, DateTimeKind.Utc)
            : DateTime.UtcNow;

        var topRequesters = await _context.Requests
            .Where(r => r.CreatedAt >= start && r.CreatedAt <= end)
            .GroupBy(r => new { r.RequesterId, r.Requester.FirstName, r.Requester.LastName })
            .Select(g => new
            {
                userId = g.Key.RequesterId,
                name = $"{g.Key.FirstName} {g.Key.LastName}",
                requestCount = g.Count()
            })
            .OrderByDescending(x => x.requestCount)
            .Take(limit)
            .ToListAsync();

        return Ok(topRequesters);
    }

    [HttpGet("approval-performance")]
    public async Task<ActionResult<object>> GetApprovalPerformance(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        // DateTime parametrelerini UTC'ye çevir
        var start = startDate.HasValue
            ? DateTime.SpecifyKind(startDate.Value, DateTimeKind.Utc)
            : DateTime.UtcNow.AddMonths(-1);
        var end = endDate.HasValue
            ? DateTime.SpecifyKind(endDate.Value, DateTimeKind.Utc)
            : DateTime.UtcNow;

        var approvals = await _context.Approvals
            .Include(a => a.Approver)
            .Where(a => a.CreatedAt >= start && a.CreatedAt <= end)
            .Select(a => new
            {
                a.ApproverId,
                a.Approver.FirstName,
                a.Approver.LastName,
                a.Status,
                a.CreatedAt,
                a.ApprovedAt
            })
            .ToListAsync();

        var performance = approvals
            .GroupBy(a => new { a.ApproverId, a.FirstName, a.LastName })
            .Select(g => new
            {
                userId = g.Key.ApproverId,
                name = $"{g.Key.FirstName} {g.Key.LastName}",
                totalApprovals = g.Count(),
                approved = g.Count(a => a.Status == "Approved"),
                rejected = g.Count(a => a.Status == "Rejected"),
                pending = g.Count(a => a.Status == "Pending"),
                avgResponseTimeHours = g.Where(a => a.ApprovedAt.HasValue).Any()
                    ? g.Where(a => a.ApprovedAt.HasValue)
                        .Average(a => (a.ApprovedAt!.Value - a.CreatedAt).TotalHours)
                    : 0
            })
            .OrderByDescending(x => x.totalApprovals)
            .ToList();

        return Ok(performance);
    }

    [HttpGet("export/excel")]
    [Authorize(Roles = "Admin,SystemAdmin")]
    public async Task<ActionResult> ExportToExcel(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        // DateTime parametrelerini UTC'ye çevir
        var start = startDate.HasValue
            ? DateTime.SpecifyKind(startDate.Value, DateTimeKind.Utc)
            : DateTime.UtcNow.AddMonths(-1);
        var end = endDate.HasValue
            ? DateTime.SpecifyKind(endDate.Value, DateTimeKind.Utc)
            : DateTime.UtcNow;

        var requests = await _context.Requests
            .Include(r => r.Requester)
            .Where(r => r.CreatedAt >= start && r.CreatedAt <= end)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        // Create Excel package - EPPlus 8 requires license to be set via environment variable or config
        // For non-commercial use, this should work without explicit license setting
        var package = new ExcelPackage();
        var worksheet = package.Workbook.Worksheets.Add("Talepler");

        // Headers
        worksheet.Cells[1, 1].Value = "ID";
        worksheet.Cells[1, 2].Value = "Başlık";
        worksheet.Cells[1, 3].Value = "Kategori";
        worksheet.Cells[1, 4].Value = "Öncelik";
        worksheet.Cells[1, 5].Value = "Durum";
        worksheet.Cells[1, 6].Value = "Talep Eden";
        worksheet.Cells[1, 7].Value = "Oluşturma Tarihi";
        worksheet.Cells[1, 8].Value = "Tamamlanma Tarihi";

        // Style headers
        using (var range = worksheet.Cells[1, 1, 1, 8])
        {
            range.Style.Font.Bold = true;
            range.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
        }

        // Data
        for (int i = 0; i < requests.Count; i++)
        {
            var request = requests[i];
            var row = i + 2;

            worksheet.Cells[row, 1].Value = request.Id;
            worksheet.Cells[row, 2].Value = request.Title;
            worksheet.Cells[row, 3].Value = request.Category;
            worksheet.Cells[row, 4].Value = request.Priority;
            worksheet.Cells[row, 5].Value = request.Status;
            worksheet.Cells[row, 6].Value = $"{request.Requester.FirstName} {request.Requester.LastName}";
            worksheet.Cells[row, 7].Value = request.CreatedAt.ToString("yyyy-MM-dd HH:mm");
            worksheet.Cells[row, 8].Value = request.CompletedAt?.ToString("yyyy-MM-dd HH:mm") ?? "";
        }

        worksheet.Cells.AutoFitColumns();

        var stream = new MemoryStream();
        await package.SaveAsAsync(stream);
        stream.Position = 0;
        package.Dispose();

        var fileName = $"Talepler_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    [HttpGet("export/pdf")]
    [Authorize(Roles = "Admin,SystemAdmin")]
    public ActionResult ExportToPdf(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        // This would require iTextSharp or similar library
        // For now, return a placeholder
        return Ok(new { message = "PDF export feature - requires iTextSharp library implementation" });
    }
}

