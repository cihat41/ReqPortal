using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TalepSistemi.API.Migrations
{
    /// <inheritdoc />
    public partial class MoveApprovalStrategyToWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovalStrategy",
                table: "ApprovalWorkflowSteps");

            migrationBuilder.AddColumn<string>(
                name: "ApprovalStrategy",
                table: "ApprovalWorkflows",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovalStrategy",
                table: "ApprovalWorkflows");

            migrationBuilder.AddColumn<string>(
                name: "ApprovalStrategy",
                table: "ApprovalWorkflowSteps",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }
    }
}
