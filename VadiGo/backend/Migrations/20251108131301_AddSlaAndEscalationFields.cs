using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TalepSistemi.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSlaAndEscalationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                table: "Requests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SlaHours",
                table: "Requests",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "SlaViolationNotified",
                table: "Requests",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EscalationNotified",
                table: "Approvals",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "EscalationRoleId",
                table: "Approvals",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EscalationUserId",
                table: "Approvals",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TimeoutHours",
                table: "Approvals",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Approvals_EscalationRoleId",
                table: "Approvals",
                column: "EscalationRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Approvals_EscalationUserId",
                table: "Approvals",
                column: "EscalationUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Approvals_Roles_EscalationRoleId",
                table: "Approvals",
                column: "EscalationRoleId",
                principalTable: "Roles",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Approvals_Users_EscalationUserId",
                table: "Approvals",
                column: "EscalationUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Approvals_Roles_EscalationRoleId",
                table: "Approvals");

            migrationBuilder.DropForeignKey(
                name: "FK_Approvals_Users_EscalationUserId",
                table: "Approvals");

            migrationBuilder.DropIndex(
                name: "IX_Approvals_EscalationRoleId",
                table: "Approvals");

            migrationBuilder.DropIndex(
                name: "IX_Approvals_EscalationUserId",
                table: "Approvals");

            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "SlaHours",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "SlaViolationNotified",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "EscalationNotified",
                table: "Approvals");

            migrationBuilder.DropColumn(
                name: "EscalationRoleId",
                table: "Approvals");

            migrationBuilder.DropColumn(
                name: "EscalationUserId",
                table: "Approvals");

            migrationBuilder.DropColumn(
                name: "TimeoutHours",
                table: "Approvals");
        }
    }
}
