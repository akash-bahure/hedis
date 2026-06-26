const { buildClinicalTimelinePrompt } = require("../prompts/clinicalTimeline.prompt");
const ollama = require("../config/ollama");

/**
 * Service for Clinical Timeline extraction.
 */
class ClinicalTimelineService {
  /**
   * Extract clinical timeline events from chart text using LLM.
   */
  async extractTimelineEvents(text) {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const prompt = buildClinicalTimelinePrompt(text);

    try {
      const response = await ollama.chat({
        model: "gemma4:31b-cloud",
        messages: [{ role: "user", content: prompt }],
        format: "json",
      });

      const raw = response.message.content
        .trim()
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");

      const timeline = JSON.parse(raw);

      // Basic validation: ensure it's an array
      if (!Array.isArray(timeline)) {
        console.warn("[ClinicalTimelineService] LLM did not return an array, returning empty.");
        return [];
      }

      return timeline;
    } catch (error) {
      console.error("[ClinicalTimelineService] Error during AI extraction:", error);
      throw new Error("Failed to extract clinical timeline events");
    }
  }
}

module.exports = new ClinicalTimelineService();
