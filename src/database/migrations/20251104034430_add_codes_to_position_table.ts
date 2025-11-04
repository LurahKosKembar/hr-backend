import type { Knex } from "knex";

const DEPARTMENTS_TABLE = "master_departments";
const POSITIONS_TABLE = "master_positions";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(DEPARTMENTS_TABLE, (table) => {
    table.string("department_code", 20).notNullable().unique().after("name");
  });

  return knex.schema.alterTable(POSITIONS_TABLE, (table) => {
    table.string("position_code", 20).notNullable().unique().after("name");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(DEPARTMENTS_TABLE, (table) => {
    table.dropColumn("department_code");
  });

  return knex.schema.alterTable(POSITIONS_TABLE, (table) => {
    table.dropColumn("position_code");
  });
}
