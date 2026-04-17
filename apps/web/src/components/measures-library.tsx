import { useState, useMemo } from "react";
import type { ElementType, ReactNode } from "react";
import {
  Search,
  ChevronDown,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Users,
  FileText,
  Download,
  Activity,
  Clock,
  Info,
  AlertTriangle,
  Check,
  Target,
  Hash,
  Microscope,
  Heart,
  Baby,
  Brain,
  Pill,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Star,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type ProductLine = "Commercial" | "Medicaid" | "Medicare";
type MeasureType = "Hybrid" | "Administrative" | "Digital";
type MeasureStatus = "Active" | "Retired" | "Updated";
type MeasureTab =
  | "eligibility"
  | "denominator"
  | "numerator"
  | "exclusions"
  | "documentation";

interface DiagCode {
  code: string;
  system: "ICD-10-CM" | "ICD-10-PCS" | "CPT" | "HCPCS" | "LOINC" | "SNOMED";
  description: string;
  required?: boolean;
}
interface Measure {
  id: string;
  code: string;
  name: string;
  domain: string;
  category: string;
  productLines: ProductLine[];
  measurementYear: string;
  version: string;
  lastUpdated: string;
  source: string;
  type: MeasureType;
  status: MeasureStatus;
  intent: string;
  description: string;
  eligibility: {
    ageMin: number;
    ageMax: number;
    ageNote: string;
    ncqaAgeRef: string;
    enrollment: string;
    enrollmentGap: string;
    ncqaEnrollRef: string;
    gender: string;
    ncqaGenderRef: string;
    ipop: string;
  };
  denominator: {
    definition: string;
    population: string;
    diagnoses: DiagCode[];
    productLineNotes: { line: ProductLine; note: string }[];
  };
  numerator: {
    definition: string;
    services: { name: string; description: string; required: boolean }[];
    codes: (DiagCode & { lookback: string })[];
    dateValidity: string;
    lookbackPeriod: string;
    thresholds: { label: string; value: string; met: string; notMet: string }[];
    notes: string[];
  };
  exclusions: {
    id: string;
    category: string;
    description: string;
    timing: string;
    codes: DiagCode[];
  }[];
  documentation: {
    evidenceTypes: {
      type: string;
      description: string;
      acceptable: boolean;
      priority: "required" | "preferred" | "supplemental";
      notes: string;
    }[];
    fileRequirements: { requirement: string; detail: string }[];
    highlightRequirements: {
      field: string;
      instruction: string;
      reason: string;
    }[];
    commonErrors: string[];
  };
}

/* ─────────────────────────────────────────────────────────────
   MEASURE DATA
───────────────────────────────────────────────────────────── */
const MEASURES: Measure[] = [
  {
    id: "CBP",
    code: "CBP",
    name: "Controlling High Blood Pressure",
    domain: "Effectiveness of Care",
    category: "Cardiovascular",
    productLines: ["Commercial", "Medicaid", "Medicare"],
    measurementYear: "MY2025",
    version: "2025.0.1",
    lastUpdated: "Jan 1, 2025",
    source: "NCQA HEDIS MY2025 Technical Specifications",
    type: "Hybrid",
    status: "Active",
    intent:
      "Identifies members 18–85 years who had a diagnosis of hypertension (HTN) and whose blood pressure (BP) was adequately controlled during the measurement year, based on the following criteria: members 18–59 years whose BP was <140/90 mm Hg; members 60–85 years with a diagnosis of diabetes whose BP was <140/90 mm Hg; members 60–85 years without a diagnosis of diabetes whose BP was <150/90 mm Hg.",
    description:
      "The percentage of members 18–85 years of age who had a diagnosis of hypertension (HTN) and whose blood pressure (BP) was adequately controlled during the measurement year based on defined thresholds.",
    eligibility: {
      ageMin: 18,
      ageMax: 85,
      ageNote: "Age calculated as of December 31 of the measurement year.",
      ncqaAgeRef: "CBP §2.1",
      enrollment:
        "Member must be continuously enrolled for the entire measurement year. For commercial plans, allow up to one gap ≤ 45 days.",
      enrollmentGap: "One gap ≤ 45 days",
      ncqaEnrollRef: "CBP §2.2",
      gender:
        "No gender restriction — applies to all members with HTN diagnosis.",
      ncqaGenderRef: "CBP §2.0",
      ipop: "Members 18–85 years of age as of December 31 of the measurement year, who had a diagnosis of hypertension during the first six months of the measurement year.",
    },
    denominator: {
      definition:
        "All members 18–85 years of age with a diagnosis of hypertension (ICD-10-CM I10–I16) during the first six months (Jan 1–Jun 30) of the measurement year.",
      population:
        "Members must appear in the eligible population AND have at least one outpatient or ambulatory visit with an HTN diagnosis code.",
      diagnoses: [
        {
          code: "I10",
          system: "ICD-10-CM",
          description: "Essential (primary) hypertension",
          required: true,
        },
        {
          code: "I11.0",
          system: "ICD-10-CM",
          description: "Hypertensive heart disease with heart failure",
          required: true,
        },
        {
          code: "I11.9",
          system: "ICD-10-CM",
          description: "Hypertensive heart disease without heart failure",
          required: true,
        },
        {
          code: "I12.9",
          system: "ICD-10-CM",
          description: "Hypertensive chronic kidney disease, stage 1–4",
          required: true,
        },
        {
          code: "I13.10",
          system: "ICD-10-CM",
          description: "Hypertensive heart and CKD without heart failure",
          required: true,
        },
        {
          code: "I15.0",
          system: "ICD-10-CM",
          description: "Renovascular hypertension",
          required: false,
        },
        {
          code: "I15.1",
          system: "ICD-10-CM",
          description: "Hypertension secondary to other renal disorders",
          required: false,
        },
        {
          code: "I16.0",
          system: "ICD-10-CM",
          description: "Hypertensive urgency",
          required: false,
        },
      ],
      productLineNotes: [
        {
          line: "Commercial",
          note: "Apply standard continuous enrollment with one allowable gap ≤ 45 days.",
        },
        {
          line: "Medicaid",
          note: "Apply Medicaid enrollment logic; allow gaps per state Medicaid guidelines.",
        },
        {
          line: "Medicare",
          note: "Medicare Advantage members only. Do not include Part A/B fee-for-service.",
        },
      ],
    },
    numerator: {
      definition:
        "Members whose most recent blood pressure reading during the measurement year is below the applicable threshold: <140/90 mmHg for members 18–59, and for members 60–85 with diabetes; <150/90 mmHg for members 60–85 without diabetes.",
      services: [
        {
          name: "Blood Pressure Recording",
          description:
            "Most recent BP reading on or after Jan 1 of measurement year. Exclude readings taken in emergency settings.",
          required: true,
        },
        {
          name: "Office Visit (Outpatient)",
          description:
            "Visit where BP was recorded must be an outpatient or ambulatory care encounter.",
          required: true,
        },
        {
          name: "Telehealth BP Visit",
          description:
            "Telehealth visits with documented BP recording are acceptable for MY2025 (COVID-era expansion maintained).",
          required: false,
        },
        {
          name: "Remote Patient Monitoring",
          description:
            "RPM BP readings may be used if device is FDA-cleared and transmitted to provider EHR within measurement year.",
          required: false,
        },
      ],
      codes: [
        {
          code: "3074F",
          system: "CPT",
          description: "Most recent systolic BP < 130 mmHg",
          lookback: "MY Jan 1–Dec 31",
          required: true,
        },
        {
          code: "3075F",
          system: "CPT",
          description: "Most recent systolic BP 130–139 mmHg",
          lookback: "MY Jan 1–Dec 31",
          required: true,
        },
        {
          code: "3077F",
          system: "CPT",
          description: "Most recent systolic BP ≥ 160 mmHg",
          lookback: "MY Jan 1–Dec 31",
          required: false,
        },
        {
          code: "3078F",
          system: "CPT",
          description: "Most recent diastolic BP < 80 mmHg",
          lookback: "MY Jan 1–Dec 31",
          required: false,
        },
        {
          code: "3079F",
          system: "CPT",
          description: "Most recent diastolic BP 80–89 mmHg",
          lookback: "MY Jan 1–Dec 31",
          required: false,
        },
        {
          code: "55284-4",
          system: "LOINC",
          description: "Blood pressure panel — systolic + diastolic",
          lookback: "MY Jan 1–Dec 31",
          required: true,
        },
        {
          code: "8480-6",
          system: "LOINC",
          description: "Systolic blood pressure",
          lookback: "MY Jan 1–Dec 31",
          required: true,
        },
        {
          code: "8462-4",
          system: "LOINC",
          description: "Diastolic blood pressure",
          lookback: "MY Jan 1–Dec 31",
          required: true,
        },
      ],
      dateValidity:
        "Blood pressure reading must fall between January 1 and December 31 of the measurement year. The most recent reading is used.",
      lookbackPeriod:
        "Measurement year only (Jan 1–Dec 31, MY2025). No prior year lookback for numerator.",
      thresholds: [
        {
          label: "Ages 18–59 (all)",
          value: "<140/90 mmHg",
          met: "Numerator MET",
          notMet: "Numerator NOT MET",
        },
        {
          label: "Ages 60–85 WITH diabetes",
          value: "<140/90 mmHg",
          met: "Numerator MET",
          notMet: "Numerator NOT MET",
        },
        {
          label: "Ages 60–85 WITHOUT diabetes",
          value: "<150/90 mmHg",
          met: "Numerator MET",
          notMet: "Numerator NOT MET",
        },
      ],
      notes: [
        "Use the MOST RECENT blood pressure reading during the measurement year.",
        "Both systolic AND diastolic must be below the threshold (either value exceeding it = NOT MET).",
        "Do not use BP readings from emergency department encounters.",
        "For members with multiple readings on the same day, use the lowest reading.",
        "Telehealth-documented BP readings require provider attestation in the visit note.",
      ],
    },
    exclusions: [
      {
        id: "exc-esrd",
        category: "ESRD / End-Stage Renal Disease",
        timing: "Anytime during or prior to the measurement year",
        description:
          "Members with a diagnosis of end-stage renal disease (ESRD) or on permanent dialysis are excluded from the denominator.",
        codes: [
          {
            code: "N18.6",
            system: "ICD-10-CM",
            description: "End-stage renal disease",
          },
          {
            code: "Z99.2",
            system: "ICD-10-CM",
            description: "Dependence on renal dialysis",
          },
          {
            code: "90935",
            system: "CPT",
            description: "Hemodialysis procedure, one evaluation",
          },
          {
            code: "90937",
            system: "CPT",
            description: "Hemodialysis procedure requiring repeated evaluation",
          },
          {
            code: "4A1D70Z",
            system: "ICD-10-PCS",
            description:
              "Measurement of kidney function, percutaneous approach",
          },
        ],
      },
      {
        id: "exc-hospice",
        category: "Hospice / Palliative Care",
        timing: "Anytime during the measurement year",
        description:
          "Members enrolled in hospice or receiving palliative care at any point during the measurement year are excluded.",
        codes: [
          {
            code: "Z51.5",
            system: "ICD-10-CM",
            description: "Encounter for palliative care",
          },
          {
            code: "Q5001",
            system: "HCPCS",
            description: "Hospice care provided in patient home",
          },
          {
            code: "Q5010",
            system: "HCPCS",
            description:
              "Hospice care provided in long-term care facility (NF)",
          },
          {
            code: "99377",
            system: "CPT",
            description: "Supervision of hospice patient (physician)",
          },
        ],
      },
      {
        id: "exc-adv-illness",
        category: "Advanced Illness with Frailty",
        timing: "During measurement year — both conditions must be present",
        description:
          "Members 66 years and older who meet criteria for advanced illness AND frailty are excluded. Both criteria must be met within the measurement year.",
        codes: [
          {
            code: "G35",
            system: "ICD-10-CM",
            description: "Multiple sclerosis (advanced illness indicator)",
          },
          {
            code: "G20",
            system: "ICD-10-CM",
            description: "Parkinson's disease",
          },
          {
            code: "F01.50",
            system: "ICD-10-CM",
            description: "Vascular dementia without behavioral disturbance",
          },
          {
            code: "G31.83",
            system: "ICD-10-CM",
            description: "Dementia with Lewy bodies",
          },
          {
            code: "99509",
            system: "CPT",
            description:
              "Home visit for assistance with ADLs (frailty indicator)",
          },
        ],
      },
      {
        id: "exc-pregnancy",
        category: "Pregnancy",
        timing: "During measurement year",
        description:
          "Members who were pregnant during the measurement year are excluded. Applies to all product lines.",
        codes: [
          {
            code: "Z34.00",
            system: "ICD-10-CM",
            description: "Encounter for supervision of normal first pregnancy",
          },
          {
            code: "O10.011",
            system: "ICD-10-CM",
            description:
              "Pre-existing essential hypertension complicating pregnancy (first trimester)",
          },
          {
            code: "O13.1",
            system: "ICD-10-CM",
            description:
              "Gestational HTN without significant proteinuria, first trimester",
          },
        ],
      },
    ],
    documentation: {
      evidenceTypes: [
        {
          type: "Office Visit Note (EHR)",
          description:
            "Typed or scanned EHR note documenting BP reading with date and provider signature.",
          acceptable: true,
          priority: "required",
          notes: "BP reading, visit date, and provider NPI must be visible.",
        },
        {
          type: "Lab Report / Flow Sheet",
          description:
            "Standardized flow sheet or lab report showing serial BP measurements.",
          acceptable: true,
          priority: "preferred",
          notes:
            "Date of each reading must be present. Must be signed or co-signed by provider.",
        },
        {
          type: "Telehealth Visit Note",
          description:
            "EHR note from telehealth visit documenting remote BP measurement.",
          acceptable: true,
          priority: "preferred",
          notes:
            "Provider must attest to accuracy of the remotely-reported measurement.",
        },
        {
          type: "Remote Patient Monitoring Log",
          description:
            "Automated RPM printout from FDA-cleared BP device transmitted to provider.",
          acceptable: true,
          priority: "supplemental",
          notes: "Device serial number and transmission date required.",
        },
        {
          type: "Emergency Dept. Note",
          description: "BP reading documented in an ED visit.",
          acceptable: false,
          priority: "supplemental",
          notes:
            "NOT acceptable for numerator. Emergency BP readings are excluded per CBP §4.2.",
        },
        {
          type: "Self-Reported BP Log",
          description: "Patient-maintained paper or app-based BP log.",
          acceptable: false,
          priority: "supplemental",
          notes: "NOT acceptable per NCQA. Must be clinician-documented.",
        },
      ],
      fileRequirements: [
        {
          requirement: "File Format",
          detail:
            "PDF only. Scanned documents must be ≥ 300 DPI resolution. Color scan preferred for legibility.",
        },
        {
          requirement: "File Naming",
          detail:
            "[MemberID]_[MeasureCode]_[ServiceDate]_[PageType].pdf — e.g., MBR445521_CBP_20250414_OfficeNote.pdf",
        },
        {
          requirement: "File Size Limit",
          detail:
            "Maximum 25 MB per upload. Split large charts into encounter-specific files.",
        },
        {
          requirement: "Page Requirement",
          detail:
            "Upload only the page(s) containing the BP reading and provider signature. Full chart uploads accepted but not required.",
        },
        {
          requirement: "Legibility Standard",
          detail:
            "All fields used for abstraction (BP value, date, provider) must be clearly legible. Illegible text disqualifies the record.",
        },
      ],
      highlightRequirements: [
        {
          field: "Blood Pressure Reading",
          instruction:
            'Highlight the exact BP value (e.g., "142/88 mmHg") in yellow.',
          reason:
            "Required for numerator determination and auditor verification.",
        },
        {
          field: "Date of Service",
          instruction:
            "Highlight the visit date in yellow or circle it clearly.",
          reason:
            "Must confirm reading falls within Jan 1–Dec 31 of measurement year.",
        },
        {
          field: "Provider Signature",
          instruction:
            "Highlight or box the provider name, credentials, and NPI.",
          reason:
            "Confirms encounter is from a qualified provider as defined in CBP §5.0.",
        },
        {
          field: "Diagnosis Code",
          instruction:
            "Highlight the ICD-10 hypertension code if visible in the note.",
          reason:
            "Supports denominator validation (I10–I16 required in first 6 months of MY).",
        },
        {
          field: "Visit Type Indicator",
          instruction:
            'Highlight the visit type (e.g., "Office Visit — Established").',
          reason:
            "Confirms encounter type is acceptable per CBP §4.0 — ED visits excluded.",
        },
      ],
      commonErrors: [
        "Using a BP reading from an Emergency Department visit (not acceptable for CBP numerator)",
        "Not using the MOST RECENT reading — selecting an earlier reading from the same year",
        "Failing to verify that both systolic AND diastolic values are below threshold",
        "Applying the wrong threshold (using <140/90 for a member 60–85 without diabetes — should be <150/90)",
        "Not highlighting the BP reading on the uploaded document",
        "Uploading scans below 300 DPI causing illegibility disputes during audit",
      ],
    },
  },

  {
    id: "HbA1c",
    code: "HbA1c",
    name: "HbA1c Testing (CDC)",
    domain: "Effectiveness of Care",
    category: "Diabetes",
    productLines: ["Commercial", "Medicaid", "Medicare"],
    measurementYear: "MY2025",
    version: "2025.0.1",
    lastUpdated: "Jan 1, 2025",
    source: "NCQA HEDIS MY2025 Technical Specifications",
    type: "Hybrid",
    status: "Active",
    intent:
      "Identifies members 18–75 years of age with diabetes who had HbA1c testing during the measurement year.",
    description:
      "The percentage of members 18–75 years of age with diabetes who had a hemoglobin A1c (HbA1c) test performed during the measurement year.",
    eligibility: {
      ageMin: 18,
      ageMax: 75,
      ageNote: "Age calculated as of December 31 of the measurement year.",
      ncqaAgeRef: "CDC §2.1",
      enrollment: "Continuously enrolled with no more than one gap ≤ 45 days.",
      enrollmentGap: "One gap ≤ 45 days",
      ncqaEnrollRef: "CDC §2.2",
      gender: "No gender restriction.",
      ncqaGenderRef: "CDC §2.0",
      ipop: "Members 18–75 years with a diabetes diagnosis (ICD-10 E08–E13) during the measurement year or prior year.",
    },
    denominator: {
      definition: "Members 18–75 with a diabetes diagnosis.",
      population: "All eligible members with Type 1 or Type 2 diabetes.",
      diagnoses: [
        {
          code: "E11.9",
          system: "ICD-10-CM",
          description: "Type 2 diabetes mellitus without complications",
          required: true,
        },
        {
          code: "E10.9",
          system: "ICD-10-CM",
          description: "Type 1 diabetes mellitus without complications",
          required: true,
        },
        {
          code: "E11.65",
          system: "ICD-10-CM",
          description: "Type 2 diabetes with hyperglycemia",
          required: true,
        },
        {
          code: "E13.9",
          system: "ICD-10-CM",
          description: "Other specified diabetes mellitus",
          required: false,
        },
      ],
      productLineNotes: [
        { line: "Commercial", note: "Standard continuous enrollment." },
        {
          line: "Medicaid",
          note: "State-specific Medicaid enrollment rules apply.",
        },
        { line: "Medicare", note: "Medicare Advantage only." },
      ],
    },
    numerator: {
      definition:
        "Members who had at least one HbA1c lab test performed during the measurement year.",
      services: [
        {
          name: "HbA1c Lab Test",
          description:
            "At least one HbA1c test during Jan 1–Dec 31 of measurement year.",
          required: true,
        },
      ],
      codes: [
        {
          code: "83036",
          system: "CPT",
          description: "Hemoglobin A1c test",
          lookback: "MY Jan 1–Dec 31",
          required: true,
        },
        {
          code: "4548-4",
          system: "LOINC",
          description: "Hemoglobin A1c/Hemoglobin total in Blood",
          lookback: "MY Jan 1–Dec 31",
          required: true,
        },
        {
          code: "59261-8",
          system: "LOINC",
          description: "Hemoglobin A1c [%] by calculation",
          lookback: "MY Jan 1–Dec 31",
          required: false,
        },
      ],
      dateValidity:
        "Test must occur between Jan 1–Dec 31 of the measurement year.",
      lookbackPeriod: "Measurement year only.",
      thresholds: [
        {
          label: "HbA1c < 7.0%",
          value: "< 7.0%",
          met: "Good Control",
          notMet: "Poor Control",
        },
        {
          label: "HbA1c 7.0–9.0%",
          value: "7.0–9.0%",
          met: "Moderate Control",
          notMet: "—",
        },
        {
          label: "HbA1c > 9.0%",
          value: "> 9.0%",
          met: "—",
          notMet: "Poor Control",
        },
      ],
      notes: [
        "Testing only required — specific result value tracked separately for sub-measure reporting.",
        "POCT (point-of-care testing) is acceptable.",
      ],
    },
    exclusions: [
      {
        id: "hba1c-exc1",
        category: "Pregnancy",
        timing: "During measurement year",
        description: "Members who were pregnant during the measurement year.",
        codes: [
          {
            code: "Z34",
            system: "ICD-10-CM",
            description: "Encounter for supervision of normal pregnancy",
          },
        ],
      },
      {
        id: "hba1c-exc2",
        category: "Hospice",
        timing: "During measurement year",
        description: "Members in hospice care.",
        codes: [
          {
            code: "Z51.5",
            system: "ICD-10-CM",
            description: "Encounter for palliative care",
          },
        ],
      },
    ],
    documentation: {
      evidenceTypes: [
        {
          type: "Lab Report (EHR)",
          description: "Lab result report from EHR or reference lab.",
          acceptable: true,
          priority: "required",
          notes: "Must include date, result value, and ordering provider.",
        },
        {
          type: "POCT Result Strip",
          description: "Point-of-care test result documented in note.",
          acceptable: true,
          priority: "preferred",
          notes:
            "Provider must document test date and result in the clinical note.",
        },
        {
          type: "Hospital Lab Report",
          description: "Inpatient or outpatient hospital lab result.",
          acceptable: true,
          priority: "supplemental",
          notes: "Must be clearly dated and patient-identified.",
        },
      ],
      fileRequirements: [
        { requirement: "File Format", detail: "PDF only, ≥ 300 DPI." },
        { requirement: "Naming", detail: "[MemberID]_HbA1c_[ServiceDate].pdf" },
      ],
      highlightRequirements: [
        {
          field: "HbA1c Result Value",
          instruction: "Highlight the numeric HbA1c percentage value.",
          reason: "Required for result-level reporting.",
        },
        {
          field: "Test Date",
          instruction: "Highlight the date the test was performed.",
          reason: "Must confirm test falls within measurement year.",
        },
      ],
      commonErrors: [
        "Using a test from outside the measurement year.",
        "Not documenting the specific numeric result value.",
      ],
    },
  },

  {
    id: "BCS",
    code: "BCS",
    name: "Breast Cancer Screening",
    domain: "Effectiveness of Care",
    category: "Cancer Screening",
    productLines: ["Commercial", "Medicaid", "Medicare"],
    measurementYear: "MY2025",
    version: "2025.0.1",
    lastUpdated: "Jan 1, 2025",
    source: "NCQA HEDIS MY2025 Technical Specifications",
    type: "Hybrid",
    status: "Active",
    intent:
      "Identifies women 52–74 who had a mammogram in the measurement year or prior year.",
    description:
      "The percentage of women 52–74 years of age who had a mammogram to screen for breast cancer during the measurement year or the year prior.",
    eligibility: {
      ageMin: 52,
      ageMax: 74,
      ageNote: "Age as of December 31 of the measurement year.",
      ncqaAgeRef: "BCS §2.1",
      enrollment:
        "Continuously enrolled for the measurement year and prior year, one gap ≤ 45 days allowed.",
      enrollmentGap: "One gap ≤ 45 days",
      ncqaEnrollRef: "BCS §2.2",
      gender: "Female only.",
      ncqaGenderRef: "BCS §2.0",
      ipop: "Women 52–74 enrolled in the measurement year.",
    },
    denominator: {
      definition:
        "Women 52–74 enrolled for both measurement year and prior year.",
      population: "Women only, ages 52–74, with continuous enrollment.",
      diagnoses: [
        {
          code: "Z12.31",
          system: "ICD-10-CM",
          description:
            "Encounter for screening mammogram for malignant neoplasm of breast",
          required: true,
        },
      ],
      productLineNotes: [
        { line: "Commercial", note: "Standard enrollment." },
        { line: "Medicaid", note: "State rules." },
        { line: "Medicare", note: "MA only." },
      ],
    },
    numerator: {
      definition:
        "Women with at least one mammogram in the measurement year or prior year.",
      services: [
        {
          name: "Mammogram",
          description: "Any bilateral or unilateral screening mammogram.",
          required: true,
        },
      ],
      codes: [
        {
          code: "77065",
          system: "CPT",
          description: "Diagnostic mammography, unilateral",
          lookback: "MY or prior year",
          required: false,
        },
        {
          code: "77066",
          system: "CPT",
          description: "Diagnostic mammography, bilateral",
          lookback: "MY or prior year",
          required: false,
        },
        {
          code: "77067",
          system: "CPT",
          description: "Screening mammography, bilateral",
          lookback: "MY or prior year",
          required: true,
        },
        {
          code: "G0202",
          system: "HCPCS",
          description: "Screening mammography (digital)",
          lookback: "MY or prior year",
          required: true,
        },
        {
          code: "24606-6",
          system: "LOINC",
          description: "Mammary gland Imaging study",
          lookback: "MY or prior year",
          required: false,
        },
      ],
      dateValidity:
        "Mammogram must fall within measurement year OR the calendar year prior.",
      lookbackPeriod: "Measurement year + 1 prior year.",
      thresholds: [
        {
          label: "Mammogram present",
          value: "Yes/No",
          met: "Numerator MET",
          notMet: "Numerator NOT MET",
        },
      ],
      notes: [
        "Two-year lookback window.",
        "Bilateral mastectomy excludes the member entirely.",
      ],
    },
    exclusions: [
      {
        id: "bcs-exc1",
        category: "Bilateral Mastectomy",
        timing: "Anytime in member history",
        description:
          "Any member with a bilateral mastectomy is excluded from the denominator.",
        codes: [
          {
            code: "Z90.13",
            system: "ICD-10-CM",
            description: "Acquired absence of bilateral breasts and nipples",
          },
        ],
      },
      {
        id: "bcs-exc2",
        category: "Hospice",
        timing: "During measurement year",
        description: "Members in hospice.",
        codes: [
          {
            code: "Z51.5",
            system: "ICD-10-CM",
            description: "Encounter for palliative care",
          },
        ],
      },
    ],
    documentation: {
      evidenceTypes: [
        {
          type: "Radiology Report",
          description: "Mammography radiology report from imaging center.",
          acceptable: true,
          priority: "required",
          notes: "Must include date, laterality, and radiologist signature.",
        },
      ],
      fileRequirements: [{ requirement: "Format", detail: "PDF ≥ 300 DPI." }],
      highlightRequirements: [
        {
          field: "Procedure Date",
          instruction: "Highlight service date.",
          reason: "Two-year lookback must be confirmed.",
        },
        {
          field: "Procedure Type",
          instruction: "Highlight laterality (bilateral/unilateral).",
          reason: "Bilateral only for screening.",
        },
      ],
      commonErrors: [
        "Using a diagnostic mammogram for a symptomatic finding (not screening).",
      ],
    },
  },

  {
    id: "COL",
    code: "COL",
    name: "Colorectal Cancer Screening",
    domain: "Effectiveness of Care",
    category: "Cancer Screening",
    productLines: ["Commercial", "Medicaid", "Medicare"],
    measurementYear: "MY2025",
    version: "2025.0.1",
    lastUpdated: "Jan 1, 2025",
    source: "NCQA HEDIS MY2025 Technical Specifications",
    type: "Hybrid",
    status: "Active",
    intent:
      "Identifies members 45–75 years who had appropriate colorectal cancer screening.",
    description:
      "The percentage of members 45–75 years of age who had appropriate screening for colorectal cancer.",
    eligibility: {
      ageMin: 45,
      ageMax: 75,
      ageNote: "Age as of December 31 of the measurement year.",
      ncqaAgeRef: "COL §2.1",
      enrollment: "Continuously enrolled for the measurement year.",
      enrollmentGap: "One gap ≤ 45 days",
      ncqaEnrollRef: "COL §2.2",
      gender: "No gender restriction.",
      ncqaGenderRef: "COL §2.0",
      ipop: "Members 45–75 enrolled during the measurement year.",
    },
    denominator: {
      definition: "Members 45–75 years of age.",
      population: "All eligible members regardless of risk level.",
      diagnoses: [
        {
          code: "Z12.11",
          system: "ICD-10-CM",
          description:
            "Encounter for screening for malignant neoplasm of colon",
          required: false,
        },
      ],
      productLineNotes: [
        { line: "Commercial", note: "Standard." },
        { line: "Medicaid", note: "State-specific." },
        { line: "Medicare", note: "MA only." },
      ],
    },
    numerator: {
      definition:
        "Members with one of the accepted colorectal screening tests within the appropriate lookback window.",
      services: [
        {
          name: "Annual Fecal Occult Blood Test (FOBT)",
          description: "Guaiac FOBT in measurement year.",
          required: false,
        },
        {
          name: "Stool DNA (sDNA)",
          description: "Within the past 3 years.",
          required: false,
        },
        {
          name: "CT Colonography",
          description: "Within the past 5 years.",
          required: false,
        },
        {
          name: "Flexible Sigmoidoscopy",
          description: "Within the past 5 years.",
          required: false,
        },
        {
          name: "Colonoscopy",
          description: "Within the past 10 years.",
          required: false,
        },
      ],
      codes: [
        {
          code: "82270",
          system: "CPT",
          description: "FOBT — guaiac, feces (3 cards)",
          lookback: "MY only",
          required: false,
        },
        {
          code: "82274",
          system: "CPT",
          description: "Blood fecal (occult), immunoassay",
          lookback: "MY only",
          required: false,
        },
        {
          code: "81528",
          system: "CPT",
          description: "Oncology (colorectal), stool DNA",
          lookback: "3 years",
          required: false,
        },
        {
          code: "45378",
          system: "CPT",
          description: "Colonoscopy, diagnostic",
          lookback: "10 years",
          required: false,
        },
        {
          code: "45381",
          system: "CPT",
          description: "Colonoscopy with directed submucosal injection",
          lookback: "10 years",
          required: false,
        },
        {
          code: "74263",
          system: "CPT",
          description: "CT colonography (virtual colonoscopy)",
          lookback: "5 years",
          required: false,
        },
      ],
      dateValidity: "Varies by test type — see lookback column.",
      lookbackPeriod:
        "Varies: FOBT = current year; sDNA = 3 years; CT Colonography/Sigmoidoscopy = 5 years; Colonoscopy = 10 years.",
      thresholds: [
        {
          label: "Appropriate screening test present",
          value: "Yes/No",
          met: "Numerator MET",
          notMet: "Numerator NOT MET",
        },
      ],
      notes: [
        "Any ONE of the accepted test types satisfies the numerator.",
        "Lookback periods differ by test — verify carefully.",
      ],
    },
    exclusions: [
      {
        id: "col-exc1",
        category: "Colorectal Cancer Diagnosis",
        timing: "Anytime",
        description: "Members with a prior colorectal cancer diagnosis.",
        codes: [
          {
            code: "C18.9",
            system: "ICD-10-CM",
            description: "Malignant neoplasm of colon, unspecified",
          },
        ],
      },
      {
        id: "col-exc2",
        category: "Total Colectomy",
        timing: "Anytime",
        description: "Members with total colectomy.",
        codes: [
          {
            code: "Z90.49",
            system: "ICD-10-CM",
            description:
              "Acquired absence of other specified parts of digestive tract",
          },
        ],
      },
      {
        id: "col-exc3",
        category: "Hospice",
        timing: "MY",
        description: "Members in hospice.",
        codes: [
          {
            code: "Z51.5",
            system: "ICD-10-CM",
            description: "Encounter for palliative care",
          },
        ],
      },
    ],
    documentation: {
      evidenceTypes: [
        {
          type: "Colonoscopy Report",
          description: "Pathology or endoscopy report.",
          acceptable: true,
          priority: "required",
          notes: "Date, procedure type, provider signature required.",
        },
        {
          type: "Lab Results (FOBT)",
          description: "Lab report for fecal test.",
          acceptable: true,
          priority: "required",
          notes: "Test date and result required.",
        },
        {
          type: "Radiology (CT Col.)",
          description: "CT colonography report.",
          acceptable: true,
          priority: "preferred",
          notes:
            "Report must specify no significant findings or specify findings found.",
        },
      ],
      fileRequirements: [{ requirement: "Format", detail: "PDF ≥ 300 DPI." }],
      highlightRequirements: [
        {
          field: "Procedure Type",
          instruction: "Highlight the procedure name.",
          reason: "Confirm acceptable test type.",
        },
        {
          field: "Service Date",
          instruction: "Highlight the test date.",
          reason: "Must fall within lookback window.",
        },
      ],
      commonErrors: [
        "Using the wrong lookback window for test type.",
        "Counting diagnostic colonoscopy after positive screening (not eligible).",
      ],
    },
  },

  {
    id: "CIS",
    code: "CIS",
    name: "Childhood Immunization Status",
    domain: "Effectiveness of Care",
    category: "Child Health",
    productLines: ["Commercial", "Medicaid"],
    measurementYear: "MY2025",
    version: "2025.0.1",
    lastUpdated: "Jan 1, 2025",
    source: "NCQA HEDIS MY2025 Technical Specifications",
    type: "Administrative",
    status: "Active",
    intent:
      "Identifies children who turned 2 years of age during the measurement year and received recommended immunizations.",
    description:
      "The percentage of children who turned 2 years of age during the measurement year and who had the recommended immunizations by their second birthday.",
    eligibility: {
      ageMin: 2,
      ageMax: 2,
      ageNote:
        "Children who turned exactly 2 during the measurement year (DOB Jan 1 – Dec 31 of the year 2 years prior).",
      ncqaAgeRef: "CIS §2.1",
      enrollment: "Continuously enrolled from birth through 2nd birthday.",
      enrollmentGap: "No gap allowed",
      ncqaEnrollRef: "CIS §2.2",
      gender: "No restriction.",
      ncqaGenderRef: "CIS §2.0",
      ipop: "Children turning 2 during the measurement year.",
    },
    denominator: {
      definition:
        "Children who turned 2 during the measurement year, continuously enrolled from birth.",
      population: "Children enrolled from birth through 2nd birthday.",
      diagnoses: [
        {
          code: "Z23",
          system: "ICD-10-CM",
          description: "Encounter for immunization",
          required: false,
        },
      ],
      productLineNotes: [
        { line: "Commercial", note: "Standard." },
        { line: "Medicaid", note: "State VFC programs count." },
      ],
    },
    numerator: {
      definition:
        "Children who received all recommended immunizations by their 2nd birthday.",
      services: [
        {
          name: "DTaP (4 doses)",
          description: "4 diphtheria, tetanus, pertussis doses by age 2.",
          required: true,
        },
        {
          name: "IPV (3 doses)",
          description: "3 inactivated poliovirus vaccine doses.",
          required: true,
        },
        {
          name: "MMR (1 dose)",
          description: "1 measles, mumps, rubella dose.",
          required: true,
        },
        {
          name: "HiB (3 doses)",
          description: "3 Haemophilus influenzae type b doses.",
          required: true,
        },
        {
          name: "Hepatitis B (3 doses)",
          description: "3 Hepatitis B doses.",
          required: true,
        },
        {
          name: "VZV (1 dose)",
          description: "1 varicella-zoster virus dose.",
          required: true,
        },
        {
          name: "Pneumococcal (4 doses)",
          description: "4 pneumococcal vaccine doses.",
          required: true,
        },
        {
          name: "Hepatitis A (2 doses)",
          description: "2 Hepatitis A doses.",
          required: true,
        },
        {
          name: "Rotavirus (2–3 doses)",
          description: "2–3 rotavirus doses (product-dependent).",
          required: true,
        },
        {
          name: "Influenza (2 doses)",
          description:
            "2 influenza doses on or after 8/1 of the year prior to 2nd birthday.",
          required: true,
        },
      ],
      codes: [
        {
          code: "90700",
          system: "CPT",
          description: "DTaP vaccine, intramuscular",
          lookback: "By 2nd birthday",
          required: true,
        },
        {
          code: "90713",
          system: "CPT",
          description: "Poliovirus (IPV), intramuscular",
          lookback: "By 2nd birthday",
          required: true,
        },
        {
          code: "90707",
          system: "CPT",
          description: "MMR vaccine, subcutaneous",
          lookback: "By 2nd birthday",
          required: true,
        },
        {
          code: "90645",
          system: "CPT",
          description: "Haemophilus influenzae b vaccine (HbOC)",
          lookback: "By 2nd birthday",
          required: true,
        },
        {
          code: "90744",
          system: "CPT",
          description: "Hepatitis B vaccine, 3-dose schedule",
          lookback: "By 2nd birthday",
          required: true,
        },
        {
          code: "90716",
          system: "CPT",
          description: "Varicella virus vaccine (VZV)",
          lookback: "By 2nd birthday",
          required: true,
        },
        {
          code: "90669",
          system: "CPT",
          description: "Pneumococcal conjugate vaccine (PCV7)",
          lookback: "By 2nd birthday",
          required: true,
        },
        {
          code: "90723",
          system: "CPT",
          description: "DTaP-HepB-IPV combination vaccine",
          lookback: "By 2nd birthday",
          required: false,
        },
      ],
      dateValidity:
        "All immunizations must be administered on or before the member's 2nd birthday.",
      lookbackPeriod: "From birth (date of delivery) through 2nd birthday.",
      thresholds: [
        {
          label: "All required vaccines received",
          value: "All doses present",
          met: "Numerator MET (combo rate)",
          notMet: "Numerator NOT MET",
        },
      ],
      notes: [
        "Combination vaccines are acceptable — verify doses counted per component.",
        "VFC (Vaccines for Children) doses from public programs are countable.",
        "Contraindicated vaccines may be excluded with proper documentation.",
      ],
    },
    exclusions: [
      {
        id: "cis-exc1",
        category: "Hospice / Palliative",
        timing: "During measurement year",
        description: "Children in hospice.",
        codes: [
          {
            code: "Z51.5",
            system: "ICD-10-CM",
            description: "Encounter for palliative care",
          },
        ],
      },
    ],
    documentation: {
      evidenceTypes: [
        {
          type: "Immunization Record",
          description: "EHR immunization module printout.",
          acceptable: true,
          priority: "required",
          notes: "Vaccine name, date, dose, and lot number required.",
        },
        {
          type: "VFC Card / State Registry",
          description: "Vaccine registry or VFC program record.",
          acceptable: true,
          priority: "preferred",
          notes: "Must be from a recognized state immunization registry.",
        },
        {
          type: "Provider-signed Letter",
          description:
            "Attestation letter from pediatrician with vaccine dates.",
          acceptable: true,
          priority: "supplemental",
          notes: "Physician signature and NPI required.",
        },
      ],
      fileRequirements: [
        { requirement: "Format", detail: "PDF ≥ 300 DPI." },
        {
          requirement: "Content",
          detail: "Must show all vaccine components, dates, and doses.",
        },
      ],
      highlightRequirements: [
        {
          field: "Each Vaccine Name",
          instruction: "Highlight each vaccine name.",
          reason: "Each component must be individually verified.",
        },
        {
          field: "Administration Date",
          instruction: "Highlight the date of each dose.",
          reason: "Must be on or before the 2nd birthday.",
        },
        {
          field: "Dose Number",
          instruction: "Highlight dose number in series.",
          reason: "Multi-dose series require correct count.",
        },
      ],
      commonErrors: [
        "Counting a dose given after the 2nd birthday.",
        "Not verifying all 10 required vaccine components.",
        "Forgetting that some combination vaccines must be split into individual component counts.",
      ],
    },
  },
];

/* ─────────────────────────────────────────────────────────────
   STYLE MAPS
───────────────────────────────────────────────────────────── */
const CATEGORY_STYLES: Record<
  string,
  {
    border: string;
    icon: ElementType;
    iconBg: string;
    iconColor: string;
    bg: string;
  }
> = {
  Cardiovascular: {
    border: "border-l-red-500",
    icon: Heart,
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    bg: "bg-red-50/40",
  },
  Diabetes: {
    border: "border-l-blue-500",
    icon: Activity,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    bg: "bg-blue-50/40",
  },
  "Cancer Screening": {
    border: "border-l-violet-500",
    icon: Microscope,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    bg: "bg-violet-50/40",
  },
  "Child Health": {
    border: "border-l-emerald-500",
    icon: Baby,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    bg: "bg-emerald-50/40",
  },
  "Mental Health": {
    border: "border-l-amber-500",
    icon: Brain,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    bg: "bg-amber-50/40",
  },
  Medication: {
    border: "border-l-cyan-500",
    icon: Pill,
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
    bg: "bg-cyan-50/40",
  },
};
const CODE_SYSTEM_STYLES: Record<string, string> = {
  "ICD-10-CM": "bg-blue-50 text-blue-700 border-blue-200",
  "ICD-10-PCS": "bg-cyan-50 text-cyan-700 border-cyan-200",
  CPT: "bg-violet-50 text-violet-700 border-violet-200",
  HCPCS: "bg-orange-50 text-orange-700 border-orange-200",
  LOINC: "bg-teal-50 text-teal-700 border-teal-200",
  SNOMED: "bg-rose-50 text-rose-700 border-rose-200",
};
const PRIORITY_STYLES = {
  required: {
    badge: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  preferred: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  supplemental: {
    badge: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
};
const TAB_META: { id: MeasureTab; label: string; icon: ElementType }[] = [
  { id: "eligibility", label: "Eligibility", icon: Users },
  { id: "denominator", label: "Denominator", icon: Target },
  { id: "numerator", label: "Numerator", icon: CheckCircle2 },
  { id: "exclusions", label: "Exclusions", icon: XCircle },
  { id: "documentation", label: "Documentation", icon: FileText },
];

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */
function CodeTag({ code, system }: { code: string; system: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono font-bold ${CODE_SYSTEM_STYLES[system] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {code}
    </span>
  );
}

function SystemBadge({ system }: { system: string }) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${CODE_SYSTEM_STYLES[system] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {system}
    </span>
  );
}

function RequiredPill({ required }: { required?: boolean }) {
  if (required)
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-full">
        <Star className="w-2.5 h-2.5" />
        Required
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground bg-muted/40 border border-border rounded-full">
      Optional
    </span>
  );
}

function RuleCard({
  icon: Icon,
  title,
  value,
  sub,
  accent = "border-border",
  iconBg = "bg-muted/40",
  iconColor = "text-muted-foreground",
  tag,
}: {
  icon: ElementType;
  title: string;
  value: string;
  sub?: string;
  accent?: string;
  iconBg?: string;
  iconColor?: string;
  tag?: ReactNode;
}) {
  return (
    <div
      className={`flex items-start gap-3 border ${accent} rounded-xl p-3.5 bg-card`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}
      >
        <Icon
          className={`w-4.5 h-4.5 ${iconColor}`}
          style={{ width: 18, height: 18 }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          {tag}
        </div>
        <p className="text-[13px] font-semibold text-foreground leading-snug">
          {value}
        </p>
        {sub && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 my-4">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function CodeTable({
  codes,
  showLookback = false,
}: {
  codes: (DiagCode & { lookback?: string })[];
  showLookback?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full">
        <thead className="bg-muted/40 border-b border-border">
          <tr>
            <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-28">
              Code
            </th>
            <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-24">
              System
            </th>
            <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Description
            </th>
            {showLookback && (
              <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-28">
                Lookback
              </th>
            )}
            <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-20">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {codes.map((c, i) => (
            <tr key={i} className="hover:bg-muted/20 transition-colors">
              <td className="px-3 py-2">
                <CodeTag code={c.code} system={c.system} />
              </td>
              <td className="px-3 py-2">
                <SystemBadge system={c.system} />
              </td>
              <td className="px-3 py-2 text-[11px] text-foreground font-medium">
                {c.description}
              </td>
              {showLookback && (
                <td className="px-3 py-2 text-[10px] text-muted-foreground font-medium">
                  {c.lookback ?? "—"}
                </td>
              )}
              <td className="px-3 py-2">
                <RequiredPill required={c.required} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── TAB CONTENT ── */
function TabEligibility({ m }: { m: Measure }) {
  return (
    <div className="space-y-4">
      <SectionDivider label="Age Criteria" />
      <div className="grid grid-cols-2 gap-3">
        <RuleCard
          icon={Users}
          title="Age Range"
          value={`${m.eligibility.ageMin}–${m.eligibility.ageMax} years`}
          sub={m.eligibility.ageNote}
          accent="border-l-4 border-l-primary"
          iconBg="bg-primary/10"
          iconColor="text-primary"
          tag={
            <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
              {m.eligibility.ncqaAgeRef}
            </span>
          }
        />
        <RuleCard
          icon={Calendar}
          title="Age Calculation Date"
          value="December 31 of the Measurement Year"
          sub="Age must be calculated as of the last day of the measurement year."
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
      </div>

      <SectionDivider label="Continuous Enrollment" />
      <div className="grid grid-cols-2 gap-3">
        <RuleCard
          icon={CheckCircle2}
          title="Enrollment Rule"
          value={m.eligibility.enrollment}
          accent="border-l-4 border-l-emerald-500"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          tag={
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {m.eligibility.ncqaEnrollRef}
            </span>
          }
        />
        <RuleCard
          icon={AlertCircle}
          title="Maximum Gap Allowed"
          value={m.eligibility.enrollmentGap}
          sub="Gaps exceeding this threshold disqualify the member from the denominator."
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      <SectionDivider label="Gender Rules" />
      <RuleCard
        icon={Users}
        title="Gender Restriction"
        value={m.eligibility.gender}
        accent={
          m.eligibility.gender ===
          "No gender restriction — applies to all members with HTN diagnosis."
            ? "border-border"
            : "border-l-4 border-l-violet-500"
        }
        iconBg="bg-violet-50"
        iconColor="text-violet-600"
        tag={
          <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
            {m.eligibility.ncqaGenderRef}
          </span>
        }
      />

      <SectionDivider label="Initial Population (IPOP)" />
      <div className="border border-primary/20 bg-primary/5 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-[12px] text-foreground leading-relaxed">
          {m.eligibility.ipop}
        </p>
      </div>
    </div>
  );
}

function TabDenominator({ m }: { m: Measure }) {
  return (
    <div className="space-y-4">
      <SectionDivider label="Eligible Population" />
      <div className="border border-border rounded-xl p-4 bg-card space-y-2">
        <p className="text-[12px] font-semibold text-foreground">
          {m.denominator.definition}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {m.denominator.population}
        </p>
      </div>

      <SectionDivider label="Required Diagnoses" />
      <CodeTable codes={m.denominator.diagnoses} />

      <SectionDivider label="Product Line Rules" />
      <div className="grid grid-cols-3 gap-3">
        {m.denominator.productLineNotes.map((pln) => (
          <div
            key={pln.line}
            className="border border-border rounded-xl p-3 bg-card"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${pln.line === "Commercial" ? "bg-blue-50 text-blue-700 border-blue-200" : pln.line === "Medicaid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-violet-50 text-violet-700 border-violet-200"}`}
              >
                {pln.line}
              </span>
            </div>
            <p className="text-[11px] text-foreground">{pln.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabNumerator({ m }: { m: Measure }) {
  return (
    <div className="space-y-4">
      <SectionDivider label="Numerator Definition" />
      <div className="border-l-4 border-l-emerald-500 bg-emerald-50/40 border border-emerald-200 rounded-r-xl p-4">
        <p className="text-[12px] font-semibold text-foreground">
          {m.numerator.definition}
        </p>
      </div>

      {m.numerator.thresholds.length > 0 && (
        <>
          <SectionDivider label="Compliance Thresholds" />
          <div className="grid gap-2">
            {m.numerator.thresholds.map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 bg-card"
              >
                <div className="w-32 flex-shrink-0">
                  <span className="text-[11px] font-semibold text-foreground">
                    {t.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-[12px] font-bold text-foreground bg-muted px-2 py-0.5 rounded font-mono">
                    {t.value}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" />
                    {t.met}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    <XCircle className="w-3 h-3" />
                    {t.notMet}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <SectionDivider label="Required Services" />
      <div className="grid grid-cols-2 gap-3">
        {m.numerator.services.map((s, i) => (
          <div
            key={i}
            className={`border rounded-xl p-3.5 flex items-start gap-2.5 ${s.required ? "border-l-4 border-l-emerald-500 border-emerald-200 bg-emerald-50/30" : "border-border bg-card"}`}
          >
            <CheckCircle2
              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${s.required ? "text-emerald-600" : "text-muted-foreground"}`}
            />
            <div>
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <p className="text-[12px] font-bold text-foreground">
                  {s.name}
                </p>
                <RequiredPill required={s.required} />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {s.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <SectionDivider label="CPT / LOINC Codes" />
      <CodeTable codes={m.numerator.codes} showLookback={true} />

      <SectionDivider label="Service Date Validity & Lookback" />
      <div className="grid grid-cols-2 gap-3">
        <RuleCard
          icon={Calendar}
          title="Service Date Validity"
          value={m.numerator.dateValidity}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          accent="border-l-4 border-l-blue-500"
        />
        <RuleCard
          icon={Clock}
          title="Lookback Period"
          value={m.numerator.lookbackPeriod}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          accent="border-l-4 border-l-amber-500"
        />
      </div>

      {m.numerator.notes.length > 0 && (
        <>
          <SectionDivider label="Abstraction Notes" />
          <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-4 space-y-2">
            {m.numerator.notes.map((n, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-foreground font-medium">{n}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TabExclusions({ m }: { m: Measure }) {
  return (
    <div className="space-y-4">
      {m.exclusions.map((exc) => (
        <div
          key={exc.id}
          className="border border-red-200 rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-red-50/60 border-b border-red-200">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-[12px] font-bold text-red-800">
                {exc.category}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-red-500" />
              <span className="text-[10px] font-semibold text-red-700">
                {exc.timing}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3 bg-card">
            <p className="text-[12px] text-foreground">{exc.description}</p>
            <CodeTable codes={exc.codes} />
          </div>
        </div>
      ))}

      <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-4 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] font-bold text-amber-800 mb-1">
            Exclusion Application Rule
          </p>
          <p className="text-[11px] text-foreground">
            Exclusions must be verified through claims, chart abstraction, or
            supplemental data. Applying exclusions incorrectly (over-excluding)
            is an NCQA audit risk. Always document the source of the exclusion
            criteria.
          </p>
        </div>
      </div>
    </div>
  );
}

function TabDocumentation({ m }: { m: Measure }) {
  return (
    <div className="space-y-4">
      <SectionDivider label="Accepted Evidence Types" />
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              {["Evidence Type", "Description", "Priority", "Notes"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {m.documentation.evidenceTypes.map((e, i) => {
              const ps = PRIORITY_STYLES[e.priority];
              return (
                <tr
                  key={i}
                  className={`hover:bg-muted/20 transition-colors ${!e.acceptable ? "bg-red-50/30" : ""}`}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      {e.acceptable ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      )}
                      <span
                        className={`text-[12px] font-semibold ${!e.acceptable ? "text-red-700 line-through" : "text-foreground"}`}
                      >
                        {e.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[11px] text-foreground max-w-[220px]">
                    {e.description}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${ps.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${ps.dot}`} />
                      {e.priority}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[11px] text-muted-foreground">
                    {e.notes}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SectionDivider label="File Requirements" />
      <div className="grid grid-cols-2 gap-2">
        {m.documentation.fileRequirements.map((r, i) => (
          <div
            key={i}
            className="border border-border rounded-xl p-3.5 bg-card flex items-start gap-2.5"
          >
            <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-foreground mb-0.5">
                {r.requirement}
              </p>
              <p className="text-[11px] text-muted-foreground">{r.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {m.documentation.highlightRequirements.length > 0 && (
        <>
          <SectionDivider label="Highlight Requirements" />
          <div className="space-y-2">
            {m.documentation.highlightRequirements.map((hr, i) => (
              <div
                key={i}
                className="border border-yellow-200 rounded-xl p-3.5 bg-yellow-50/40 flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded bg-yellow-300 flex items-center justify-center text-[10px] font-bold text-yellow-900 flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-[12px] font-bold text-foreground">
                      {hr.field}
                    </span>
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded italic">
                      {hr.instruction}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {hr.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {m.documentation.commonErrors.length > 0 && (
        <>
          <SectionDivider label="Common Errors to Avoid" />
          <div className="border border-red-200 bg-red-50/30 rounded-xl p-4 space-y-2">
            {m.documentation.commonErrors.map((e, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-foreground font-medium">{e}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export function MeasuresLibrary() {
  const [selectedId, setSelectedId] = useState("CBP");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [myFilter, setMyFilter] = useState("MY2025");
  const [activeTab, setActiveTab] = useState<MeasureTab>("eligibility");

  const selected = MEASURES.find((m) => m.id === selectedId) ?? MEASURES[0];
  const catStyle =
    CATEGORY_STYLES[selected.category] ?? CATEGORY_STYLES["Cardiovascular"];
  const CatDetailIcon = catStyle.icon;

  const filteredMeasures = useMemo(
    () =>
      MEASURES.filter((m) => {
        const q = searchQuery.toLowerCase();
        const matchSearch =
          !q ||
          m.code.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q);
        const matchCat =
          categoryFilter === "all" || m.category === categoryFilter;
        const matchProd =
          productFilter === "all" ||
          m.productLines.includes(productFilter as ProductLine);
        const matchMY = myFilter === "all" || m.measurementYear === myFilter;
        return matchSearch && matchCat && matchProd && matchMY;
      }),
    [searchQuery, categoryFilter, productFilter, myFilter],
  );

  const categories = [
    "all",
    ...Array.from(new Set(MEASURES.map((m) => m.category))),
  ];

  function FilterSel({
    value,
    onChange,
    options,
  }: {
    value: string;
    onChange: (v: string) => void;
    options: [string, string][];
  }) {
    return (
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none pl-3 pr-7 py-1.5 text-[11px] font-semibold border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          {options.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* ══════════════════════════════════════════════════════
          STICKY HEADER
      ══════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-5 py-3 flex-wrap">
          <div className="flex items-center gap-2 mr-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-tight">
                Measure Library
              </h1>
              <p className="text-[10px] text-muted-foreground">
                NCQA HEDIS · Clinical Specifications Reference
              </p>
            </div>
          </div>
          <div className="h-5 w-px bg-border" />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search measures, codes, categories…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-[11px] border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-56"
            />
          </div>

          <FilterSel
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categories.map(
              (c) =>
                [c, c === "all" ? "All Categories" : c] as [string, string],
            )}
          />
          <FilterSel
            value={productFilter}
            onChange={setProductFilter}
            options={[
              ["all", "All Product Lines"],
              ["Commercial", "Commercial"],
              ["Medicaid", "Medicaid"],
              ["Medicare", "Medicare"],
            ]}
          />
          <FilterSel
            value={myFilter}
            onChange={setMyFilter}
            options={[
              ["MY2025", "MY 2025"],
              ["MY2024", "MY 2024"],
              ["all", "All Years"],
            ]}
          />

          <div className="flex-1" />
          <span className="text-[10px] text-muted-foreground">
            {filteredMeasures.length} measures
          </span>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5" />
            Export Specs
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          2-PANEL LAYOUT
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT PANEL: MEASURE LIST ── */}
        <div className="w-72 flex-shrink-0 flex flex-col border-r border-border overflow-hidden bg-card">
          <div className="flex-shrink-0 px-3 py-2 border-b border-border">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {filteredMeasures.length} Measures · {myFilter}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredMeasures.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="w-7 h-7 opacity-30 mb-2" />
                <p className="text-[12px]">No measures match your filters</p>
              </div>
            ) : (
              filteredMeasures.map((m) => {
                const cs =
                  CATEGORY_STYLES[m.category] ??
                  CATEGORY_STYLES["Cardiovascular"];
                const CatIcon = cs.icon;
                const isSelected = m.id === selectedId;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedId(m.id);
                      setActiveTab("eligibility");
                    }}
                    className={`w-full text-left px-3 py-3.5 border-b border-border transition-all hover:bg-muted/30 border-l-[3px] ${isSelected ? cs.border + " " + cs.bg : "border-l-transparent"}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${isSelected ? cs.iconBg : "bg-muted/40 border-border"}`}
                      >
                        <CatIcon
                          className={`w-4 h-4 ${isSelected ? cs.iconColor : "text-muted-foreground"}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${isSelected ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"}`}
                          >
                            {m.code}
                          </span>
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${m.status === "Active" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : m.status === "Updated" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-slate-600 bg-slate-50 border-slate-200"}`}
                            >
                              {m.status}
                            </span>
                          </div>
                        </div>
                        <p
                          className={`text-[12px] font-semibold leading-tight mb-1 ${isSelected ? "text-foreground" : "text-foreground"}`}
                        >
                          {m.name}
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] text-muted-foreground">
                            {m.category}
                          </span>
                          <span className="text-muted-foreground/40">·</span>
                          <span
                            className={`text-[9px] font-semibold px-1 py-0.5 rounded ${m.type === "Hybrid" ? "bg-blue-50 text-blue-600" : m.type === "Administrative" ? "bg-slate-50 text-slate-600" : "bg-teal-50 text-teal-600"}`}
                          >
                            {m.type}
                          </span>
                        </div>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {m.productLines.map((pl) => (
                            <span
                              key={pl}
                              className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${pl === "Commercial" ? "bg-blue-50 text-blue-600 border-blue-200" : pl === "Medicaid" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-violet-50 text-violet-600 border-violet-200"}`}
                            >
                              {pl}
                            </span>
                          ))}
                        </div>
                      </div>
                      {isSelected && (
                        <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── CENTER PANEL: MEASURE DETAIL ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Measure overview header */}
          <div
            className={`flex-shrink-0 border-b border-border px-6 py-4 ${catStyle.bg}`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center flex-shrink-0 ${catStyle.iconBg} ${catStyle.border.replace("border-l-", "border-")}`}
              >
                <CatDetailIcon className={`w-6 h-6 ${catStyle.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xl font-black text-foreground">
                    {selected.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${selected.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                  >
                    {selected.status}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${selected.type === "Hybrid" ? "bg-blue-50 text-blue-700 border-blue-200" : selected.type === "Administrative" ? "bg-slate-50 text-slate-600 border-slate-200" : "bg-teal-50 text-teal-700 border-teal-200"}`}
                  >
                    {selected.type}
                  </span>
                  {selected.productLines.map((pl) => (
                    <span
                      key={pl}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${pl === "Commercial" ? "bg-blue-50 text-blue-700 border-blue-200" : pl === "Medicaid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-violet-50 text-violet-700 border-violet-200"}`}
                    >
                      {pl}
                    </span>
                  ))}
                </div>
                <h2 className="text-base font-bold text-foreground leading-tight">
                  {selected.name}
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {selected.domain} · {selected.category}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                  NCQA Source
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50 flex-wrap">
              {[
                {
                  label: "Age Range",
                  value: `${selected.eligibility.ageMin}–${selected.eligibility.ageMax} yrs`,
                },
                { label: "Measurement Year", value: selected.measurementYear },
                { label: "Version", value: selected.version },
                {
                  label: "Enrollment Gap",
                  value: selected.eligibility.enrollmentGap,
                },
                {
                  label: "Gender",
                  value:
                    selected.eligibility.gender.split(" ")[0] === "No"
                      ? "All"
                      : selected.eligibility.gender.split(" ")[0],
                },
                {
                  label: "Exclusion Count",
                  value: `${selected.exclusions.length} categories`,
                },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">
                    {s.label}:
                  </span>
                  <span className="text-[11px] font-bold text-foreground">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Intent */}
            <div className="flex items-start gap-2 mt-3 p-2.5 bg-card/60 rounded-lg border border-border/60">
              <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-foreground line-clamp-2">
                {selected.intent}
              </p>
            </div>
          </div>

          {/* TABS */}
          <div className="flex-shrink-0 border-b border-border bg-card flex items-center px-5 overflow-x-auto">
            {TAB_META.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content (scrollable) */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === "eligibility" && <TabEligibility m={selected} />}
            {activeTab === "denominator" && <TabDenominator m={selected} />}
            {activeTab === "numerator" && <TabNumerator m={selected} />}
            {activeTab === "exclusions" && <TabExclusions m={selected} />}
            {activeTab === "documentation" && <TabDocumentation m={selected} />}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-border bg-card px-5 py-2.5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Last Updated: {selected.lastUpdated}
              </span>
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                Version: {selected.version}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Source: {selected.source}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
                View on NCQA.org
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
