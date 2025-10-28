import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("employees", (table) => {
    table.increments("id").primary();
    table.string("first_name", 100).notNullable();
    table.string("last_name", 100).notNullable();
    table.string("contact_phone", 20);
    table.text("address");
    table.date("join_date").notNullable();
    table
      .integer("position_id")
      .unsigned()
      .references("id")
      .inTable("positions")
      .onDelete("RESTRICT")
      .notNullable();

    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("employees");
}
