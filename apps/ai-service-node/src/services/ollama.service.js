// const ollama = require("../config/ollama");

// async function callOllama(prompt) {
//   const response = await ollama.chat({
//     model: "gemma4:31b-cloud",
//     messages: [{ role: "user", content: prompt }],
//     format: "json",
//   });

//   const raw = response.message.content
//     .trim()
//     .replace(/^```(?:json)?\n?/, "")
//     .replace(/\n?```$/, "");

//   return JSON.parse(raw);
// }

// module.exports = {
//   callOllama,
// };
const { executeOllamaJob } = require("../queues/ollama.queue");

async function callOllama(prompt) {
  try {
    console.log("[AI] Submitting Ollama job to queue...");
    console.log("[AI] Host:", process.env.OLLAMA_CLOUD_URL);
    console.log("[AI] Model:", "gemma4:31b-cloud");
    console.log("[AI] Prompt Length:", prompt?.length);

    const response = await executeOllamaJob("chat", {
      model: "gemma4:31b-cloud",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      format: "json",
    });

    console.log("[AI] Response Received from Queue");

    const raw = response.message.content
      .trim()
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "");

    console.log("[AI] Raw Response:");
    console.log(raw);

    return JSON.parse(raw);
  } catch (error) {
    console.error("[AI] Ollama Service Error:");
    console.error(error);

    throw error;
  }
}

module.exports = {
  callOllama,
};