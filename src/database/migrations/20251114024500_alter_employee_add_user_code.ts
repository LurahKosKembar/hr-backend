import type { Knex } from "knex";

const EMPLOYEES_TABLE = "master_employees";
const USERS_TABLE = "users";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(EMPLOYEES_TABLE, (table) => {
    table
      .string("user_code", 10)
      .nullable()
      .unique()
      .references("user_code")
      .inTable(USERS_TABLE)
      .onDelete("SET NULL")
      .onUpdate("CASCADE")
      .after("employee_code");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0");
  try {
    await knex.schema.alterTable(EMPLOYEES_TABLE, (table) => {
      table.dropForeign(["user_code"], "master_employees_user_code_foreign");
    });
    await knex.schema.alterTable(EMPLOYEES_TABLE, (table) => {
      table.dropUnique(["user_code"], "master_employees_user_code_unique");
    });
    await knex.schema.alterTable(EMPLOYEES_TABLE, (table) => {
      table.dropColumn("user_code");
    });
  } catch (error) {
    console.error(`Error during 'down' migration (20251110061946): ${error}`);
    throw error;
  } finally {
    await knex.raw("SET FOREIGN_KEY_CHECKS = 1");
  }
}
