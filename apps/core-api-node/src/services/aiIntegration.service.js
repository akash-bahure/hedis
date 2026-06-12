const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * Forward uploaded chart to AI service
 * @param {string} patientId 
 * @param {Object} file - multer file object
 */
async function forwardChartToAiService(patientId, file) {
  try {
    const form = new FormData();
    form.append("patient_id", patientId);
    
    // Read the file stream
    const fileStream = fs.createReadStream(file.path);
    form.append("file", fileStream, file.originalname);

    const response = await axios.post(`${AI_SERVICE_URL}/api/upload/chart`, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    return response.data;
  } catch (error) {
    console.error("AI Service Upload Error:", error.message);
    if (error.response) {
      throw new Error(`AI Service Error: ${error.response.data.error || error.response.statusText}`);
    }
    throw error;
  }
}

module.exports = {
  forwardChartToAiService,
};
