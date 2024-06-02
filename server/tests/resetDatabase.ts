import { pool } from "../src/db";
import fs from "fs";
import env from "../src/env";

export const resetDatabase = async () => {

  if (env.IN_PROD) {
    console.log("resetDatabase() cannot be used in production environment");
    return;
  }

  await pool.query(`
    DROP TABLE "api_key";
    DROP TABLE "session";
    DROP TABLE "delete_account_key";
    DROP TABLE "register_account_key";
    DROP TABLE "expense";
    DROP TABLE "user_category";
    DROP TABLE "user_event";
    DROP TABLE "password_reset_key";
    DROP TABLE "category";
    DROP TABLE "event";
    DROP TABLE "user_preferences";
    DROP TABLE "user";
    DROP TABLE "event_status_type";
  `);
  const sqlScript = fs.readFileSync("./db_scripts/schema/db_schema.sql", "utf8");
  await pool.query(sqlScript);
  await pool.query(`
    INSERT INTO api_key (id, "name", hashed_key, master, valid_from, valid_to)
      VALUES ('2f6801dd-9583-4b16-9814-76d188b4ad25', 'master key for testing', '7541dcc820c64fa2265f3050e5d12f5125da7ec49e170024732e994e965c5dc4d0240ad3fd52603351d918ebb7ca9301', true, null, null);
  `);
};
