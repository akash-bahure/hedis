const express = require("express");

const uploadRoutes = require("./routes/upload.routes");
const hedisRoutes = require("./routes/hedis.routes");

const app = express();

app.use(express.json());

app.use("/api/upload", uploadRoutes);
app.use("/api/hedis", hedisRoutes);



module.exports = app;
