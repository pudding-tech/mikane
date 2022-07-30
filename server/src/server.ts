import express from "express";
import cors from "cors";
import routes from "./api";
const port = process.env.PORT || 5000;

const app = express();

// Set static folder
app.use(express.static("public"));

// Body parser
app.use(express.json());

// Enable client access (temporarily set to public)
app.use(cors({
  origin: "*"
}));

// Initialize routes defined in "/api.ts"
app.use("/api", routes);

// Send not found error message back to client if API call not found
app.use(((req, res) => {
  res.status(404).send({ error: "404: Not found" });
}));

// Listen for requests
app.listen(port, () => {
  console.log("Server running on port " + port);
});
