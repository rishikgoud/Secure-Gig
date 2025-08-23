import express from "express";
import helmet from "helmet";
import cors from "cors";

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Test route
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Server is running" });
});

// Start server
const port = 4000;
app.listen(port, () => {
  console.log(`✅ Minimal server running on port ${port}`);
  console.log(`Test: http://localhost:${port}/api/health`);
});
