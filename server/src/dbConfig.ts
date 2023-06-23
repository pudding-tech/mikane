import env from "./env";

export const dbConfig = {
  server: env.DB_SERVER,
  port: env.DB_PORT,
  database: env.DB_DATABASE,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustedConnection: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};
