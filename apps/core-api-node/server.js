require("dotenv").config();

const app = require("./src/app");
const initDB = require("./src/db/initDB");
const PORT = process.env.PORT || 5000;
const seedSuperAdmin = require("./src/db/seedSuperAdmin");

// Worker and cron jobs for periodic data sync
// TODO: testing for 5 mins, change to 1 hour in production
require("./src/workers/externalDataImport.worker");
require("./src/jobs/externalDataImport.cron");

async function startServer() {
  await initDB();
  await seedSuperAdmin();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
