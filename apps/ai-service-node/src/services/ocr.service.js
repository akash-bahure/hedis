const fs = require("fs");
const path = require("path");
const { pdf } = require("pdf-to-img");
const { executeOllamaJob } = require("../queues/ollama.queue");

class OCRService {
  async extract(pdfPath) {
    const pages = [];

    let pageNo = 1;

    for await (const image of pdf(pdfPath)) {
      const tempPath = path.join(process.cwd(), "tmp", `page-${pageNo}.png`);

      fs.writeFileSync(tempPath, image);

      const result = await this.ocrPage(tempPath, pageNo);

      pages.push(result);

      fs.unlinkSync(tempPath);

      pageNo++;
    }

    return pages;
  }

  async ocrPage(imagePath, pageNo) {
    const response = await executeOllamaJob("ocr-page", {
      model: "medgemma:4b",
      messages: [
        {
          role: "user",
          content: `
You are an expert medical document OCR engine.

Extract:

- Encounter dates
- Provider names
- Diagnoses
- Procedures
- Lab values
- Medications
- Vital signs
- Assessment and Plan
- Progress notes

Do not summarize.
Do not infer.
Return exactly what appears in the chart.
Preserve chronology.
          `,
          images: [imagePath],
        },
      ],
      format: "json",
    });

    const parsed = JSON.parse(response.message.content);

    return {
      page: pageNo,
      text: parsed.text,
    };
  }
}

module.exports = new OCRService();
