import type { Knex } from "knex";

const ATTENDANCE_SESSIONS_TABLE = "attendance_sessions";
const EMPLOYEES_TABLE = "master_employees";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(ATTENDANCE_SESSIONS_TABLE, (table) => {
    table.dropForeign("attendance_sessions_created_by_foreign");
    table.dropColumn("created_by");
  });

  await knex.schema.alterTable(ATTENDANCE_SESSIONS_TABLE, (table) => {
    table.string("session_code", 10).notNullable().unique().after("id");
    table
      .string("created_by", 10)
      .references("user_code")
      .inTable(EMPLOYEES_TABLE)
      .onDelete("restrict")
      .unique()
      .notNullable()
      .after("close_time");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(ATTENDANCE_SESSIONS_TABLE, (table) => {
    table.dropForeign("created_by");
    table.dropColumn("session_code");
    table.dropColumn("created_by");
  });
  //
  // WARNING: You MUST replace the placeholder definitions below
  // with your *original* 'created_by' column schema.
  //
  await knex.schema.alterTable(ATTENDANCE_SESSIONS_TABLE, (table) => {
    table
      .integer("created_by")
      .unsigned()
      .references("id")
      .inTable(EMPLOYEES_TABLE)
      .onDelete("SET NULL");
  });
}
