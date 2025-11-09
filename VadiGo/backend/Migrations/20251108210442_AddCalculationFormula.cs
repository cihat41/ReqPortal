using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TalepSistemi.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCalculationFormula : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CalculationFormula",
                table: "FormFields",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CalculationFormula",
                table: "FormFields");
        }
    }
}
