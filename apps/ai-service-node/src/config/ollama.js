const { Ollama } = require("ollama");

console.log("=================================");
console.log("[OLLAMA CONFIG]");
console.log("Host:", process.env.OLLAMA_CLOUD_URL);
console.log(
  "API Key Present:",
  !!process.env.OLLAMA_API_KEY
);
console.log("[OLLAMA]");
console.log("Host:", process.env.OLLAMA_CLOUD_URL);
console.log(
  "API Key Length:",
  process.env.OLLAMA_API_KEY?.length
);
console.log("=================================");

const ollama = new Ollama({
  host: process.env.OLLAMA_CLOUD_URL,
  headers: {
    Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
  },
});

module.exports = ollama;
