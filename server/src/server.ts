import express from "express";
import cors from "cors";
import sql from "mssql";
import dotenv from "dotenv";
import eventRoutes from "./api/event";
import userRoutes from "./api/user";
import categoryRoutes from "./api/category";
import expenseRoutes from "./api/expense";
const port = process.env.PORT || 5000;

dotenv.config();
const dbConfig = {
  server: process.env.DB_SERVER || "Server env not set",
  port: parseInt(process.env.DB_PORT || "1433"),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustedConnection: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

const app = express();

// Connect to DB
sql
  .connect(dbConfig)
  .then((pool) => {
    if (pool.connecting) {
      console.log("Still connecting to database...");
    }
    if (pool.connected) {
      console.log("Connected to SQL database");
    }
  })
  .catch((e) => console.log("An error occured connecting to database: " + e));

// Set static folder
app.use(express.static("public"));

// Body parser
app.use(express.json());

// Enable client access (temporarily set to public)
app.use(cors({
  origin: "*"
}));

// Initialize routes defined in "/api/"
app.use("/api", eventRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", expenseRoutes);

// Send not found error message back to client if API call not found
app.use(((req, res) => {
  res.status(404).send({ error: "404: Not found" });
}));

// Listen for requests
app.listen(port, () => {
  console.log("Server running on port " + port);
});
