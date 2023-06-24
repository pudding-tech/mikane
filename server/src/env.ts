import dotenv from "dotenv";
import { isEmail } from "./utils/emailValidator";
dotenv.config();

interface EnvVariables {
  NODE_ENV: string;
  IN_PROD: boolean;
  PORT: number;
  ALLOWED_ORIGIN: string;
  SESSION_SECRET: string;

  DB_SERVER: string;
  DB_PORT: number;
  DB_DATABASE: string;
  DB_USER: string;
  DB_PASSWORD: string;

  MIKANE_EMAIL?: string;
  MIKANE_EMAIL_PASSWORD?: string;
}

const validateEnvVariables = (env: NodeJS.ProcessEnv): EnvVariables => {

  const missing: string[] = [];

  if (!env.DB_SERVER) {
    missing.push("DB_SERVER");
  }
  if (!env.DB_USER) {
    missing.push("DB_USER");
  }
  if (!env.DB_PASSWORD) {
    missing.push("DB_PASSWORD");
  }

  if (env.NODE_ENV === "production" && !env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environement variable needs to be set when running in production");
  }

  if (env.MIKANE_EMAIL && !isEmail(env.MIKANE_EMAIL)) {
    throw new Error(`Environment variable MIKANE_EMAIL (${env.MIKANE_EMAIL}) is not a valid email`);
  }

  if (missing.length > 0) {
    throw new Error(`Cannot start server - required environment variables missing: ${missing.join(", ")}`);
  }

  return {
    NODE_ENV: env.NODE_ENV || "dev",
    IN_PROD: env.NODE_ENV === "production",
    PORT: parseInt(env.PORT ?? "") || 3002,
    ALLOWED_ORIGIN: env.ALLOWED_ORIGIN || "http://localhost:4200",
    SESSION_SECRET: env.SESSION_SECRET || "abcdef",

    DB_SERVER: env.DB_SERVER as string,
    DB_PORT: parseInt(env.DB_PORT ?? "") || 1433,
    DB_DATABASE: env.DB_DATABASE || "master",
    DB_USER: env.DB_USER as string,
    DB_PASSWORD: env.DB_PASSWORD as string,

    MIKANE_EMAIL: env.MIKANE_EMAIL,
    MIKANE_EMAIL_PASSWORD: env.MIKANE_EMAIL_PASSWORD
  };
};

const envVariables = validateEnvVariables(process.env);

export default envVariables;
