import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import helmet from "helmet";
import SessionStore from "./session-store/SessionStore";
import eventRoutes from "./api/events";
import userRoutes from "./api/users";
import guestUserRoutes from "./api/guestUsers";
import categoryRoutes from "./api/categories";
import expenseRoutes from "./api/expenses";
import authRoutes from "./api/authentication";
import validationRoutes from "./api/validation";
import apiDocument from "./api.json";
import env from "./env";
import { pool } from "./db";
import { errorHandler } from "./errorHandler";

const app = express();

// Check Database connection
const checkDBConnection = () => {
  pool.connect()
    .then(client => {
      console.log(`Connected to SQL database: ${env.DB_HOST} - ${env.DB_DATABASE}`);
      client.release();
    })
    .catch(err => {
      console.log("An error occurred connecting to database: " + err);
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
    return res.status(400).json({ error: "Invalid JSON in body"});
  }
});

// Trust proxy
app.enable("trust proxy");

// Helmet protection
app.use(helmet());

// Enable client access
app.use(cors({
    origin: env.ALLOWED_ORIGIN,
    credentials: true,
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

app.post("*", (req, res, next) => {
  if (req.headers["content-type"] !== undefined && !req.is("application/json")) {
    return res.status(400).json({ error: "Wrong content-type" });
  }
  next();
});

app.put("*", (req, res, next) => {
  if (req.headers["content-type"] !== undefined && !req.is("application/json")) {
    return res.status(400).json({ error: "Wrong content-type" });
  }
  next();
});

// Initialize routes defined in "/api/"
app.use("/api", eventRoutes);
app.use("/api", userRoutes);
app.use("/api", guestUserRoutes);
app.use("/api", categoryRoutes);
app.use("/api", expenseRoutes);
app.use("/api", authRoutes);
app.use("/api", validationRoutes);

// Error handler
app.use(errorHandler);

// Send not found message back to client if route not found
app.use((_req, res) => {
  res.status(404).send({ error: "404: Not found" });
});

export default app;
