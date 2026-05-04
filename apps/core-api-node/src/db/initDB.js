const sequelize = require("../config/db");
// Import models so Sequelize knows about them before syncing
require("../models/client.model");

const initDB = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synchronized successfully (Sequelize)");
  } catch (err) {
    console.error("Schema Error", err.message);
  }
};

module.exports = initDB;