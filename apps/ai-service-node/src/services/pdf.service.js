const fs = require("fs");
const path = require("path");

const { fromPath } = require("pdf2pic");

const { executeOllamaJob } = require("../queues/ollama.queue");

const OUTPUT_DIR = path.join(process.cwd(), "tmp-pages");

async function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

async function pdfToImages(pdfPath) {
  await ensureOutputDir();

  const converter = fromPath(pdfPath, {
    saveFilename: "page",
    savePath: OUTPUT_DIR,
    density: 150,
    width: 1200,
    height: 1700,
    format: "jpeg",
    quality: 85,
  });

  const imagePaths = [];

  let page = 1;

  while (true) {
    try {
      const result = await converter(page);

      if (!result?.path) break;

      imagePaths.push(result.path);

      page++;
    } catch {
      break;
    }
  }

  return imagePaths;
}

async function ocrImage(imagePath) {
  try {
    const imageBase64 = fs.readFileSync(imagePath).toString("base64");

    console.log(
      "Image MB:",
      (fs.statSync(imagePath).size / 1024 / 1024).toFixed(2)
    );

    console.log("[AI] Using Host:", process.env.OLLAMA_CLOUD_URL);
    console.log("[AI] Using Model:", "gemma4:31b-cloud");
    console.log("[AI] Submitting OCR Job to Queue...");
    console.log("[AI] Image Path:", imagePath);

    const response = await executeOllamaJob("ocr", {
      model: "gemma4:31b-cloud",
      messages: [
        {
          role: "user",
          content: `You are a medical OCR system.

Extract every visible word.

Requirements:
- Preserve all dates.
- Preserve provider names.
- Preserve diagnoses.
- Preserve medications.
- Preserve lab values.
- Preserve procedure names.
- Preserve HEDIS-related evidence.
- Preserve table rows.

Do not summarize.
Do not infer.
Do not explain.

Return plain text only.`,
          images: [imageBase64],
        },
      ],
    });

    console.log("[AI] OCR Response Received from Queue");

    return response.message.content;
  } catch (error) {
    console.error("[AI OCR ERROR]");
    console.error(error);

    throw error;
  }
}

async function extractPdfText(pdfPath) {
  const imagePaths = await pdfToImages(pdfPath);

  console.log(`[AI] Extraction Started`);
  console.log(`[AI] Total Pages: ${imagePaths.length}`);

  let combinedText = "";

  for (const imagePath of imagePaths) {
    console.log(`OCR: ${imagePath}`);

    const pageText = await ocrImage(imagePath);

    combinedText += `\n===== PAGE =====\n\n${pageText}\n\n`;
  }

  console.log(`[AI] Raw Text Length: ${combinedText.length}`);
  console.log(`[AI] Extraction Completed`);

  return combinedText;
}

module.exports = {
  extractPdfText,
};
