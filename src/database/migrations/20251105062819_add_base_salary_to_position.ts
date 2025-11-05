import type { Knex } from "knex";

const POSITIONS_TABLE = "master_positions";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(POSITIONS_TABLE, (table) => {
    table
      .integer("base_salary")
      .notNullable()
      .defaultTo(0)
      .after("position_code");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(POSITIONS_TABLE, (table) => {
    table.dropColumn("base_salary");
  });
}
