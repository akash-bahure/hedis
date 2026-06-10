const express = require("express");

const uploadRoutes = require("./routes/upload.routes");
const timelineRoutes = require("./routes/timeline.routes");

const app = express();

app.use(express.json());

app.use("/api/upload", uploadRoutes);
app.use("/api/timeline", timelineRoutes);

module.exports = app;
