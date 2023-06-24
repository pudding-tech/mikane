import express from "express";
import session from "express-session";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import helmet from "helmet";
import sql from "mssql";
import MSSQLSessionStore from "./session-store/MSSQLSessionStore";
import eventRoutes from "./api/events";
import userRoutes from "./api/users";
import categoryRoutes from "./api/categories";
import expenseRoutes from "./api/expenses";
import authRoutes from "./api/authentication";
import apiDocument from "./api.json";
import env from "./env";
import { errorHandler } from "./errorHandler";
import { dbConfig } from "./dbConfig";

const app = express();

// Connect to DB
const connectDB = () => {
  sql.connect(dbConfig)
    .then(pool => {
      if (pool.connecting) {
        console.log("Still connecting to database...");
      }
      if (pool.connected) {
        console.log(`Connected to SQL database: ${dbConfig.server} - ${dbConfig.database}`);
        store.connect().catch(err => console.error("Error connecting to session store\n", err));
      }
    })
    .catch(err => {
      console.log("An error occurred connecting to database: " + err);
      setTimeout(() => {
        connectDB();
      }, 10000);
    });
};
connectDB();

// Set static folder
app.use(express.static("public", { index: false }));

// Body parser
app.use(express.json());

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
const store = new MSSQLSessionStore(dbConfig, {
  table: "[session]",
  autoDestroy: true,
  autoDestroyInterval: 1000 * 60 * 60 * 24
});

// Enable user sessions
const tenDays = 1000 * 60 * 60 * 24 * 10;
// const twentyMinutes = 1000 * 60 * 20;
app.use(session({
    name: "mikane.sid",
    secret: env.SESSION_SECRET,
    store: store,
    cookie: {
      maxAge: tenDays,
      httpOnly: true,
      secure: env.IN_PROD,
      sameSite: "lax",
    },
    saveUninitialized: false,
    resave: false,
    rolling: true,
    unset: "destroy",
}));

app.post("*", (req, res, next) => {
  if (req.headers["content-type"] !== undefined && !req.is("application/json")) {
    return res.status(400).json({ err: "Wrong content-type" });
  }
  next();
});

app.put("*", (req, res, next) => {
  if (!req.is("application/json")) {
    return res.status(400).json({ err: "Wrong content-type" });
  }
  next();
});

// Initialize routes defined in "/api/"
app.use("/api", eventRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", expenseRoutes);
app.use("/api", authRoutes);

// Error handler
app.use(errorHandler);

// Send not found message back to client if route not found
app.use((req, res) => {
  res.status(404).send({ error: "404: Not found" });
});

// Listen for requests
app.listen(env.PORT, () => {
  console.log("Mikane server running on port " + env.PORT);
});
