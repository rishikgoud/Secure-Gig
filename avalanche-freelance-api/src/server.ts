import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { logger, setupGlobalErrorHandling } from "./config/logger";
import { env } from "./config/env";
import { AppError } from "./utils/errors";
import { globalErrorHandler, notFound } from "./middleware/errorHandler";
import { initializeSocket } from "./config/socket";

const app = express();
const httpServer = createServer(app);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:3000'], // Allow specific frontend origins
  credentials: true, // Enable credentials support
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req, _res, next) => {
  logger.http("Incoming request", {
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
    // Import existing blockchain routes
    const { chain } = await import("./routes/chain");
    const { wallet } = await import("./routes/wallet");
    const { escrow } = await import("./routes/escrow");
    const { tx } = await import("./routes/tx");
    
    // Import new authentication and user management routes
    const authRoutes = await import("./routes/authRoutes");
    const userRoutes = await import("./routes/userRoutes");
    const jobRoutes = await import("./routes/jobRoutes");
    const proposalRoutes = await import("./routes/proposalRoutes");
    const mapRoutes = await import("./routes/map");

    // Register existing blockchain routes
    app.use("/api/chain", chain);
    app.use("/api/wallet", wallet);
    app.use("/api/escrow", escrow);
    app.use("/api/tx", tx);
    
    // Register new authentication and user management routes
    app.use("/api/auth", authRoutes.default);
    app.use("/api/users", userRoutes.default);
    app.use("/api/jobs", jobRoutes.default);
    app.use("/api/proposals", proposalRoutes.default);
    app.use("/api/map", mapRoutes.default);

    logger.info("All routes registered successfully");
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

// Start server
async function startServer(): Promise<void> {
  try {
    // Setup global error handling first
    setupGlobalErrorHandling();
    
    const { connectDB } = await import("./db");
    await connectDB();

    const { testProviderConnection } = await import("./config/provider");
    await testProviderConnection();

    await setupRoutes();

    // 404 handler (must come AFTER routes)
    app.use(notFound);

    // Global error handler (AFTER routes as well)
    app.use(globalErrorHandler);

    // Initialize Socket.IO server
    const socketManager = initializeSocket(httpServer);

    const port = env.PORT || 4000;
    httpServer.listen(port, () => {
      logger.info("Server started successfully", {
        port,
        environment: env.NODE_ENV,
        socketIO: "enabled",
        healthCheck: `http://localhost:${port}/api/health`,
        chainInfo: `http://localhost:${port}/api/chain/info`,
        gasPrices: `http://localhost:${port}/api/chain/gas`,
        auth: `http://localhost:${port}/api/auth`,
        jobs: `http://localhost:${port}/api/jobs`,
        users: `http://localhost:${port}/api/users`,
      });
    });
  } catch (error) {
    logger.error("Failed to start server", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
}

// Remove duplicate error handlers since setupGlobalErrorHandling() handles these
startServer();
