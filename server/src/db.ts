import { Pool } from "pg";
import { DBConfig } from "./types/types";
import env from "./env";

const config: DBConfig = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_DATABASE,
  user: env.DB_USER,
  password: env.DB_PASSWORD
};

const pool = new Pool(config);
export { pool };
