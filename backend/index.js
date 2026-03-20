// backend/index.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import logger from "./utils/logger.js";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import governanceRoutes from "./routes/governance.js";
import assetRoutes from "./routes/assets.js";
import riskRoutes from "./routes/risks.js";
import auditRoutes from "./routes/audits.js";
import reportRoutes from "./routes/reports.js";
import dashboardRoutes from "./routes/dashboard.js";
import rolesRoutes from "./routes/roles.js";
import permissionsRoutes from "./routes/permissions.js";
import uploadRoutes from "./routes/upload.js";
import vendorsRoutes from "./routes/vendors.js";
import departmentsRoutes from "./routes/departments.js";
import incidentsRoutes from "./routes/incidents.js";
import soaRoutes from "./routes/soa.js";
import controlTestsRoutes from "./routes/controlTests.js";
import controlMonitoringRoutes from "./routes/controlMonitoring.js";
import complianceRoutes from "./routes/compliance.js";
import trainingRoutes from "./routes/training.js";
import evidenceRoutes from "./routes/evidence.js";
import workflowAutomationRoutes from "./routes/workflowAutomation.js";
import integrationsRoutes from "./routes/integrations.js";
import userRolesRoutes from "./routes/user_roles.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authenticateToken } from "./middleware/auth.js";
import { query } from "./config/database.js";
import { initDatabase } from "./config/initDatabase.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Upload route (protected)
app.use("/api/v1/upload", authenticateToken, uploadRoutes);

// Security middleware
app.use(helmet());
// Allow CORS for Swagger UI and frontend
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3000", // Allow Swagger UI if served from backend
    ],
    credentials: true,
  }),
);

// Swagger UI endpoint
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/v1/", limiter);

app.use(express.json({ limit: "10mb" }));
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Database health check
app.get("/api/v1/db-health", async (req, res) => {
  try {
    const [rows] = await query("SELECT 1 AS db_status");
    if (rows && rows.length > 0 && rows[0].db_status === 1) {
      res.json({ status: "connected" });
    } else {
      res
        .status(500)
        .json({ status: "error", error: "Unexpected DB response" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// Public routes
app.use("/api/v1/auth", authRoutes);

// Protected routes
app.use("/api/v1/users", authenticateToken, userRoutes);
app.use("/api/v1/governance", authenticateToken, governanceRoutes);
app.use("/api/v1/assets", authenticateToken, assetRoutes);
app.use("/api/v1/risks", authenticateToken, riskRoutes);
app.use("/api/v1/audits", authenticateToken, auditRoutes);
app.use("/api/v1/reports", authenticateToken, reportRoutes);
app.use("/api/v1/dashboard", authenticateToken, dashboardRoutes);
app.use("/api/v1/roles", authenticateToken, rolesRoutes);
app.use("/api/v1/permissions", authenticateToken, permissionsRoutes);
app.use("/api/v1/vendors", authenticateToken, vendorsRoutes);
app.use("/api/v1/departments", authenticateToken, departmentsRoutes);
app.use("/api/v1/incidents", authenticateToken, incidentsRoutes);
app.use("/api/v1/soa", authenticateToken, soaRoutes);
app.use("/api/v1/control-tests", authenticateToken, controlTestsRoutes);
app.use(
  "/api/v1/control-monitoring",
  authenticateToken,
  controlMonitoringRoutes,
);
app.use("/api/v1/compliance", authenticateToken, complianceRoutes);
app.use("/api/v1/training", authenticateToken, trainingRoutes);
app.use("/api/v1/evidence", authenticateToken, evidenceRoutes);
app.use(
  "/api/v1/workflow-automation",
  authenticateToken,
  workflowAutomationRoutes,
);
app.use("/api/v1/integrations", authenticateToken, integrationsRoutes);
app.use("/api/v1/user_roles", authenticateToken, userRolesRoutes);

// Error handling
app.use((err, req, res, next) => {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
  );
  errorHandler(err, req, res, next);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

async function startServer() {
  try {
    await initDatabase();

    app.listen(PORT, () => {
      logger.info(`ISMS Backend running on port ${PORT}`);
      console.log(`ISMS Backend running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
