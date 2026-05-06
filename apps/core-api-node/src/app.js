const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const path = require("path");
const tenantMiddleware = require("./middlewares/tenantMiddleware");

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

app.use(express.json());
app.use(cors(corsOptions));

// Routes
app.get("/", (req, res) => {
  res.send("Server running");
});

app.use("/admin", require("./routes/orgRoutes"));

app.use(tenantMiddleware);
app.use("/api/auth", require("./routes/authRoutes"));
const clientRoutes = require("./routes/client.routes");
app.use("/api/clients", clientRoutes);
const projectRoutes = require("./routes/project.routes");
app.use("/api/projects", projectRoutes);
app.use("/api/user-roles", require("./routes/userRoleRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/profile", require("./routes/profile.routes"));

module.exports = app;
