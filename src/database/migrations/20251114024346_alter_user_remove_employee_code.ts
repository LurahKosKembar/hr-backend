import type { Knex } from "knex";

const USERS_TABLE = "users";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(USERS_TABLE, (table) => {
    table.dropForeign(["employee_code"], "users_employee_code_foreign");
  });
  await knex.schema.alterTable(USERS_TABLE, (table) => {
    table.dropUnique(["employee_code"], "users_employee_code_unique");
  });
  await knex.schema.alterTable(USERS_TABLE, (table) => {
    table.dropColumn("employee_code");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0");

  try {
    await knex.schema.alterTable(USERS_TABLE, (table) => {
      table.string("employee_code", 10).nullable();
    });
    await knex.schema.alterTable(USERS_TABLE, (table) => {
      table.unique(["employee_code"], "users_employee_code_unique");
    });
    await knex.schema.alterTable(USERS_TABLE, (table) => {
      table
        .foreign("employee_code", "users_employee_code_foreign")
        .references("employee_code")
        .inTable("master_employees")
        .onDelete("RESTRICT");
    });
  } finally {
    await knex.raw("SET FOREIGN_KEY_CHECKS = 1");
  }
}
