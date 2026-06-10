const fs = require("fs");
const path = require("path");

const { fromPath } = require("pdf2pic");

const ollama = require("../config/ollama");

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
  const imageBase64 = fs.readFileSync(imagePath).toString("base64");

  console.log(
    "Image MB:",
    (fs.statSync(imagePath).size / 1024 / 1024).toFixed(2)
  );

  const response = await ollama.chat({
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

  return response.message.content;
}

async function extractPdfText(pdfPath) {
  const imagePaths = await pdfToImages(pdfPath);

  console.log(`Generated ${imagePaths.length} pages`);

  let combinedText = "";

  for (const imagePath of imagePaths) {
    console.log(`OCR: ${imagePath}`);

    const pageText = await ocrImage(imagePath);

    combinedText += `\n===== PAGE =====\n\n${pageText}\n\n`;
  }

  return combinedText;
}

module.exports = {
  extractPdfText,
};
