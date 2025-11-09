using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TalepSistemi.API.Migrations
{
    /// <inheritdoc />
    public partial class FixRequestAttachmentForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RequestAttachments_Users_UploaderId",
                table: "RequestAttachments");

            migrationBuilder.DropIndex(
                name: "IX_RequestAttachments_UploaderId",
                table: "RequestAttachments");

            migrationBuilder.DropColumn(
                name: "UploaderId",
                table: "RequestAttachments");

            migrationBuilder.CreateIndex(
                name: "IX_RequestAttachments_UploadedBy",
                table: "RequestAttachments",
                column: "UploadedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_RequestAttachments_Users_UploadedBy",
                table: "RequestAttachments",
                column: "UploadedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RequestAttachments_Users_UploadedBy",
                table: "RequestAttachments");

            migrationBuilder.DropIndex(
                name: "IX_RequestAttachments_UploadedBy",
                table: "RequestAttachments");

            migrationBuilder.AddColumn<int>(
                name: "UploaderId",
                table: "RequestAttachments",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_RequestAttachments_UploaderId",
                table: "RequestAttachments",
                column: "UploaderId");

            migrationBuilder.AddForeignKey(
                name: "FK_RequestAttachments_Users_UploaderId",
                table: "RequestAttachments",
                column: "UploaderId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
