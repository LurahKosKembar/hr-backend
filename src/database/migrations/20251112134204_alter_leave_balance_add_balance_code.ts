import type { Knex } from "knex";

const LEAVE_TYPES_TABLE = "master_leave_types";
const LEAVE_BALANCES_TABLE = "leave_balances";
const EMPLOYEES_TABLE = "master_employees";
const UNIQUE_KEY_NAME = "leave_balances_employee_id_leave_type_id_year_unique";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(LEAVE_BALANCES_TABLE, (table) => {
    table.dropForeign(["employee_id"]);
    table.dropForeign(["leave_type_id"]);
  });

  await knex.schema.alterTable(LEAVE_BALANCES_TABLE, (table) => {
    table.dropUnique([], UNIQUE_KEY_NAME);
  });

  await knex.schema.alterTable(LEAVE_BALANCES_TABLE, (table) => {
    table.dropColumn("employee_id");
    table.dropColumn("leave_type_id");
  });

  await knex.schema.alterTable(LEAVE_BALANCES_TABLE, (table) => {
    table.string("balance_code", 10).notNullable().unique().after("id");
    table
      .string("employee_code", 10)
      .references("employee_code")
      .inTable(EMPLOYEES_TABLE)
      .onDelete("restrict")
      .notNullable()
      .after("balance_code");
    table
      .string("type_code", 10)
      .references("type_code")
      .inTable(LEAVE_TYPES_TABLE)
      .onDelete("restrict")
      .notNullable()
      .after("employee_code");

    table.unique(["employee_code", "type_code", "year"], {
      indexName: UNIQUE_KEY_NAME,
    });
  });
}

export async function down(knex: Knex): Promise<void> {
  // Reverse order for rollback
  await knex.schema.alterTable(LEAVE_BALANCES_TABLE, (table) => {
    table.dropForeign(["employee_code"]);
    table.dropForeign(["type_code"]);
    table.dropUnique([], UNIQUE_KEY_NAME);
    table.dropColumn("employee_code");
    table.dropColumn("type_code");
    table.dropColumn("balance_code");
  });

  await knex.schema.alterTable(LEAVE_BALANCES_TABLE, (table) => {
    table
      .integer("employee_id")
      .unsigned()
      .references("id")
      .inTable(EMPLOYEES_TABLE)
      .onDelete("restrict");
    table
      .integer("leave_type_id")
      .unsigned()
      .references("id")
      .inTable(LEAVE_TYPES_TABLE)
      .onDelete("restrict");

    table.unique(["employee_id", "leave_type_id", "year"], {
      indexName: UNIQUE_KEY_NAME,
    });
  });
}
