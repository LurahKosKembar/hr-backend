import type { Knex } from "knex";

const LEAVE_REQUESTS_TABLE = "leave_requests";
const LEAVE_TYPES_TABLE = "master_leave_types";
const EMPLOYEES_TABLE = "master_employees";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(LEAVE_REQUESTS_TABLE, (table) => {
    table.dropForeign(["employee_id"]);
    table.dropForeign(["leave_type_id"]);
    table.dropForeign(["approved_by_id"]);
  });

  await knex.schema.alterTable(LEAVE_REQUESTS_TABLE, (table) => {
    table.dropColumn("employee_id");
    table.dropColumn("leave_type_id");
    table.dropColumn("approved_by_id");
  });

  await knex.schema.alterTable(LEAVE_REQUESTS_TABLE, (table) => {
    table.string("request_code", 10).notNullable().unique().after("id");
    table
      .string("employee_code", 10)
      .references("employee_code")
      .inTable(EMPLOYEES_TABLE)
      .onDelete("restrict")
      .notNullable()
      .after("request_code");
    table
      .string("type_code", 10)
      .references("type_code")
      .inTable(LEAVE_TYPES_TABLE)
      .onDelete("restrict")
      .notNullable()
      .after("employee_code");
    table
      .string("approved_by_code", 10)
      .references("employee_code")
      .inTable(EMPLOYEES_TABLE)
      .onDelete("restrict")
      .nullable()
      .after("status");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0");

  try {
    await knex.schema.alterTable(LEAVE_REQUESTS_TABLE, (table) => {
      table.dropForeign(["employee_code"]);
      table.dropForeign(["type_code"]);
      table.dropForeign(["approved_by_code"]);
    });

    await knex.schema.alterTable(LEAVE_REQUESTS_TABLE, (table) => {
      table.dropColumn("request_code");
      table.dropColumn("employee_code");
      table.dropColumn("type_code");
      table.dropColumn("approved_by_code");
    });

    await knex.schema.alterTable(LEAVE_REQUESTS_TABLE, (table) => {
      table.integer("employee_id").unsigned().notNullable();
      table.integer("leave_type_id").unsigned().notNullable();
      table.integer("approved_by_id").unsigned().nullable();
    });
    await knex.schema.alterTable(LEAVE_REQUESTS_TABLE, (table) => {
      table
        .foreign("employee_id")
        .references("id")
        .inTable(EMPLOYEES_TABLE)
        .onDelete("restrict");

      table
        .foreign("leave_type_id")
        .references("id")
        .inTable(LEAVE_TYPES_TABLE)
        .onDelete("restrict");

      table
        .foreign("approved_by_id")
        .references("id")
        .inTable(EMPLOYEES_TABLE)
        .onDelete("restrict");
    });
  } catch (error) {
    console.error(`Error during 'down' migration (20251110061946): ${error}`);
    throw error;
  } finally {
    await knex.raw("SET FOREIGN_KEY_CHECKS = 1");
  }
}
