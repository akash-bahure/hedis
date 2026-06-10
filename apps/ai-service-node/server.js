require("dotenv").config();

const app = require("./src/app");
const initDB = require("./src/db/initDB");

const PORT = process.env.PORT || 8000;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`AI Service running on ${PORT}`);
  });
});
