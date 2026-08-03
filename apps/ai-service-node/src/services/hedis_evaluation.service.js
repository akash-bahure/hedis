const { executeOllamaJob } = require("../queues/ollama.queue");
const { buildBulkHEDISEvaluationPrompt } = require("../prompts/hedis_evaluation.prompt");

class HEDISEvaluationService {
  /**
   * Evaluate a list of measures against chart text using strictly sequential evaluation.
   */
  async evaluateMeasures(chartText, measures) {
    const allEvaluations = [];

    // Process STRICTLY one-by-one to avoid 429 Too Many Requests
    for (const measure of measures) {
      console.log(`Evaluating HEDIS measure: ${measure.measureCode}...`);

      try {
        const prompt = buildBulkHEDISEvaluationPrompt(chartText, [measure]);

        const response = await executeOllamaJob("eval", {
          model: "gemma4:31b-cloud",
          messages: [{ role: "user", content: prompt }],
          format: "json",
        });

        let raw = response.message.content.trim();
        
        // Robust JSON extraction: Find content between first { and last }
        const firstBrace = raw.indexOf('{');
        const lastBrace = raw.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          raw = raw.substring(firstBrace, lastBrace + 1);
        } else {
          // If no braces, fall back to regex removal or just try parsing
          raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }

        const parsed = JSON.parse(raw);
        
        // Handle both wrapped evaluations array and flat object
        if (parsed.evaluations && Array.isArray(parsed.evaluations)) {
          allEvaluations.push(...parsed.evaluations);
        } else if (parsed.measureCode) {
          allEvaluations.push(parsed);
        }
      } catch (err) {
        console.error(`Error evaluating measure ${measure.measureCode}:`, err);
        allEvaluations.push({
            measureCode: measure.measureCode,
            measureName: measure.measureName,
            status: "Error",
            reason: "AI evaluation failed for this measure"
        });
      }
    }

    return allEvaluations;
  }
}

module.exports = new HEDISEvaluationService();
