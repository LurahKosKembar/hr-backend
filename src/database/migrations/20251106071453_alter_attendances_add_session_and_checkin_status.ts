import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("attendances", (table) => {
    table.dropColumn("work_date");
    table
      .integer("session_id")
      .unsigned()
      .references("id")
      .inTable("attendance_sessions")
      .onDelete("CASCADE")
      .after("employee_id");
    table
      .enu("check_in_status", ["in-time", "late", "absent"], {
        useNative: true,
        enumName: "attendance_check_in_status_enum",
      })
      .notNullable()
      .after("check_out_time");
    table
      .enu("check_out_status", ["in-time", "early", "overtime", "missed"], {
        useNative: true,
        enumName: "attendance_check_out_status_enum",
      })
      .nullable()
      .after("check_in_status");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("attendances", (table) => {
    table.dropForeign(["session_id"], "attendances_session_id_foreign");
  });

  await knex.schema.alterTable("attendances", (table) => {
    table.dropColumn("session_id");
    table.dropColumn("check_in_status");
    table.dropColumn("check_out_status");
    table.date("work_date").notNullable();
  });
}
