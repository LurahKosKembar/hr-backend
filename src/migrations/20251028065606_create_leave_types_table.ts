import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("leave_types", (table) => {
    table.increments("id").primary();
    table.string("name", 100).notNullable().unique();
    table.string("description", 255);

    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("leave_types");
}
