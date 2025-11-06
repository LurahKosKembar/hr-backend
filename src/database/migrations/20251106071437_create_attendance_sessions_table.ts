import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("attendance_sessions", (table) => {
    table.increments("id").primary();
    table.date("date").notNullable().unique();
    table
      .enu("status", ["open", "closed"], {
        useNative: true,
        enumName: "attendance_session_status_enum",
      })
      .defaultTo("closed");
    table.time("open_time").notNullable();
    table.time("cutoff_time").notNullable();
    table.time("close_time").notNullable();
    table
      .integer("created_by")
      .unsigned()
      .references("id")
      .inTable("master_employees")
      .onDelete("SET NULL");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("attendance_sessions");
}
