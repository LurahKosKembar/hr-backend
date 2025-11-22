import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("master_employees", (table) => {
    table.string("office_code", 10).after("position_code");

    table
      .foreign("office_code")
      .references("office_code")
      .inTable("master_offices")
      .onDelete("restrict");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("master_employees", (table) => {
    table.dropForeign(["office_code"]);
    table.dropColumn("office_code");
  });
}
