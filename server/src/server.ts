import express from "express";
import cors from "cors";
import sql from "mssql";
import dotenv from "dotenv";
import eventRoutes from "./api/events";
import userRoutes from "./api/users";
import categoryRoutes from "./api/categories";
import expenseRoutes from "./api/expenses";
import paymentRoutes from "./api/payments";

dotenv.config();
import { dbConfig } from "./config";
const port = process.env.PORT || 3002;

const app = express();

// Connect to DB
const connectDB = () => {
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
    .catch((err) => {
      console.log("An error occurred connecting to database: " + err);
      setTimeout( () => {
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
  origin: "https://pudding-debt.hundseth.com"
}));

// Initialize routes defined in "/api/"
app.use("/api", eventRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", expenseRoutes);
app.use("/api", paymentRoutes);

// Send not found error message back to client if API call not found
app.use(((req, res) => {
  res.status(404).send({ error: "404: Not found" });
}));

// Listen for requests
app.listen(port, () => {
  console.log("PuddingDebt server running on port " + port);
});
