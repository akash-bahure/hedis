const ollama = require("../config/ollama");

async function callOllama(prompt) {
  const response = await ollama.chat({
    model: "gemma4:31b-cloud",
    messages: [{ role: "user", content: prompt }],
    format: "json",
  });

  const raw = response.message.content
    .trim()
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "");

  return JSON.parse(raw);
}

module.exports = {
  callOllama,
};
