const { buildHEDISCriteriaPrompt } = require("../prompts/hedis.prompt");
const ollama = require("../config/ollama");

/**
 * Service for HEDIS Engine logic.
 */
class HEDISService {
  /**
   * Extract demographics and conditions from text using LLM.
   */
  async extractCriteria(text) {
    const prompt = buildHEDISCriteriaPrompt(text);

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

  /**
   * Fetch measures from core-api-node.
   * We use the tenant subdomain to route the request to the correct tenant schema in core-api.
   */
  async fetchMeasures(subdomain) {
    // If running in Docker, localhost:5000 won't work. 
    // We should use the service name 'core-api' or 'host.docker.internal' if core-api is on host.
    const baseUrl = process.env.CORE_API_URL || "http://host.docker.internal:5000";
    const url = `${baseUrl}/api/measure-library?limit=100`;

    console.log(`Fetching measures from: ${url} with Origin: http://${subdomain}.localhost`);

    const response = await fetch(url, {
      headers: {
        Origin: `http://${subdomain}.localhost`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch measures from ${url}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.data || !Array.isArray(result.data)) {
        throw new Error("Invalid response format from Measure Library API");
    }

    // We need the full rules/eligibility for filtering.
    // Fetching sequentially to avoid potential throughput/concurrency issues.
    const measuresWithRules = [];
    for (const m of result.data) {
        const detailsUrl = `${baseUrl}/api/measure-library/${m.id}`;
        try {
            const detailsRes = await fetch(detailsUrl, {
                headers: {
                    Origin: `http://${subdomain}.localhost`,
                },
            });
            if (detailsRes.ok) {
                const detailsJson = await detailsRes.json();
                measuresWithRules.push(detailsJson.data);
            }
        } catch (err) {
            console.error(`Error fetching rules for measure ${m.id}:`, err);
        }
    }

    return measuresWithRules;
  }

  /**
   * Filter measures based on extracted criteria.
   */
  filterMeasures(measures, criteria) {
    const { age, gender, conditions } = criteria;

    return measures.filter((m) => {
      const eligibility = m.eligibility || {};
      
      // 1. Age Filter
      if (age !== null && eligibility.ageCriteria) {
        const { minAge, maxAge } = eligibility.ageCriteria;
        if (age < minAge || age > maxAge) return false;
      }

      // 2. Gender Filter
      if (gender && eligibility.genderRules && eligibility.genderRules.length > 0) {
        if (!eligibility.genderRules.includes(gender)) return false;
      }

      // 3. Medical Conditions Filter
      // Some measures require specific diagnoses (e.g. CBP requires Hypertension)
      const requiredDiagnoses = m.denominator?.requiredDiagnoses || [];
      if (requiredDiagnoses.length > 0) {
        const hasCondition = requiredDiagnoses.some((req) => {
          const desc = req.description.toLowerCase();
          return conditions.some((c) => c.toLowerCase().includes(desc) || desc.includes(c.toLowerCase()));
        });
        if (!hasCondition) return false;
      }

      return true;
    });
  }
}

module.exports = new HEDISService();
