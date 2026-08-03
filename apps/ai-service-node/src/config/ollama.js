const { Ollama } = require("ollama");
const { Agent, fetch: undiciFetch } = require("undici");

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

const customFetch = (url, options) => {
  return undiciFetch(url, {
    ...options,
    dispatcher: new Agent({
      headersTimeout: 600000, // 10 minutes timeout for headers
      bodyTimeout: 600000,    // 10 minutes timeout for body
      connectTimeout: 60000,  // 1 minute connect timeout
    }),
  });
};

const ollama = new Ollama({
  host: process.env.OLLAMA_CLOUD_URL,
  headers: {
    Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
  },
  fetch: customFetch,
});

module.exports = ollama;
