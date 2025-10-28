import { config } from "dotenv";
import type { Knex } from "knex";

config();

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: process.env.DB_CLIENT || "mysql2",
    connection: {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "marstech_hr_dev",
    },
    migrations: {
      directory: "./src/migrations",
      extension: "ts",
    },
  },

  production: {
    client: process.env.DB_CLIENT || "mysql2",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    } as Knex.ConnectionConfig,

    migrations: {
      directory: "./src/migrations",
      extension: "js",
    },
  },
};

export default knexConfig;
