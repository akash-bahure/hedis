const express = require("express");
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: 'http://localhost:5000',
  optionsSuccessStatus: 200
}

app.use(express.json());
app.use(cors(corsOptions));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));

module.exports = app;