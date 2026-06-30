require("dotenv").config();

const app = require("./src/app");
const initDB = require("./src/db/initDB");
const PORT = process.env.PORT || 5000;
const seedSuperAdmin = require("./src/db/seedSuperAdmin");

// Worker and cron jobs for periodic data sync
// TODO: testing for 5 mins, change to 1 hour in production
require("./src/workers/externalDataImport.worker");
require("./src/jobs/externalDataImport.cron");

// Chart Processing Queue Workers and Jobs
require("./src/workers/chart.worker");
require("./src/jobs/chart-ingestion.job");

// HEDIS Background Analysis Queue Worker
require("./src/workers/hedis.worker");
require("./src/workers/hedis-qa.worker");
require("./src/workers/timeline.worker");

async function startServer() {
  await initDB();
  await seedSuperAdmin();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
