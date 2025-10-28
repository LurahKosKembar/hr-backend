import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("leave_balances", (table) => {
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
    table.integer("balance").notNullable().defaultTo(0);
    table.integer("year").notNullable();
    table.unique(["employee_id", "leave_type_id", "year"]);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("leave_balances");
}
