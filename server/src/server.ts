import express from "express";
import session from "express-session";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import helmet from "helmet";
import sql from "mssql";
import MSSQLStore from "connect-mssql-v2";
import dotenv from "dotenv";
import eventRoutes from "./api/events";
import userRoutes from "./api/users";
import categoryRoutes from "./api/categories";
import expenseRoutes from "./api/expenses";
import authRoutes from "./api/authentication";
import { errorHandler } from "./errorHandler";

dotenv.config();
import { dbConfig } from "./config";
import apiDocument from "./api.json";

const port = process.env.PORT || 3002;
const inProd = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod" ? true : false;
const sessionSecret = process.env.SESSION_SECRET || "abcdef";

const app = express();

// Connect to DB
const connectDB = () => {
  sql
    .connect(dbConfig)
    .then(pool => {
      if (pool.connecting) {
        console.log("Still connecting to database...");
      }
      if (pool.connected) {
        console.log(`Connected to SQL database: ${dbConfig.server} - ${dbConfig.database}`);
      }
    })
    .catch(err => {
      console.log("An error occurred connecting to database: " + err);
      setTimeout(() => {
        connectDB();
      }, 5000);
    });
};
connectDB();

// Set static folder
app.use(express.static("public", { index: false }));

// Body parser
app.use(express.json());

// Helmet protection
app.use(helmet());

// Enable client access
app.use(cors({
  origin: inProd ? "https://pudding-debt.hundseth.com" : "http://localhost:4200",
  credentials: true
}));

// API docs
const apiDocsOptions = {
  customCssUrl: "/SwaggerDark.css",
  customCss: ".swagger-ui .topbar { display: none }",
  swaggerOptions: {
    supportedSubmitMethods: ["get", "post"]
  }
};
app.use("/", swaggerUi.serve);
app.get("/", swaggerUi.setup(apiDocument, apiDocsOptions));
// console.log(__dirname);

// Session storage
const store = new MSSQLStore(dbConfig, {
  table: "[session]",
  autoRemove: true,
  autoRemoveInterval: 1000 * 60 * 60 * 24,
  useUTC: false
});

store.on("connect", () => {
  console.log("Session store connected at " + new Date());
});

store.on("error", err => {
  console.log("Session store error:", err);
});

// Enable user sessions
// const tenDays = 1000 * 60 * 60 * 24 * 10;
const twentyMinutes = 1000 * 60 * 20;
app.use(session({
  name: "puddingdebt.sid",
  secret: sessionSecret,
  store: store,
  cookie: {
    maxAge: twentyMinutes,
    httpOnly: true,
    secure: false, //inProd,
    sameSite: "lax"
  },
  saveUninitialized: false,
  resave: false,
  rolling: true,
  unset: "destroy"
}));

app.post("*", (req, res, next) => {
  if (!req.is("application/json") && req.headers["content-type"] !== undefined) {
    return res.status(400).json({ msg: "Wrong content-type"});
  }
  next();
});

app.put("*", (req, res, next) => {
  if (!req.is("application/json")) {
    return res.status(400).json({ msg: "Wrong content-type"});
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
app.use(((req, res) => {
  res.status(404).send({ error: "404: Not found" });
}));

// Listen for requests
app.listen(port, () => {
  console.log("PuddingDebt server running on port " + port);
});
