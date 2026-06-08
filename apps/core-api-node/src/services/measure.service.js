const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../data/measureLibrary.json");

// Load measures safely
const loadMeasures = () => {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return [];
    }
    const rawData = fs.readFileSync(DATA_PATH, "utf8");
    const parsed = JSON.parse(rawData);
    return parsed.measures || [];
  } catch (error) {
    console.error("Error loading measures from json:", error);
    return [];
  }
};

// Filter measures
const getFilteredMeasures = (filters) => {
  const measures = loadMeasures();
  const { measureYear, productLine, category, search, status } = filters;

  return measures.filter((m) => {
    // Filter by measurement year
    // Note: Since the JSON might not have measurementYear top-level, we can check if it matches in the text or default to true
    if (measureYear) {
      const yearStr = measureYear.toLowerCase();
      // Look for year references in ageCriteria, continuousEnrollment or just mock/assume MY2025
      const matchesYear =
        (m.measurementYear && m.measurementYear.toLowerCase().includes(yearStr)) ||
        (m.eligibility?.ageCriteria?.ageCalculationDate &&
          m.eligibility.ageCriteria.ageCalculationDate.toLowerCase().includes(yearStr)) ||
        (m.eligibility?.continuousEnrollment?.enrollmentRule &&
          m.eligibility.continuousEnrollment.enrollmentRule.toLowerCase().includes(yearStr)) ||
        yearStr === "my2025" || // fallback for default screen year
        yearStr === "2025";
      if (!matchesYear) return false;
    }

    // Filter by product line
    if (productLine) {
      const lineStr = productLine.toLowerCase();
      let hasProductLine = false;
      if (m.productLines) {
        for (let i = 0; i < m.productLines.length; i++) {
          if (m.productLines[i].toLowerCase().includes(lineStr)) {
            hasProductLine = true;
            break;
          }
        }
      }
      if (!hasProductLine) return false;
    }

    // Filter by category
    if (category) {
      const catStr = category.toLowerCase();
      if (!m.category || !m.category.toLowerCase().includes(catStr)) {
        return false;
      }
    }

    // Filter by status (active vs inactive)
    if (status) {
      const statusStr = status.toLowerCase();
      const isActive = m.active === true;
      if (statusStr === "active" && !isActive) return false;
      if (statusStr === "inactive" && isActive) return false;
      if (statusStr === "retired" && isActive) return false; // Retired is inactive
    }

    // Filter by search text
    if (search) {
      const searchStr = search.toLowerCase();
      const matchSearch =
        m.measureCode?.toLowerCase().includes(searchStr) ||
        m.measureName?.toLowerCase().includes(searchStr) ||
        m.description?.toLowerCase().includes(searchStr) ||
        m.category?.toLowerCase().includes(searchStr);
      if (!matchSearch) return false;
    }

    return true;
  });
};

// Find single measure
const getMeasureByIdOrCode = (measureId) => {
  const measures = loadMeasures();
  const idStr = String(measureId).toLowerCase();

  return measures.find(
    (m) =>
      String(m.id) === idStr ||
      m.measureCode?.toLowerCase() === idStr
  );
};

// Extract Code Sets
const extractCodeSets = (measure) => {
  const codes = [];
  
  if (measure.denominator?.requiredDiagnoses) {
    measure.denominator.requiredDiagnoses.forEach((c) => {
      codes.push({
        code: c.code,
        system: c.codeSystem || "ICD-10-CM",
        description: c.description,
        type: "Denominator Rule",
      });
    });
  }

  if (measure.numerator?.codes) {
    measure.numerator.codes.forEach((c) => {
      codes.push({
        code: c.code,
        system: c.codeSystem || "CPT",
        description: c.description,
        type: "Numerator Compliance",
      });
    });
  }

  if (measure.exclusions) {
    measure.exclusions.forEach((ex) => {
      if (ex.code) {
        codes.push({
          code: ex.code,
          system: ex.codeSystem || "ICD-10-CM",
          description: ex.description,
          type: `Exclusion (${ex.reason || "General"})`,
        });
      }
      if (ex.codes) {
        ex.codes.forEach((c) => {
          codes.push({
            code: c.code,
            system: c.codeSystem || c.system || "ICD-10-CM",
            description: c.description,
            type: `Exclusion (${ex.category || ex.reason || "General"})`,
          });
        });
      }
    });
  }

  return codes;
};

// Enrich single measure specs
const enrichMeasure = (measure) => {
  if (!measure) return null;

  return {
    measureMetadata: {
      id: measure.id,
      measureCode: measure.measureCode,
      measureName: measure.measureName,
      description: measure.description,
      category: measure.category,
      measureType: measure.measureType,
      active: measure.active,
    },
    eligibilityRules: measure.eligibility || {},
    denominator: measure.denominator || {},
    numerator: measure.numerator || {},
    exclusions: measure.exclusions || [],
    documentation: measure.documentation || {},
    productLines: measure.productLines || [],
    versionInformation: {
      version: measure.version || "2025.0.1",
      measurementYear: measure.measurementYear || "MY2025",
      lastUpdated: measure.lastUpdated || "Jan 1, 2025",
      source: measure.source || "NCQA HEDIS MY2025 Technical Specifications",
    },
    clinicalRules: {
      intent: measure.description,
      complianceThresholds: measure.numerator?.complianceThresholds || "Documented compliance per specifications",
    },
    codeSets: extractCodeSets(measure),
  };
};

// Convert specs list to CSV
const generateCSV = (measures) => {
  const headers = [
    "ID",
    "Measure Code",
    "Measure Name",
    "Description",
    "Category",
    "Type",
    "Status",
    "Product Lines",
    "Min Age",
    "Max Age",
    "Enrollment Rule",
    "Exclusions Count",
  ];

  const rows = measures.map((m) => {
    const minAge = m.eligibility?.ageCriteria?.minAge ?? "N/A";
    const maxAge = m.eligibility?.ageCriteria?.maxAge ?? "N/A";
    const enrollment = m.eligibility?.continuousEnrollment?.enrollmentRule ?? "N/A";
    const exclusionsCount = m.exclusions?.length ?? 0;

    return [
      m.id,
      m.measureCode,
      m.measureName,
      m.description,
      m.category,
      m.measureType,
      m.active ? "Active" : "Inactive",
      m.productLines?.join("; ") || "",
      minAge,
      maxAge,
      enrollment,
      exclusionsCount,
    ];
  });

  return [headers, ...rows]
    .map((row) => row.map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
};

// Convert a single measure specs to CSV
const generateSingleMeasureCSV = (enriched) => {
  const sections = [];

  // Metadata Section
  sections.push("--- MEASURE METADATA ---");
  sections.push("Key,Value");
  Object.entries(enriched.measureMetadata).forEach(([key, val]) => {
    sections.push(`"${key}","${String(val).replace(/"/g, '""')}"`);
  });
  sections.push("");

  // Product Lines
  sections.push("--- PRODUCT LINES ---");
  sections.push(enriched.productLines.map(pl => `"${pl}"`).join("\n"));
  sections.push("");

  // Eligibility Section
  sections.push("--- ELIGIBILITY RULES ---");
  sections.push("Age Min,Age Max,Calculation Date,Enrollment Rule,Max Gap,Gender Rules");
  const age = enriched.eligibilityRules.ageCriteria || {};
  const enroll = enriched.eligibilityRules.continuousEnrollment || {};
  const gender = enriched.eligibilityRules.genderRules?.join("; ") || "All";
  sections.push(`"${age.minAge ?? ""}","${age.maxAge ?? ""}","${age.ageCalculationDate ?? ""}","${enroll.enrollmentRule ?? ""}","${enroll.maximumGapAllowed ?? ""}","${gender}"`);
  sections.push("");

  // Code Sets Section
  sections.push("--- CODE SETS ---");
  sections.push("Code,System,Description,Type");
  enriched.codeSets.forEach((c) => {
    sections.push(`"${c.code}","${c.system}","${c.description.replace(/"/g, '""')}","${c.type}"`);
  });

  return sections.join("\n");
};

module.exports = {
  getFilteredMeasures,
  getMeasureByIdOrCode,
  enrichMeasure,
  generateCSV,
  generateSingleMeasureCSV,
};
