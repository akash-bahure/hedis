const { Ollama } = require("ollama");

const ollama = new Ollama({
  host: process.env.OLLAMA_CLOUD_URL,
  headers: {
    Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
  },
});

(async () => {
  try {
    console.log("Testing Ollama Connection...");

    const response = await ollama.chat({
      model: "gemma4:31b-cloud",
      messages: [
        {
          role: "user",
          content: "Hello",
        },
      ],
    });

    console.log("SUCCESS:");
    console.log(response);
  } catch (err) {
    console.error("FAILED:");
    console.error(err);
  }
})();