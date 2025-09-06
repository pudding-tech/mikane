import dotenv from "dotenv";
import { isEmail } from "./utils/validators/emailValidator.ts";

if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: "./.env.test", quiet: true });
}
else {
  dotenv.config({ quiet: true });
}

interface EnvVariables {
  NODE_ENV: EnvType;
  IN_PROD: boolean;
  DEPLOYED: boolean;
  PORT: number;
  ALLOWED_ORIGIN: string;
  SESSION_SECRET: string;
  LOG_LEVEL: LogLevelType;
  TRUSTED_PROXIES: number;
  SKIP_CSRF_CHECK: boolean;
  COOKIE_NAME?: string;
  COOKIE_DOMAIN?: string;
  RATE_LIMIT_WINDOW_SEC?: number;
  RATE_LIMIT_MAX_REQUESTS?: number;
  RATE_LIMIT_STRICT_WINDOW_SEC?: number;
  RATE_LIMIT_STRICT_MAX_REQUESTS?: number;

  DB_HOST: string;
  DB_PORT: number;
  DB_DATABASE: string;
  DB_USER: string;
  DB_PASSWORD: string;

  MIKANE_EMAIL?: string;
  MIKANE_EMAIL_API_TOKEN?: string;
}

const ALLOWED_ENVIRONMENTS = ["dev", "production", "staging", "test"] as const;
const ALLOWED_LOG_LEVELS = ["alert", "error", "warn", "info", "fail", "success", "log", "debug", "verbose"] as const;

type EnvType = typeof ALLOWED_ENVIRONMENTS[number];
type LogLevelType = typeof ALLOWED_LOG_LEVELS[number];

const isEnvType = (environement: any): environement is EnvType => {
  if (ALLOWED_ENVIRONMENTS.includes(environement)) {
    return true;
  }
  if (environement) {
    console.warn(`Invalid environment: '${environement}'. Defaulting to 'dev'`);
  } 
  return false;
};
const isLogLevelType = (logLevel: any): logLevel is LogLevelType => {
  if (ALLOWED_LOG_LEVELS.includes(logLevel)) {
    return true;
  }
  if (logLevel) {
    console.warn(`Invalid log level: '${logLevel}'. Defaulting to 'log'`);
  }
  return false;
};

const createEnvVariables = (env: NodeJS.ProcessEnv): EnvVariables => {

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

  if (env.PORT !== undefined) {
    const port = Number(env.PORT);
    if (isNaN(port) || port <= 0) {
      throw new Error(`Environment variable PORT (${env.PORT}) must be a valid non-negative number`);
    }
  }

  if (env.DB_PORT !== undefined) {
    const dbPort = Number(env.DB_PORT);
    if (isNaN(dbPort) || dbPort <= 0) {
      throw new Error(`Environment variable DB_PORT (${env.DB_PORT}) must be a valid non-negative number`);
    }
  }

  if (env.TRUSTED_PROXIES !== undefined) {
    const trustedProxies = Number(env.TRUSTED_PROXIES);
    if (isNaN(trustedProxies) || trustedProxies < 0) {
      throw new Error(`Environment variable TRUSTED_PROXIES (${env.TRUSTED_PROXIES}) must be a valid non-negative number`);
    }
  }

  if (env.RATE_LIMIT_WINDOW_SEC !== undefined) {
    const rateLimitWindow = Number(env.RATE_LIMIT_WINDOW_SEC);
    if (isNaN(rateLimitWindow) || rateLimitWindow <= 0) {
      throw new Error(`Environment variable RATE_LIMIT_WINDOW_SEC (${env.RATE_LIMIT_WINDOW_SEC}) must be a valid positive number`);
    }
  }

  if (env.RATE_LIMIT_MAX_REQUESTS !== undefined) {
    const rateLimitMax = Number(env.RATE_LIMIT_MAX_REQUESTS);
    if (isNaN(rateLimitMax) || rateLimitMax <= 0) {
      throw new Error(`Environment variable RATE_LIMIT_MAX_REQUESTS (${env.RATE_LIMIT_MAX_REQUESTS}) must be a valid positive number`);
    }
  }

  if (env.RATE_LIMIT_STRICT_WINDOW_SEC !== undefined) {
    const rateLimitWindow = Number(env.RATE_LIMIT_STRICT_WINDOW_SEC);
    if (isNaN(rateLimitWindow) || rateLimitWindow <= 0) {
      throw new Error(`Environment variable RATE_LIMIT_STRICT_WINDOW_SEC (${env.RATE_LIMIT_STRICT_WINDOW_SEC}) must be a valid positive number`);
    }
  }

  if (env.RATE_LIMIT_STRICT_MAX_REQUESTS !== undefined) {
    const rateLimitMax = Number(env.RATE_LIMIT_STRICT_MAX_REQUESTS);
    if (isNaN(rateLimitMax) || rateLimitMax <= 0) {
      throw new Error(`Environment variable RATE_LIMIT_STRICT_MAX_REQUESTS (${env.RATE_LIMIT_STRICT_MAX_REQUESTS}) must be a valid positive number`);
    }
  }

  if (env.MIKANE_EMAIL && !isEmail(env.MIKANE_EMAIL)) {
    throw new Error(`Environment variable MIKANE_EMAIL (${env.MIKANE_EMAIL}) is not a valid email`);
  }

  if (missing.length > 0) {
    throw new Error(`Cannot start server - required environment variables missing: ${missing.join(", ")}`);
  }

  return {
    NODE_ENV: isEnvType(env.NODE_ENV) ? env.NODE_ENV : "dev",
    IN_PROD: env.NODE_ENV === "production",
    DEPLOYED: env.DEPLOYED === "true",
    PORT: Number(env.PORT) || 3002,
    ALLOWED_ORIGIN: env.ALLOWED_ORIGIN || "http://localhost:4200",
    SESSION_SECRET: env.SESSION_SECRET || "abcdef",
    LOG_LEVEL: isLogLevelType(env.LOG_LEVEL) ? (env.LOG_LEVEL) : "log",
    TRUSTED_PROXIES: Number(env.TRUSTED_PROXIES) || 0,
    SKIP_CSRF_CHECK: env.SKIP_CSRF_CHECK === "true",
    COOKIE_NAME: env.COOKIE_NAME,
    COOKIE_DOMAIN: env.COOKIE_DOMAIN,
    RATE_LIMIT_WINDOW_SEC: env.RATE_LIMIT_WINDOW_SEC ? Number(env.RATE_LIMIT_WINDOW_SEC) : undefined,
    RATE_LIMIT_MAX_REQUESTS: env.RATE_LIMIT_MAX_REQUESTS ? Number(env.RATE_LIMIT_MAX_REQUESTS) : undefined,
    RATE_LIMIT_STRICT_WINDOW_SEC: env.RATE_LIMIT_STRICT_WINDOW_SEC ? Number(env.RATE_LIMIT_STRICT_WINDOW_SEC) : undefined,
    RATE_LIMIT_STRICT_MAX_REQUESTS: env.RATE_LIMIT_STRICT_MAX_REQUESTS ? Number(env.RATE_LIMIT_STRICT_MAX_REQUESTS) : undefined,

    DB_HOST: env.DB_HOST as string,
    DB_PORT: Number(env.DB_PORT) || 5432,
    DB_DATABASE: env.DB_DATABASE || "master",
    DB_USER: env.DB_USER as string,
    DB_PASSWORD: env.DB_PASSWORD as string,

    MIKANE_EMAIL: env.MIKANE_EMAIL,
    MIKANE_EMAIL_API_TOKEN: env.MIKANE_EMAIL_API_TOKEN
  };
};

let envVariables: EnvVariables;
try {
  envVariables = createEnvVariables(process.env);
}
catch (err) {
  console.error(err);
  process.exit(1);
}

export default envVariables;
export { ALLOWED_LOG_LEVELS, LogLevelType };
