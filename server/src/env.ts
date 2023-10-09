import dotenv from "dotenv";
import { isEmail } from "./utils/emailValidator";

if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: "./.env.test" });
}
else {
  dotenv.config();
}

interface EnvVariables {
  NODE_ENV: "dev" | "production" | "staging" | "test";
  IN_PROD: boolean;
  DEPLOYED: boolean;
  PORT: number;
  ALLOWED_ORIGIN: string;
  SESSION_SECRET: string;
  COOKIE_NAME?: string;
  COOKIE_DOMAIN?: string;

  DB_HOST: string;
  DB_PORT: number;
  DB_DATABASE: string;
  DB_USER: string;
  DB_PASSWORD: string;

  MIKANE_EMAIL?: string;
  MIKANE_EMAIL_PASSWORD?: string;
}

const validateEnvVariables = (env: NodeJS.ProcessEnv): EnvVariables => {

  const missing: string[] = [];

  if (!env.DB_HOST) {
    missing.push("DB_HOST");
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
    NODE_ENV: (env.NODE_ENV === "dev" || env.NODE_ENV === "production" || env.NODE_ENV === "staging" || env.NODE_ENV === "test") ? env.NODE_ENV : "dev",
    IN_PROD: env.NODE_ENV === "production",
    DEPLOYED: env.DEPLOYED === "true",
    PORT: parseInt(env.PORT ?? "") || 3002,
    ALLOWED_ORIGIN: env.ALLOWED_ORIGIN || "http://localhost:4200",
    SESSION_SECRET: env.SESSION_SECRET || "abcdef",
    COOKIE_NAME: env.COOKIE_NAME,
    COOKIE_DOMAIN: env.COOKIE_DOMAIN,

    DB_HOST: env.DB_HOST as string,
    DB_PORT: parseInt(env.DB_PORT ?? "") || 5432,
    DB_DATABASE: env.DB_DATABASE || "master",
    DB_USER: env.DB_USER as string,
    DB_PASSWORD: env.DB_PASSWORD as string,

    MIKANE_EMAIL: env.MIKANE_EMAIL,
    MIKANE_EMAIL_PASSWORD: env.MIKANE_EMAIL_PASSWORD
  };
};

let envVariables: EnvVariables;
try {
  envVariables = validateEnvVariables(process.env);
}
catch (err) {
  console.error(err);
  process.exit(1);
}

export default envVariables;
