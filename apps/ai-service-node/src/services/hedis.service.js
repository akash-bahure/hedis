const { buildHEDISCriteriaPrompt } = require("../prompts/hedis.prompt");
const { executeOllamaJob } = require("../queues/ollama.queue");

/**
 * Service for HEDIS Engine logic.
 */
class HEDISService {
  /**
   * Extract demographics and conditions from text using LLM.
   */
  async extractCriteria(text) {
    const prompt = buildHEDISCriteriaPrompt(text);

    const response = await executeOllamaJob("criteria", {
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
    const baseUrl =
      process.env.CORE_API_URL || "http://host.docker.internal:5000";
    const url = `${baseUrl}/api/measure-library?limit=100`;

    console.log(
      `Fetching measures from: ${url} with Origin: http://${subdomain}.localhost`
    );

    const response = await fetch(url, {
      headers: {
        Origin: `http://${subdomain}.localhost`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch measures from ${url}: ${response.statusText}`
      );
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
  filterMeasures(measures = [], criteria = {}) {
    const age = typeof criteria?.age === "number" ? criteria.age : null;

    const gender =
      typeof criteria?.gender === "string"
        ? criteria.gender.trim().toLowerCase()
        : null;

    const conditions = Array.isArray(criteria?.conditions)
      ? criteria.conditions
          .filter(Boolean)
          .map((c) => (typeof c === "string" ? c.toLowerCase() : ""))
          .filter(Boolean)
      : [];

    return (measures || []).filter((m) => {
      try {
        const eligibility = m?.eligibility || {};

        // AGE FILTER
        if (age !== null && eligibility?.ageCriteria) {
          const minAge =
            typeof eligibility.ageCriteria.minAge === "number"
              ? eligibility.ageCriteria.minAge
              : 0;

          const maxAge =
            typeof eligibility.ageCriteria.maxAge === "number"
              ? eligibility.ageCriteria.maxAge
              : 999;

          if (age < minAge || age > maxAge) {
            return false;
          }
        }

        // GENDER FILTER
        const genderRules = Array.isArray(eligibility?.genderRules)
          ? eligibility.genderRules
          : [];

        if (gender && genderRules.length > 0) {
          const genderMatch = genderRules.some((rule) => {
            if (typeof rule !== "string") return false;

            return rule.toLowerCase().trim() === gender;
          });

          if (!genderMatch) {
            return false;
          }
        }

        // DIAGNOSIS FILTER
        const requiredDiagnoses = Array.isArray(
          m?.denominator?.requiredDiagnoses
        )
          ? m.denominator.requiredDiagnoses
          : [];

        if (requiredDiagnoses.length > 0) {
          const hasCondition = requiredDiagnoses.some((req) => {
            const desc =
              typeof req?.description === "string"
                ? req.description.toLowerCase().trim()
                : "";

            if (!desc) return false;

            return conditions.some(
              (condition) =>
                condition.includes(desc) || desc.includes(condition)
            );
          });

          if (!hasCondition) {
            return false;
          }
        }

        return true;
      } catch (err) {
        console.error(`Error filtering measure ${m?.measure_code}:`, err);

        return false;
      }
    });
  }
}

module.exports = new HEDISService();
