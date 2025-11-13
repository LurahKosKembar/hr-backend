import type { Knex } from "knex";

const ATTENDANCES_TABLE = "attendances";
const ATTENDANCE_SESSIONS_TABLE = "attendance_sessions";
const EMPLOYEES_TABLE = "master_employees";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(ATTENDANCES_TABLE, (table) => {
    table.dropForeign(["employee_id"]);
    table.dropColumn("employee_id");
    table.dropForeign(["session_id"]);
    table.dropColumn("session_id");
  });

  await knex.schema.alterTable(ATTENDANCES_TABLE, (table) => {
    table.string("attendance_code", 10).notNullable().unique().after("id");
    table
      .string("employee_code", 10)
      .references("employee_code")
      .inTable(EMPLOYEES_TABLE)
      .onDelete("restrict")
      .notNullable()
      .after("attendance_code");
    table
      .string("session_code", 10)
      .references("session_code")
      .inTable(ATTENDANCE_SESSIONS_TABLE)
      .onDelete("cascade")
      .notNullable()
      .after("employee_code");

    table.unique(["employee_code", "session_code"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(ATTENDANCES_TABLE, (table) => {
    table.dropForeign(["employee_code"]);
    table.dropColumn("employee_code");
    table.dropForeign(["session_code"]);
    table.dropColumn("session_code");
    table.dropColumn("attendance_code");
  });

  await knex.schema.alterTable(ATTENDANCES_TABLE, (table) => {
    table
      .integer("employee_id")
      .unsigned()
      .references("id")
      .inTable(EMPLOYEES_TABLE)
      .onDelete("restrict");
    table
      .integer("session_id")
      .unsigned()
      .references("id")
      .inTable(ATTENDANCE_SESSIONS_TABLE)
      .onDelete("cascade");

    table.unique(["employee_id", "session_id"]);
  });
}
