using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TalepSistemi.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateExistingWorkflowStepLevels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Mevcut workflow step'lerin Level değerlerini StepOrder'a göre güncelle
            migrationBuilder.Sql(@"
                UPDATE ""ApprovalWorkflowSteps""
                SET ""Level"" = ""StepOrder"",
                    ""ApprovalStrategy"" = 'all'
                WHERE ""Level"" = 0;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
