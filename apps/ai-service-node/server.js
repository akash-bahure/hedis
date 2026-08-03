require("dotenv").config();

// Start BullMQ Ollama Worker
require("./src/workers/ollama.worker");

const app = require("./src/app");
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`AI Service running on ${PORT}`);
});
