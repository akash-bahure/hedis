require("dotenv").config();

const app = require("./src/app");
const initDB = require("./src/db/initDB");

// Initialize DB (creates table automatically)
initDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
