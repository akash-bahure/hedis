/**
 * Database Schema Context Provider for Text-to-SQL
 *
 * Contains detailed definitions of tables, columns, data types, primary keys,
 * and foreign key relationships
 *
 * Provides dynamic schema filtering so that only relevant table DDLs
 * are sent in the LLM prompt based on the user's natural language question.
 */

const DATABASE_SCHEMA_DICTIONARY = {
  clients: {
    description: "HEDIS clients/organizations contracts and tier details",
    ddl: `TABLE clients (
  id UUID PRIMARY KEY, -- Internal UUID
  client_id VARCHAR(20) UNIQUE NOT NULL, -- Client Display ID
  org_name VARCHAR(200) NOT NULL UNIQUE,
  short_code VARCHAR(50) NOT NULL UNIQUE,
  region VARCHAR(50) CHECK (region IN ('West', 'South', 'Northeast', 'Southeast', 'Midwest', 'Mountain')),
  plan_tier VARCHAR(50) CHECK (plan_tier IN ('Basic', 'Professional', 'Enterprise')),
  status VARCHAR(50) CHECK (status IN ('Active', 'Inactive', 'Onboarding', 'At Risk')),
  contract_type VARCHAR(100) CHECK (contract_type IN ('HEDIS Hybrid', 'HEDIS Administrative', 'HEDIS Electronic', 'Multi-Measure')),
  measure_year VARCHAR(50) CHECK (measure_year IN ('MY2024', 'MY2025', 'MY2026', 'MY2027')),
  total_charts INTEGER NOT NULL,
  completed_charts INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  primary_contact_name VARCHAR(150),
  email VARCHAR(150),
  phone VARCHAR(20),
  abstractors_assigned INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);`,
    keywords: [
      "client",
      "clients",
      "organization",
      "org",
      "plan_tier",
      "contract",
      "region",
      "short_code",
    ],
  },

  projects: {
    description: "HEDIS projects linked to clients",
    ddl: `TABLE projects (
  id UUID PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  project_id VARCHAR(50) UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  project_type VARCHAR(100) CHECK (project_type IN ('Inpatient', 'Outpatient', 'ED Visit', 'HCC')),
  specialty VARCHAR(100) CHECK (specialty IN ('Multi-Speciality', 'Cardiology', 'Orthopedics', 'Emergency Med.', 'Radiology', 'Oncology', 'Cardiothoracic', 'Pediatrics', 'Neurology', 'Gastroenterology')),
  priority VARCHAR(50) CHECK (priority IN ('High', 'Medium', 'Low')),
  notes TEXT,
  status VARCHAR(50) CHECK (status IN ('Active', 'Completed', 'At Risk', 'On Hold', 'Draft')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  project_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  total_charts INTEGER DEFAULT 0,
  completed_charts INTEGER DEFAULT 0,
  pending_charts INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);`,
    keywords: [
      "project",
      "projects",
      "specialty",
      "project_manager",
      "pending_charts",
      "completed_charts",
    ],
  },

  user_roles: {
    description: "User security roles in the platform",
    ddl: `TABLE user_roles (
  id UUID PRIMARY KEY,
  name VARCHAR(150) NOT NULL, -- e.g. Admin, Operations/Program Manager, Chart Abstractor, Quality Analyst
  description TEXT,
  level INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);`,
    keywords: ["role", "roles", "user_role", "permission"],
  },

  departments: {
    description: "Organizational departments",
    ddl: `TABLE departments (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);`,
    keywords: ["department", "departments"],
  },

  users: {
    description: "System users (abstractors, QAs, program managers, admins)",
    ddl: `TABLE users (
  id UUID PRIMARY KEY,
  full_name VARCHAR(255),
  credentials VARCHAR(255),
  email VARCHAR(254) UNIQUE NOT NULL,
  phone VARCHAR(20),
  mobile_phone VARCHAR(20),
  department_id UUID REFERENCES departments(id),
  job_title VARCHAR(150),
  address_line_1 TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  location VARCHAR(255),
  user_role_id UUID REFERENCES user_roles(id),
  shift VARCHAR(20), -- Morning, Afternoon, Night, General, Off
  user_type VARCHAR(20), -- Local, Azure
  user_status VARCHAR(20) DEFAULT 'Active', -- Pending, Active, Inactive, Suspended
  last_login TIMESTAMP,
  is_superuser BOOLEAN DEFAULT FALSE,
  is_staff BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  employee_id VARCHAR(100) UNIQUE,
  member_since DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);`,
    keywords: [
      "user",
      "users",
      "staff",
      "abstractor",
      "employee",
      "manager",
      "qa",
      "job_title",
      "shift",
    ],
  },

  patients: {
    description: "Patient Demographics and HEDIS workflow tracking",
    ddl: `TABLE patients (
  id UUID PRIMARY KEY,
  patient_id VARCHAR(50) UNIQUE NOT NULL, -- Display patient ID (e.g. PAT-1001)
  external_patient_id UUID UNIQUE,
  first_name VARCHAR(150),
  last_name VARCHAR(150),
  dob DATE,
  gender VARCHAR(20),
  measure VARCHAR(100),
  plan VARCHAR(100),
  priority VARCHAR(50),
  stage VARCHAR(50) DEFAULT 'Unassigned', -- e.g. Unassigned, In Progress, Abstracted, Pending QA, QA Passed, QA Failed, Revision Required, Audit Approved, Audit Fail, Request Rework
  due_date TIMESTAMP,
  qa_reviewed BOOLEAN DEFAULT FALSE,
  audit_reviewed BOOLEAN DEFAULT FALSE,
  project_id UUID REFERENCES projects(id),
  client_id UUID REFERENCES clients(id),
  assigned_to UUID REFERENCES users(id),
  abstractor_id UUID REFERENCES users(id),
  qa_id UUID REFERENCES users(id),
  last_updated_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);`,
    keywords: [
      "patient",
      "patients",
      "gender",
      "dob",
      "stage",
      "plan",
      "assigned_to",
      "priority",
      "qa_reviewed",
    ],
  },

  patient_charts: {
    description: "Medical records and encounter charts for patients",
    ddl: `TABLE patient_charts (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  external_chart_id UUID UNIQUE,
  chart_id VARCHAR(100), -- Display chart ID (e.g. CHT-78421)
  status VARCHAR(100),
  encounter_type VARCHAR(100),
  specialty VARCHAR(100),
  facility VARCHAR(255),
  encounter_date DATE,
  admission_date DATE,
  discharge_date DATE,
  priority VARCHAR(50),
  chart_document JSONB,
  coding_notes TEXT,
  sla_deadline TIMESTAMP,
  abstraction_status VARCHAR(100) DEFAULT 'Pending',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);`,
    keywords: [
      "chart",
      "charts",
      "patient_chart",
      "patient_charts",
      "encounter",
      "facility",
      "encounter_date",
      "admission_date",
      "discharge_date",
    ],
  },

  manual_chart_abstractions: {
    description: "Manual clinical chart abstractions submitted by abstractors",
    ddl: `TABLE manual_chart_abstractions (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  patient_chart_id UUID NOT NULL REFERENCES patient_charts(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  assigned_qa UUID REFERENCES users(id),
  service_date DATE,
  screening_type VARCHAR(255),
  evidence_type VARCHAR(255), -- Office Visit BP Reading, Specialist Consult BP Reading, etc.
  systolic INTEGER,
  diastolic INTEGER,
  cpt_code VARCHAR(50),
  icd_10_code VARCHAR(50),
  source_type VARCHAR(255),
  evidence_source TEXT,
  notes TEXT,
  abstraction_status VARCHAR(100) DEFAULT 'Pending QA',
  qa_status VARCHAR(100) DEFAULT 'Pending',
  submitted_to_qa_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);`,
    keywords: [
      "manual_chart_abstraction",
      "abstraction",
      "abstractions",
      "systolic",
      "diastolic",
      "cpt_code",
      "icd_10_code",
      "evidence_type",
    ],
  },

  chart_assignments: {
    description: "Assignments of charts to abstractors and QA analysts",
    ddl: `TABLE chart_assignments (
  id UUID PRIMARY KEY,
  patient_chart_id UUID NOT NULL REFERENCES patient_charts(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_role VARCHAR(100) CHECK (assigned_role IN ('Chart Abstractor', 'Quality Analyst')),
  priority VARCHAR(50) CHECK (priority IN ('Urgent', 'High', 'Medium', 'Low')),
  assignment_note TEXT,
  assignment_status VARCHAR(100) CHECK (assignment_status IN ('Assigned', 'In Progress', 'Completed', 'Rejected')),
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);`,
    keywords: [
      "assignment",
      "assignments",
      "chart_assignments",
      "assigned_role",
      "assignment_status",
    ],
  },

  measures: {
    description: "HEDIS Measure Library definitions",
    ddl: `TABLE measures (
  id SERIAL PRIMARY KEY,
  measure_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. CBP, HBA1C, BCS, COL, W30
  measure_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  measure_type VARCHAR(100),
  measurement_year VARCHAR(50),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);`,
    keywords: [
      "measure",
      "measures",
      "measure_code",
      "measure_name",
      "category",
      "measurement_year",
    ],
  },

  hedis_evaluations: {
    description: "HEDIS evaluation results per patient and measure",
    ddl: `TABLE hedis_evaluations (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  measure_code TEXT NOT NULL,
  measure_name TEXT,
  eligible BOOLEAN,
  denominator BOOLEAN,
  numerator BOOLEAN,
  exclusion BOOLEAN,
  status TEXT, -- Compliant, Non-Compliant, Exclusion, Pending, Complete, Gap, Not Eligible 
  confidence FLOAT,
  reasoning TEXT,
  stage TEXT,
  reason TEXT,
  created_at TIMESTAMP
);`,
    keywords: [
      "evaluation",
      "evaluations",
      "hedis_evaluations",
      "eligible",
      "denominator",
      "numerator",
      "exclusion",
      "compliance",
      "compliant",
      "confidence",
    ],
  },

  clinical_timeline_events: {
    description: "Patient clinical timeline events extracted from charts",
    ddl: `TABLE clinical_timeline_events (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  chart_id UUID REFERENCES patient_charts(id) ON DELETE CASCADE,
  event_date DATE,
  event_type TEXT,
  event_title TEXT,
  provider TEXT,
  evidence TEXT,
  source_type TEXT CHECK (source_type IN ('AI', 'MANUAL', 'EMR', 'EHR')),
  review_status TEXT CHECK (review_status IN ('PASS', 'FAIL', 'DISCREPANCY', 'PENDING', 'NO_STATUS', 'REVIEW_REQUIRED', 'ACCEPTED', 'REJECTED', 'EDITED')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  summary TEXT,
  ai_confidence DECIMAL,
  created_at TIMESTAMP
);`,
    keywords: [
      "timeline",
      "clinical_timeline",
      "timeline_event",
      "event_title",
      "provider",
      "review_status",
    ],
  },

  audit_logs: {
    description: "System security and administrative audit event log",
    ddl: `TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  user_name TEXT,
  event_type VARCHAR(100),
  details TEXT,
  ip_address VARCHAR(45),
  device TEXT,
  location TEXT,
  risk_level VARCHAR(20), -- 'Low', 'Medium', 'High', 'Critical'
  status VARCHAR(20),     -- 'Success', 'Failed', 'Warning'
  created_at TIMESTAMP
);`,
    keywords: [
      "audit",
      "audit_log",
      "audit_logs",
      "risk_level",
      "event_type",
      "ip_address",
    ],
  },

  phi_access_logs: {
    description: "PHI data access compliance logs for HIPAA auditing",
    ddl: `TABLE phi_access_logs (
  id UUID PRIMARY KEY,
  chart_id VARCHAR(50) NOT NULL,
  patient_name VARCHAR(150) NOT NULL,
  accessed_by VARCHAR(150) NOT NULL,
  role VARCHAR(100) NOT NULL,
  access_type VARCHAR(50) CHECK (access_type IN ('code', 'audit', 'view', 'export', 'edit')),
  timestamp TIMESTAMP,
  duration VARCHAR(50),
  ip_address VARCHAR(45),
  project_name VARCHAR(150),
  created_at TIMESTAMP
);`,
    keywords: [
      "phi",
      "phi_access",
      "access_log",
      "access_logs",
      "accessed_by",
      "access_type",
    ],
  },

  hedis_qa_measure_decisions: {
    description: "QA review decisions for individual patient measures",
    ddl: `TABLE hedis_qa_measure_decisions (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  chart_id UUID REFERENCES patient_charts(id) ON DELETE SET NULL,
  measure_id UUID REFERENCES hedis_evaluations(id) ON DELETE SET NULL,
  measure_code VARCHAR(50),
  measure_name TEXT,
  qa_status VARCHAR(50), -- QA_PASS, REQUEST_REVISION, QA_FAIL
  assigned_abstractor_id UUID REFERENCES users(id),
  abstractor_id UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);`,
    keywords: ["qa_decision", "qa_decisions", "qa_status", "qa_review"],
  },

  hedis_measure_evidence: {
    description: "Detailed evidence submitted for HEDIS measures",
    ddl: `TABLE hedis_measure_evidence (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  chart_id UUID NOT NULL REFERENCES patient_charts(id) ON DELETE CASCADE,
  measure_id UUID REFERENCES hedis_evaluations(id) ON DELETE SET NULL,
  service_date DATE,
  screening_type TEXT,
  evidence_type TEXT,
  reading TEXT,
  cpt_code TEXT,
  icd10_code TEXT,
  evidence_source TEXT,
  notes TEXT,
  is_draft BOOLEAN DEFAULT FALSE,
  not_found BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP
);`,
    keywords: [
      "hedis_evidence",
      "evidence",
      "reading",
      "cpt_code",
      "icd10_code",
      "is_draft",
      "not_found",
    ],
  },
};

// Core default tables to always include for broad queries if no explicit match
const DEFAULT_TABLE_KEYS = [
  "patients",
  "patient_charts",
  "projects",
  "clients",
  "hedis_evaluations",
  "users",
];

/**
 * Generates schema DDL context formatted for the Text-to-SQL prompt based on the question.
 *
 * @param {string} question - Natural language user prompt
 * @returns {string} - Formatted schema context string
 */
// ──────────────────────────────────────────────────────────────
// Dynamic Column Parser & Schema Extension
// ──────────────────────────────────────────────────────────────

// Pre-process dictionary to extract column names and merge with keywords
for (const [tableKey, tableMeta] of Object.entries(DATABASE_SCHEMA_DICTIONARY)) {
  const ddlLines = tableMeta.ddl.split("\n");
  const extractedColumns = [];
  for (const line of ddlLines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("TABLE") || trimmed.startsWith(");") || trimmed.startsWith("--")) {
      continue;
    }
    // Match first word as column name
    const match = trimmed.match(/^([a-zA-Z0-9_]+)\b/);
    if (match) {
      const colName = match[1].toLowerCase();
      const ignoredKeyords = ["table", "constraint", "primary", "foreign", "unique", "check", "references", "default", "on", "index"];
      if (!ignoredKeyords.includes(colName)) {
        extractedColumns.push(colName);
      }
    }
  }
  tableMeta.columns = extractedColumns;
  // Create a combined list of searchable words/keywords
  tableMeta.allKeywords = [...new Set([
    ...tableMeta.keywords.map(k => k.toLowerCase()),
    ...extractedColumns,
    tableKey.toLowerCase()
  ])];
}

// Map foreign key relations for automatic inclusion
const RELATIONSHIP_MAP = {
  patients: ["projects", "clients"],
  patient_charts: ["patients"],
  manual_chart_abstractions: ["patients", "patient_charts", "users"],
  chart_assignments: ["patient_charts", "users"],
  hedis_evaluations: ["patients", "measures"],
  clinical_timeline_events: ["patients", "patient_charts"],
  projects: ["clients", "users"],
  users: ["departments", "user_roles"],
  hedis_qa_measure_decisions: ["patients", "patient_charts", "hedis_evaluations"],
  hedis_measure_evidence: ["patients", "patient_charts", "hedis_evaluations", "users"],
};

/**
 * Generates schema DDL context formatted for the Text-to-SQL prompt based on the question.
 * Uses smart keyword matching on tables, columns, and relationship maps.
 *
 * @param {string} question - Natural language user prompt
 * @returns {string} - Formatted schema context string
 */
function getRelevantSchema(question) {
  if (!question || typeof question !== "string") {
    return getDefaultSchemaContext();
  }

  const normalizedQuestion = question.toLowerCase();
  const matchedKeys = new Set();

  // 1. Match tables using direct keywords, table names, and column names
  for (const [tableKey, tableMeta] of Object.entries(DATABASE_SCHEMA_DICTIONARY)) {
    // Check if the user question contains any table/column keyword
    for (const keyword of tableMeta.allKeywords) {
      if (normalizedQuestion.includes(keyword)) {
        matchedKeys.add(tableKey);
        break;
      }
    }
  }

  // 2. Expand relationships recursively to ensure JOINs have all required tables
  const keysToProcess = Array.from(matchedKeys);
  const visited = new Set();
  
  while (keysToProcess.length > 0) {
    const key = keysToProcess.shift();
    if (visited.has(key)) continue;
    visited.add(key);
    matchedKeys.add(key);

    const related = RELATIONSHIP_MAP[key];
    if (related) {
      for (const relKey of related) {
        if (!matchedKeys.has(relKey)) {
          matchedKeys.add(relKey);
          keysToProcess.push(relKey);
        }
      }
    }
  }

  // 3. Fallback to default core tables if nothing matches
  if (matchedKeys.size === 0) {
    DEFAULT_TABLE_KEYS.forEach((key) => matchedKeys.add(key));
  }

  const schemaBlocks = Array.from(matchedKeys)
    .filter((key) => DATABASE_SCHEMA_DICTIONARY[key])
    .map((key) => {
      const meta = DATABASE_SCHEMA_DICTIONARY[key];
      return `-- ${meta.description}\n${meta.ddl}`;
    });

  return schemaBlocks.join("\n\n");
}

/**
 * Fallback providing core schema tables.
 */
function getDefaultSchemaContext() {
  return DEFAULT_TABLE_KEYS.map((key) => {
    const meta = DATABASE_SCHEMA_DICTIONARY[key];
    return `-- ${meta.description}\n${meta.ddl}`;
  }).join("\n\n");
}

/**
 * Returns all available table names and metadata overview.
 */
function getAllSchemaOverview() {
  return Object.entries(DATABASE_SCHEMA_DICTIONARY).map(([table, meta]) => ({
    tableName: table,
    description: meta.description,
    keywords: meta.keywords,
    columns: meta.columns || [],
  }));
}

module.exports = {
  getRelevantSchema,
  getDefaultSchemaContext,
  getAllSchemaOverview,
  DATABASE_SCHEMA_DICTIONARY,
};

