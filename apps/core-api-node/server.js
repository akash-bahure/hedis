// require("dotenv").config();

// const app = require("./src/app");
// const initDB = require("./src/db/initDB");

// // Initialize DB (creates table automatically)
// initDB();

// require("./models/client.model");

// const clientRoutes = require("./routes/client.routes");

// app.use(express.json());

// // Routes
// app.use("/api/clients", clientRoutes);

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

require("dotenv").config();

const express = require("express");
const app = express();

const sequelize = require("./src/config/db");

// ✅ Import model (correct path)
require("./src/models/client.model");

// ✅ Import routes (correct path)
const clientRoutes = require("./src/routes/client.routes");

// Middleware
app.use(express.json());

// Routes
app.use("/api/clients", clientRoutes);

const PORT = process.env.PORT || 5000;

// ✅ Sync DB and start server
sequelize.sync({ alter: true })
  .then(() => {
    console.log("✅ DB synced");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ DB Error:", err);
  });
