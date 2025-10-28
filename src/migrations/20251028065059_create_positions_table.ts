import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("positions", (table) => {
    table.increments("id").primary();
    table.string("name", 100).notNullable().unique();
    table
      .integer("department_id")
      .unsigned()
      .references("id")
      .inTable("departments")
      .onDelete("RESTRICT")
      .notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("positions");
}
