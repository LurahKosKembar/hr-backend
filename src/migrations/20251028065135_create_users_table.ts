import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("email", 255).notNullable().unique();
    table.string("password", 255).notNullable();
    table
      .enum("role", ["admin", "employee"])
      .notNullable()
      .defaultTo("employee");
    table
      .integer("employee_id")
      .unsigned()
      .references("id")
      .inTable("employees")
      .onDelete("CASCADE")
      .unique()
      .notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("users");
}
