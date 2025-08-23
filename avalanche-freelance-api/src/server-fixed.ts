import express from "express";
import helmet from "helmet";
import cors from "cors";
import { logger } from "./config/logger";
import { env } from "./config/env";
import { AppError } from "./utils/errors";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  logger.info("Incoming request", {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  next();
});

// Import routes dynamically to avoid module-level execution
async function setupRoutes(): Promise<void> {
  try {
    const { chain } = await import("./routes/chain");
    const { wallet } = await import("./routes/wallet");
    const { escrow } = await import("./routes/escrow");
    const { tx } = await import("./routes/tx");
    const { default: map } = await import("./routes/map");

    app.use("/api/chain", chain);
    app.use("/api/wallet", wallet);
    app.use("/api/escrow", escrow);
    app.use("/api/tx", tx);
    app.use("/api/map", map);

    logger.info("Routes registered successfully");
  } catch (error) {
    logger.error("Failed to setup routes", { error: String(error) });
    throw error;
  }
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// 404 handler (no "*" to avoid path-to-regexp issues)
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction): void => {
  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.name === "ZodError") {
    res.status(400).json({ error: "Validation Error", details: err.errors });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err.name === "MongoError" || err.name === "ValidationError") {
    res.status(400).json({ error: "Database Error", message: err.message });
    return;
  }

  res.status(500).json({
    error: env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
  });
});

// Start server
async function startServer(): Promise<void> {
  try {
    const { connectDB } = await import("./db");
    await connectDB();

    const { testProviderConnection } = await import("./config/provider");
    await testProviderConnection();

    await setupRoutes();

    const port = env.PORT || 4000;
    app.listen(port, () => {
      logger.info("Server started", {
        port,
        healthCheck: `http://localhost:${port}/api/health`,
        chainInfo: `http://localhost:${port}/api/chain/info`,
        gasPrices: `http://localhost:${port}/api/chain/gas`,
      });
    });
  } catch (error) {
    logger.error("Failed to start server", { error: String(error) });
    process.exit(1);
  }
}

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception", {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
  logger.error("Unhandled Rejection", {
    reason: String(reason),
    promise: String(promise),
  });
  process.exit(1);
});

startServer();
