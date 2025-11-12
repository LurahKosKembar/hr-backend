import type { Knex } from "knex";

const LEAVE_TYPES_TABLE = "master_leave_types";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(LEAVE_TYPES_TABLE, (table) => {
    table.string("type_code", 10).notNullable().unique().after("id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(LEAVE_TYPES_TABLE, (table) => {
    table.dropColumn("type_code");
  });
}
