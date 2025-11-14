import type { Knex } from "knex";

const LEAVE_REQUESTS_TABLE = "leave_requests";
const EMPLOYEES_TABLE = "master_employees";
const USERS_TABLE = "users";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(LEAVE_REQUESTS_TABLE, (table) => {
    table.dropForeign(
      "approved_by_code",
      "leave_requests_approved_by_code_foreign"
    );
  });

  await knex.schema.alterTable(LEAVE_REQUESTS_TABLE, (table) => {
    table.renameColumn("approved_by_code", "approved_by_user_code");
  });

  await knex.schema.alterTable(LEAVE_REQUESTS_TABLE, (table) => {
    table
      .foreign(
        "approved_by_user_code",
        "leave_requests_approved_by_user_code_foreign"
      )
      .references("user_code")
      .inTable(USERS_TABLE)
      .onDelete("restrict");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0");
  try {
    await knex.schema.alterTable(LEAVE_REQUESTS_TABLE, (table) => {
      table.dropForeign(
        "approved_by_user_code",
        "leave_requests_approved_by_user_code_foreign"
      );
    });

    await knex.schema.alterTable(LEAVE_REQUESTS_TABLE, (table) => {
      table.renameColumn("approved_by_user_code", "approved_by_code");
    });

    await knex.schema.alterTable(LEAVE_REQUESTS_TABLE, (table) => {
      table
        .foreign("approved_by_code", "leave_requests_approved_by_code_foreign")
        .references("employee_code")
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
