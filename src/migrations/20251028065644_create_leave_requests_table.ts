import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("leave_requests", (table) => {
    table.increments("id").primary();
    table
      .integer("employee_id")
      .unsigned()
      .references("id")
      .inTable("employees")
      .onDelete("CASCADE")
      .notNullable();
    table
      .integer("leave_type_id")
      .unsigned()
      .references("id")
      .inTable("leave_types")
      .onDelete("RESTRICT")
      .notNullable();
    table.date("start_date").notNullable();
    table.date("end_date").notNullable();
    table.decimal("total_days").notNullable();
    table.text("reason").notNullable();
    table
      .enum("status", ["Pending", "Approved", "Rejected"])
      .notNullable()
      .defaultTo("Pending");
    table
      .integer("approved_by_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table.timestamp("approval_date");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("leave_requests");
}
