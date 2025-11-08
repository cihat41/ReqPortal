using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TalepSistemi.API.Migrations
{
    /// <inheritdoc />
    public partial class AddFormTemplateIntegration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FormTemplateId",
                table: "Requests",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DefaultWorkflowId",
                table: "FormTemplates",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Requests_FormTemplateId",
                table: "Requests",
                column: "FormTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_FormTemplates_DefaultWorkflowId",
                table: "FormTemplates",
                column: "DefaultWorkflowId");

            migrationBuilder.AddForeignKey(
                name: "FK_FormTemplates_ApprovalWorkflows_DefaultWorkflowId",
                table: "FormTemplates",
                column: "DefaultWorkflowId",
                principalTable: "ApprovalWorkflows",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Requests_FormTemplates_FormTemplateId",
                table: "Requests",
                column: "FormTemplateId",
                principalTable: "FormTemplates",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FormTemplates_ApprovalWorkflows_DefaultWorkflowId",
                table: "FormTemplates");

            migrationBuilder.DropForeignKey(
                name: "FK_Requests_FormTemplates_FormTemplateId",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_Requests_FormTemplateId",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_FormTemplates_DefaultWorkflowId",
                table: "FormTemplates");

            migrationBuilder.DropColumn(
                name: "FormTemplateId",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "DefaultWorkflowId",
                table: "FormTemplates");
        }
    }
}
