import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import helmet from "helmet";
import SessionStore from "./session-store/SessionStore.ts";
import authRoutes from "./api/authentication.ts";
import categoryRoutes from "./api/categories.ts";
import eventRoutes from "./api/events.ts";
import expenseRoutes from "./api/expenses.ts";
import guestUserRoutes from "./api/guestUsers.ts";
import logRoutes from "./api/log.ts";
import notificationRoutes from "./api/notifications.ts";
import userRoutes from "./api/users.ts";
import validationRoutes from "./api/validation.ts";
import apiDocument from "./api.json" with { type: "json" };
import env from "./env.ts";
import logger from "./utils/logger.ts";
import { pool } from "./db.ts";
import { errorHandler } from "./errorHandler.ts";

const app = express();

// Check Database connection
const checkDBConnection = () => {
  pool.connect()
    .then(client => {
      logger.success(`Connected to SQL database: ${env.DB_HOST} - ${env.DB_DATABASE}`);
      client.release();
    })
    .catch(err => {
      logger.error("An error occurred connecting to database: " + err);
      setTimeout(() => {
        checkDBConnection();
      }, 10000);
    });
};
checkDBConnection();

// Set static folder
app.use(express.static("public", { index: false }));

// Body parser
app.use(express.json());

// Error handler for invalid JSON in body
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err) {
    res.status(400).json({ error: "Invalid JSON in body"});
    return;
  }
});

// Trust proxy
app.enable("trust proxy");

// Helmet protection
app.use(helmet());

// Enable client access
app.use(cors({
  origin: env.ALLOWED_ORIGIN,
  credentials: true
}));

// API documentation
const apiDocsOptions = {
  swaggerOptions: {
    supportedSubmitMethods: env.IN_PROD ? ["get"] : ["get", "post", "put", "delete"],
    validatorUrl: null
  },
  customCssUrl: "/SwaggerDark.css",
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Mikane API",
  customfavIcon: "/favicon.png"
};
app.use("/", swaggerUi.serve);
app.get("/", swaggerUi.setup(apiDocument, apiDocsOptions));

// Session storage
const store = new SessionStore({
  pool: pool,
  table: "session",
  autoDestroy: true,
  autoDestroyInterval: 1000 * 60 * 60 * 24
});

// Enable user sessions
const tenDays = 1000 * 60 * 60 * 24 * 10;
// const twentyMinutes = 1000 * 60 * 20;
app.use(session({
  name: env.COOKIE_NAME ?? "mikane.sid",
  secret: env.SESSION_SECRET,
  store: store,
  cookie: {
    domain: env.COOKIE_DOMAIN,
    maxAge: tenDays,
    httpOnly: true,
    secure: env.DEPLOYED,
    sameSite: "strict"
  },
  saveUninitialized: false,
  resave: false,
  rolling: true,
  unset: "destroy"
}));

app.post("/{*any}", (req, res, next) => {
  if (req.headers["content-type"] !== undefined && !req.is("application/json")) {
    res.status(400).json({ error: "Wrong content-type" });
    return;
  }
  next();
});

app.put("/{*any}", (req, res, next) => {
  if (req.headers["content-type"] !== undefined && !req.is("application/json")) {
    res.status(400).json({ error: "Wrong content-type" });
    return;
  }
  next();
});

// Ensure req.body is always an object for JSON requests
app.use((req, _res, next) => {
  if ((req.method === "POST" || req.method === "PUT" || req.method === "PATCH" || req.method === "DELETE") && typeof req.body === "undefined") {
    req.body = {};
  }
  next();
});

// Initialize routes defined in "/api"
app.use("/api", authRoutes);
app.use("/api", categoryRoutes);
app.use("/api", eventRoutes);
app.use("/api", expenseRoutes);
app.use("/api", guestUserRoutes);
app.use("/api", logRoutes);
app.use("/api", notificationRoutes);
app.use("/api", userRoutes);
app.use("/api", validationRoutes);

// Error handler
app.use(errorHandler);

// Send not found message back to client if route not found
app.use((_req, res) => {
  res.status(404).send({ error: "404: Not found" });
});

export default app;
