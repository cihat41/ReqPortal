using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TalepSistemi.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRequestModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Comment",
                table: "Approvals");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Comment",
                table: "Approvals",
                type: "text",
                nullable: true);
        }
    }
}
