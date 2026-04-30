require("dotenv").config();

const app = require("./src/app");
const initDB = require("./src/db/initDB");

// Initialize DB (creates table automatically)
initDB();

require("./models/client.model");

const clientRoutes = require("./routes/client.routes");

app.use(express.json());

// Routes
app.use("/api/clients", clientRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
