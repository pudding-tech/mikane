
export const dbConfig = {
  server: process.env.DB_SERVER || "Server env not set",
  port: parseInt(process.env.DB_PORT || "1434"),
  database: process.env.DB_DATABASE || "master",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustedConnection: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};