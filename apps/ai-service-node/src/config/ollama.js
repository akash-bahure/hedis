const { Ollama } = require("ollama");

const ollama = new Ollama({
  host: process.env.OLLAMA_CLOUD_URL,
  headers: {
    Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
  },
});

module.exports = ollama;
