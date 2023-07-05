import sql from "mssql";
import fs from "fs";
import env from "../src/env";

export const resetDatabase = async () => {

  if (env.IN_PROD) {
    console.log("resetDatabase() cannot be used in production environment");
    return;
  }

  const request = new sql.Request();
  const sqlScript = fs.readFileSync("./db_scripts/schema/db_schema.sql", "utf8");
  await request.query(`
    DROP TABLE [api_key];
    DROP TABLE [session];
    DROP TABLE [delete_account_key];
    DROP TABLE [register_account_key];
    DROP TABLE [expense];
    DROP TABLE [user_category];
    DROP TABLE [user_event];
    DROP TABLE [password_reset_key];
    DROP TABLE [category];
    DROP TABLE [event];
    DROP TABLE [user];
  `);
  await sql.query(sqlScript);
};
