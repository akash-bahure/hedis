const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const app = express();
app.use(express.json());

/*Swagger configuration */
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation",
    },
  },
  apis: ["./src/routes/*.js"], // or wherever your routes are
};

/*Generate swagger spec */
const swaggerSpec = swaggerJsDoc(swaggerOptions);

/* THIS is what creates /api-docs route */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* Your normal routes */
app.get("/", (req, res) => {
  res.send("Server running");
});

/* Start server */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});