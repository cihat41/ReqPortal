using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TalepSistemi.API.Migrations
{
    /// <inheritdoc />
    public partial class AddApprovalStrategyAndLevel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApprovalStrategy",
                table: "ApprovalWorkflowSteps",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Level",
                table: "ApprovalWorkflowSteps",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovalStrategy",
                table: "ApprovalWorkflowSteps");

            migrationBuilder.DropColumn(
                name: "Level",
                table: "ApprovalWorkflowSteps");
        }
    }
}
