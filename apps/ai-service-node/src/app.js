const express = require("express");

const uploadRoutes = require("./routes/upload.routes");
const hedisRoutes = require("./routes/hedis.routes");
const text2sqlRoutes = require("./routes/text2sql.routes");

const app = express();

app.use(express.json());

app.use("/api/upload", uploadRoutes);
app.use("/api/hedis", hedisRoutes);
app.use("/api/text2sql", text2sqlRoutes);

module.exports = app;
