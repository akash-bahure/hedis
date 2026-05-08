require("dotenv").config();

const app = require("./src/app");
const initDB = require("./src/db/initDB");
const PORT = process.env.PORT || 5000;
const seedSuperAdmin = require("./src/db/seedSuperAdmin");

async function startServer() {
  await initDB();
  await seedSuperAdmin();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
