import express from "express";
const router = express.Router();

// Test
router.get("/test", (req, res) => {
  console.log("API test");
  return res.status(200).send("API testing 123");
});

export default router;