const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const path = require("path");
const tenantMiddleware = require("./middlewares/tenantMiddleware");
const authMiddleware = require("./middlewares/authMiddleware");

const app = express();

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

/*Swagger configuration */
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hedis Backend API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, "./routes/*.js")],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
  })
);

// Strips content-type for GET requests to prevent body-parser from trying to parse empty bodies
app.use((req, res, next) => {
  if (req.method === "GET" && req.headers["content-type"]) {
    delete req.headers["content-type"];
  }
  next();
});

app.use(express.json());

// Handle syntax errors during JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }
  next(err);
});

app.use(cors(corsOptions));

// Routes
app.get("/", (req, res) => {
  res.send("Server running");
});

app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

const manualChartAbstractionRoutes = require("./routes/manualChartAbstractionRoutes");

const chartAssignmentRoutes = require("./routes/chartsAssignmentRoute");

// Admin routes
app.use("/admin/auth", require("./routes/adminAuthRoutes"));
app.use("/admin/users", require("./routes/adminUserRoutes"));
app.use("/admin/orgs", require("./routes/orgRoutes"));

// Tenant & Authentication
app.use(tenantMiddleware);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/manual-chart-abstraction", manualChartAbstractionRoutes);
app.use("/api/chart-assignments", chartAssignmentRoutes);

app.use("/api/user-roles", require("./routes/userRoleRoutes"));

// Protected Routes
app.use(authMiddleware);

const clientRoutes = require("./routes/client.routes");
app.use("/api/clients", clientRoutes);
const projectRoutes = require("./routes/project.routes");
app.use("/api/projects", projectRoutes);

// app.use("/api/user-roles", require("./routes/userRoleRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/departments", require("./routes/department.routes"));

app.use("/api/profile", require("./routes/profile.routes"));
app.use("/api/patients", require("./routes/patient.routes"));
app.use("/api/work-queue", require("./routes/workQueue.routes"));
app.use("/api/audit-logs", require("./routes/auditLogRoutes"));
app.use(
  "/api/security-compliance",
  require("./routes/securityComplianceRoutes")
);
app.use("/api/security", require("./routes/securityDashboardRoutes"));
app.use("/api/access-logs", require("./routes/phiAccessLogsRoutes"));
app.use("/api/security-alerts", require("./routes/securityalrestRoute"));
app.use("/api/reports-analytics", require("./routes/reportsAnalytics.routes"));
app.use("/api/measures", require("./routes/measure.routes"));

app.use("/api/measure-library", require("./routes/measureLibrary.routes"));
module.exports = app;
