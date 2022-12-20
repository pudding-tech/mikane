import express from "express";
import session from "express-session";
import cors from "cors";
import sql from "mssql";
import MSSQLStore from "connect-mssql-v2";
import dotenv from "dotenv";
import eventRoutes from "./api/events";
import userRoutes from "./api/users";
import categoryRoutes from "./api/categories";
import expenseRoutes from "./api/expenses";
import paymentRoutes from "./api/payments";
import authRoutes from "./api/authentication";

dotenv.config();
import { dbConfig } from "./config";

const port = process.env.PORT || 3002;
const inProd = process.env.ENVIRONMENT === "prod" ? true : false;
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
        console.log("Connected to SQL database");
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
app.use(express.static("public"));

// Body parser
app.use(express.json());

// Enable client access
app.use(cors({
  origin: "https://pudding-debt.hundseth.com",
  credentials: true
}));

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
    secure: inProd,
    sameSite: "lax"
  },
  saveUninitialized: false,
  resave: false,
  rolling: true,
  unset: "destroy"
}));

app.post("*", (req, res, next) => {
  if (!req.is("application/json")) {
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
app.use("/api", paymentRoutes);
app.use("/api", authRoutes);

// Send not found message back to client if route not found
app.use(((req, res) => {
  res.status(404).send({ error: "404: Not found" });
}));

// Listen for requests
app.listen(port, () => {
  console.log("PuddingDebt server running on port " + port);
});
