import { useState, useRef, useEffect } from "react";
import type { ElementType, ReactNode } from "react";
import {
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Stethoscope,
  FlaskConical,
  Activity,
  ScanLine,
  Pill,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MinusCircle,
  XCircle,
  User,
  Shield,
  Sparkles,
  X,
  Check,
  Edit3,
  Send,
  ClipboardCheck,
  AlertCircle,
  Eye,
  Download,
  RefreshCw,
  Zap,
  ArrowRight,
  Info,
  Star,
  Tag,
  Filter,
  ToggleLeft,
  ToggleRight,
  Microscope,
  Heart,
  FileSearch,
  Upload,
  ArrowLeft,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type MeasureStatus = "complete" | "pending" | "gap" | "not-eligible";
type EventType =
  | "encounter"
  | "lab"
  | "vitals"
  | "imaging"
  | "medication"
  | "document";
type MeasureId = "CBP" | "HbA1c" | "BCS" | "COL" | "CIS";

interface TimelineEvent {
  id: string;
  date: string;
  shortDate: string;
  type: EventType;
  title: string;
  subtitle: string;
  provider: string;
  value?: string;
  valueUnit?: string;
  hedisRelevant: boolean;
  hedisTag?: string;
  closesGap?: boolean;
  source: "emr" | "uploaded" | "nlp";
  confidence?: number;
  cptCode?: string;
  icdCode?: string;
  docPreview?: string;
  extractedFields?: { label: string; value: string }[];
}

interface TimelineMonth {
  month: string;
  events: TimelineEvent[];
}
interface TimelineYear {
  year: string;
  months: TimelineMonth[];
}

/* ─────────────────────────────────────────────────────────────
   PALETTE
───────────────────────────────────────────────────────────── */
const EVENT_META: Record<
  EventType,
  {
    icon: ElementType;
    color: string;
    bg: string;
    border: string;
    label: string;
  }
> = {
  encounter: {
    icon: Stethoscope,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    label: "Encounter",
  },
  lab: {
    icon: FlaskConical,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "Lab Result",
  },
  vitals: {
    icon: Activity,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
    label: "Vitals",
  },
  imaging: {
    icon: ScanLine,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    label: "Imaging",
  },
  medication: {
    icon: Pill,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "Medication",
  },
  document: {
    icon: Upload,
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    label: "Document",
  },
};

const MEASURE_STATUS_META: Record<
  MeasureStatus,
  { label: string; dot: string; pill: string; icon: ElementType }
> = {
  complete: {
    label: "Complete",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-300",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    dot: "bg-amber-400",
    pill: "bg-amber-50 text-amber-700 border-amber-300",
    icon: Clock,
  },
  gap: {
    label: "Gap",
    dot: "bg-red-500",
    pill: "bg-red-50 text-red-700 border-red-300",
    icon: AlertTriangle,
  },
  "not-eligible": {
    label: "Not Eligible",
    dot: "bg-slate-300",
    pill: "bg-slate-50 text-slate-500 border-slate-200",
    icon: MinusCircle,
  },
};

/* ─────────────────────────────────────────────────────────────
   PATIENT & MEASURE DATA
───────────────────────────────────────────────────────────── */
const PATIENT = {
  name: "Gonzalez, Maria L.",
  dob: "03/14/1967",
  age: 58,
  gender: "Female",
  memberId: "MBR-789456",
  pcp: "Dr. Sarah Chen, MD",
  plan: "Medicare Advantage",
  riskScore: 2.4,
  lastVisit: "Jan 18, 2026",
  address: "Phoenix, AZ 85001",
  phone: "(602) 555-0142",
};

const MEASURES: { id: MeasureId; name: string; status: MeasureStatus }[] = [
  { id: "CBP", name: "Controlling Blood Pressure", status: "gap" },
  { id: "HbA1c", name: "HbA1c Testing (CDC)", status: "complete" },
  { id: "BCS", name: "Breast Cancer Screening", status: "pending" },
  { id: "COL", name: "Colorectal Screening", status: "gap" },
  { id: "CIS", name: "Child Immunization Status", status: "not-eligible" },
];

interface MeasureDetail {
  eligibility: { label: string; met: boolean; note: string }[];
  numerator: { label: string; met: boolean; note: string }[];
  missing: { text: string; severity: "high" | "medium" | "low" }[];
  lastAction?: string;
}

const MEASURE_DETAIL: Record<MeasureId, MeasureDetail> = {
  CBP: {
    eligibility: [
      { label: "Age 18–85", met: true, note: "Age 58 — qualifies" },
      {
        label: "HTN Diagnosis (ICD I10)",
        met: true,
        note: "Dx confirmed Jul 2023",
      },
      { label: "Continuous Enrollment", met: true, note: "Full MY coverage" },
    ],
    numerator: [
      {
        label: "BP Reading < 140/90",
        met: false,
        note: "Last reading: 142/90 (Nov 10)",
      },
      {
        label: "Reading in MY Window",
        met: true,
        note: "Jan 18 reading present",
      },
      {
        label: "Controlled BP < 140/90",
        met: false,
        note: "Jan 18: 138/88 — borderline",
      },
    ],
    missing: [
      {
        text: "Most recent BP (138/88, Jan 18) is borderline — verify measurement accuracy",
        severity: "high",
      },
      { text: "No second confirmatory reading in MY", severity: "medium" },
    ],
    lastAction: "Reviewed by R. Gupta · Feb 20, 2026",
  },
  HbA1c: {
    eligibility: [
      { label: "Age 18–75", met: true, note: "Age 58 — qualifies" },
      { label: "Diabetes Diagnosis", met: true, note: "Type 2 DM — E11.9" },
      { label: "Continuous Enrollment", met: true, note: "Full MY coverage" },
    ],
    numerator: [
      {
        label: "HbA1c Test Performed",
        met: true,
        note: "CPT 83036 — Jan 18, 2026",
      },
      { label: "Result Documented", met: true, note: "Value: 7.2%" },
      {
        label: "Within Measurement Year",
        met: true,
        note: "Jan 1 – Dec 31, 2026",
      },
    ],
    missing: [],
    lastAction: "Closed by AI Engine · Jan 18, 2026 · Accepted by S. Johnson",
  },
  BCS: {
    eligibility: [
      { label: "Female, Age 50–74", met: true, note: "F, Age 58 — qualifies" },
      { label: "Continuous Enrollment", met: true, note: "Full MY coverage" },
      {
        label: "No Bilateral Mastectomy",
        met: true,
        note: "No exclusion found",
      },
    ],
    numerator: [
      {
        label: "Mammogram Found",
        met: false,
        note: "No valid claim in lookback",
      },
      { label: "Service Date Valid", met: false, note: "N/A — no mammogram" },
      {
        label: "CPT 77067 / 77066",
        met: false,
        note: "No matching CPT in record",
      },
    ],
    missing: [
      {
        text: "No mammogram screening found in 24-month lookback (Jan 2024 – Dec 2025)",
        severity: "high",
      },
      {
        text: "Check external records — patient reported mammogram at external facility",
        severity: "high",
      },
      {
        text: "Contact Phoenix Imaging Center to request records",
        severity: "medium",
      },
    ],
    lastAction: "Flagged by AI Engine · Feb 22, 2026 — Awaiting chart chase",
  },
  COL: {
    eligibility: [
      { label: "Age 45–75", met: true, note: "Age 58 — qualifies" },
      { label: "Continuous Enrollment", met: true, note: "Full MY coverage" },
      { label: "No Colorectal Cancer", met: true, note: "No exclusion found" },
    ],
    numerator: [
      {
        label: "Colonoscopy (within 10y)",
        met: false,
        note: "No colonoscopy in record",
      },
      { label: "FIT Test (within 1y)", met: false, note: "No FIT in record" },
      {
        label: "Stool DNA (within 3y)",
        met: false,
        note: "No Cologuard found",
      },
    ],
    missing: [
      {
        text: "No colorectal cancer screening method found in record",
        severity: "high",
      },
      {
        text: "Patient eligible for FIT, Cologuard, or Colonoscopy",
        severity: "high",
      },
    ],
    lastAction: "Priority flagged by System · Feb 18, 2026",
  },
  CIS: {
    eligibility: [
      {
        label: "Age 0–2 Required",
        met: false,
        note: "Patient age 58 — excluded",
      },
      {
        label: "Continuous Enrollment",
        met: true,
        note: "N/A for this age group",
      },
    ],
    numerator: [],
    missing: [],
    lastAction: "Auto-excluded · Age criterion not met",
  },
};

/* ─────────────────────────────────────────────────────────────
   TIMELINE DATA
───────────────────────────────────────────────────────────── */
const TIMELINE: TimelineYear[] = [
  {
    year: "2026",
    months: [
      {
        month: "January",
        events: [
          {
            id: "e1",
            date: "January 18, 2026",
            shortDate: "Jan 18",
            type: "encounter",
            title: "Annual Wellness Visit",
            subtitle: "Office Visit · 45 min",
            provider: "Dr. Sarah Chen, MD — AZ Primary Care",
            value: "BP 138/88",
            valueUnit: "mmHg",
            hedisRelevant: true,
            hedisTag: "CBP — Borderline",
            closesGap: false,
            source: "emr",
            cptCode: "G0439",
            icdCode: "I10, E11.9, Z00.00",
            docPreview:
              "OFFICE VISIT NOTE\nPatient: Maria L. Gonzalez\nDate: January 18, 2026\nProvider: Dr. Sarah Chen, MD\n\nChief Complaint: Annual wellness examination.\n\nVitals:\n  Blood Pressure: 138/88 mmHg\n  Heart Rate: 72 bpm\n  Weight: 167 lbs\n  BMI: 28.4\n\nAssessment:\n  1. Essential hypertension (I10) — borderline controlled\n  2. Type 2 diabetes mellitus (E11.9) — HbA1c ordered\n  3. Preventive care — mammogram referral discussed\n\nPlan:\n  - Continue Lisinopril 10mg daily\n  - Refer to Phoenix Imaging for mammogram\n  - Follow up in 3 months",
            extractedFields: [
              { label: "Visit Type", value: "Annual Wellness (G0439)" },
              { label: "Blood Pressure", value: "138/88 mmHg" },
              { label: "Diagnoses", value: "I10, E11.9, Z00.00" },
              { label: "Provider NPI", value: "NPI-1234567890" },
              { label: "HEDIS Mapping", value: "CBP — Needs Confirmation" },
            ],
            confidence: 88,
          },
          {
            id: "e2",
            date: "January 18, 2026",
            shortDate: "Jan 18",
            type: "lab",
            title: "HbA1c — Lab Result",
            subtitle: "EMR Lab Integration",
            provider: "Quest Diagnostics (via Dr. Chen)",
            value: "7.2%",
            valueUnit: "HbA1c",
            hedisRelevant: true,
            hedisTag: "CDC — HbA1c ✓",
            closesGap: true,
            source: "emr",
            cptCode: "83036",
            docPreview:
              "LABORATORY REPORT\nPatient: Maria L. Gonzalez  MBR-789456\nDate Collected: January 18, 2026\nDate Reported:  January 18, 2026\nOrdering Provider: Dr. Sarah Chen, MD\nLaboratory: Quest Diagnostics\n\nRESULT SUMMARY\n──────────────────────────────────────\nTest Name          Result    Ref Range\nHemoglobin A1c     7.2%   L  <5.7% (Normal)\n                            5.7–6.4% (Pre-DM)\n                            ≥6.5% (DM)\n\nCPT Code: 83036\nLOINC: 4548-4\n\nFLAGS: Elevated — consistent with Type 2 DM\nClinical Note: Improved from 7.8% (Dec 2024).",
            extractedFields: [
              { label: "Test Name", value: "Hemoglobin A1c (CPT 83036)" },
              { label: "Result Value", value: "7.2%" },
              { label: "Date of Service", value: "January 18, 2026" },
              { label: "Ordering Provider", value: "Dr. Sarah Chen, MD" },
              { label: "Laboratory", value: "Quest Diagnostics" },
              {
                label: "HEDIS Mapping",
                value: "CDC — HbA1c Testing ✓ CLOSES GAP",
              },
            ],
            confidence: 97,
          },
          {
            id: "e3",
            date: "January 15, 2026",
            shortDate: "Jan 15",
            type: "vitals",
            title: "Vitals Check",
            subtitle: "Nurse Visit",
            provider: "AZ Primary Care — Nursing Staff",
            value: "BMI 28.4",
            valueUnit: "",
            hedisRelevant: false,
            source: "emr",
            confidence: 99,
            docPreview:
              "VITALS RECORDING\nDate: Jan 15, 2026\nWeight: 167 lbs | Height: 5'5\" | BMI: 28.4\nBP: 140/88 | HR: 74 | SpO2: 98%",
            extractedFields: [
              { label: "Weight", value: "167 lbs" },
              { label: "BMI", value: "28.4" },
              { label: "BP", value: "140/88 mmHg" },
            ],
          },
        ],
      },
    ],
  },
  {
    year: "2025",
    months: [
      {
        month: "November",
        events: [
          {
            id: "e4",
            date: "November 22, 2025",
            shortDate: "Nov 22",
            type: "medication",
            title: "Lisinopril 10mg — Renewed",
            subtitle: "E-Prescribe via EHR",
            provider: "Dr. Sarah Chen, MD",
            value: "Lisinopril 10mg",
            valueUnit: "QD x 90d",
            hedisRelevant: false,
            source: "emr",
            docPreview:
              "PRESCRIPTION RECORD\nMedication: Lisinopril 10mg Tablet\nDays Supply: 90\nRefills: 3 remaining\nPrescriber: Dr. Sarah Chen",
            extractedFields: [
              { label: "Drug", value: "Lisinopril 10mg" },
              { label: "Frequency", value: "Once daily (QD)" },
              { label: "Days Supply", value: "90 days" },
            ],
            confidence: 100,
          },
          {
            id: "e5",
            date: "November 10, 2025",
            shortDate: "Nov 10",
            type: "encounter",
            title: "HTN Follow-up Visit",
            subtitle: "Office Visit · 20 min",
            provider: "Dr. James Park, MD — AZ Primary Care",
            value: "BP 142/90",
            valueUnit: "mmHg",
            hedisRelevant: true,
            hedisTag: "CBP — Elevated",
            source: "emr",
            cptCode: "99213",
            icdCode: "I10",
            docPreview:
              "OFFICE VISIT NOTE\nDate: November 10, 2025\nProvider: Dr. James Park, MD\n\nReason: Hypertension follow-up\nVitals: BP 142/90 mmHg\n\nPlan: Increase monitoring, continue Lisinopril.",
            extractedFields: [
              { label: "Visit Type", value: "Follow-up (99213)" },
              { label: "Blood Pressure", value: "142/90 mmHg — Elevated" },
              { label: "Diagnosis", value: "Essential Hypertension (I10)" },
            ],
            confidence: 91,
          },
        ],
      },
      {
        month: "October",
        events: [
          {
            id: "e6",
            date: "October 5, 2025",
            shortDate: "Oct 5",
            type: "imaging",
            title: "Chest X-Ray (PA/Lateral)",
            subtitle: "Radiology — Banner Health",
            provider: "Dr. Anita Patel, Radiologist",
            value: "Normal",
            valueUnit: "",
            hedisRelevant: false,
            source: "emr",
            docPreview:
              "RADIOLOGY REPORT\nExam: Chest X-Ray PA/Lateral\nDate: October 5, 2025\nImpression: No acute cardiopulmonary process.",
            extractedFields: [
              { label: "Exam Type", value: "Chest X-Ray (CPT 71046)" },
              { label: "Impression", value: "No acute findings" },
              { label: "Radiologist", value: "Dr. Anita Patel" },
            ],
            confidence: 99,
          },
        ],
      },
      {
        month: "August",
        events: [
          {
            id: "e7",
            date: "August 14, 2025",
            shortDate: "Aug 14",
            type: "lab",
            title: "Lipid Panel",
            subtitle: "EMR Lab Integration",
            provider: "LabCorp (via Dr. Chen)",
            value: "LDL 128",
            valueUnit: "mg/dL",
            hedisRelevant: false,
            source: "emr",
            docPreview:
              "LABORATORY REPORT\nDate: August 14, 2025\nLipid Panel:\n  Total Cholesterol: 210 mg/dL\n  LDL: 128 mg/dL (Borderline High)\n  HDL: 52 mg/dL\n  Triglycerides: 148 mg/dL",
            extractedFields: [
              { label: "Total Cholesterol", value: "210 mg/dL" },
              { label: "LDL", value: "128 mg/dL" },
              { label: "HDL", value: "52 mg/dL" },
              { label: "Triglycerides", value: "148 mg/dL" },
            ],
            confidence: 99,
          },
        ],
      },
      {
        month: "June",
        events: [
          {
            id: "e8",
            date: "June 28, 2025",
            shortDate: "Jun 28",
            type: "encounter",
            title: "Preventive Care Visit",
            subtitle: "Office Visit · 30 min",
            provider: "Dr. Sarah Chen, MD",
            value: "BP 136/84",
            valueUnit: "mmHg",
            hedisRelevant: true,
            hedisTag: "BCS — Mammogram Discussed",
            source: "emr",
            cptCode: "G0438",
            icdCode: "Z00.00",
            docPreview:
              "PREVENTIVE VISIT NOTE\nDate: June 28, 2025\nProvider: Dr. Sarah Chen, MD\n\nDiscussed: Breast cancer screening. Patient states she had mammogram 2 years ago at external facility. Referral ordered.",
            extractedFields: [
              { label: "Visit Type", value: "Preventive Care (G0438)" },
              { label: "Blood Pressure", value: "136/84 mmHg" },
              {
                label: "BCS Note",
                value: "Patient reports external mammogram — records requested",
              },
            ],
            confidence: 85,
          },
          {
            id: "e9",
            date: "June 28, 2025",
            shortDate: "Jun 28",
            type: "document",
            title: "External Records Uploaded",
            subtitle: "Chart Chase — Phoenix Imaging",
            provider: "Uploaded by: R. Gupta (Abstractor)",
            value: "3 pages",
            valueUnit: "",
            hedisRelevant: true,
            hedisTag: "BCS — Under Review",
            source: "uploaded",
            docPreview:
              "EXTERNAL MEDICAL RECORDS\nFacility: Phoenix Imaging Center\nPatient: Maria Gonzalez  DOB: 03/14/1967\n\nRecords Requested: Mammography\nDate Requested: June 28, 2025\n\n[DOCUMENT CONTENT PENDING REVIEW]\nNote: Records received — no mammogram report found in this packet. Additional request may be needed.",
            extractedFields: [
              { label: "Source Facility", value: "Phoenix Imaging Center" },
              { label: "Request Date", value: "June 28, 2025" },
              { label: "Document Status", value: "Received — Under Review" },
              {
                label: "Mammogram Found",
                value: "Not confirmed in this batch",
              },
            ],
            confidence: 60,
          },
        ],
      },
    ],
  },
  {
    year: "2024",
    months: [
      {
        month: "December",
        events: [
          {
            id: "e10",
            date: "December 12, 2024",
            shortDate: "Dec 12",
            type: "lab",
            title: "HbA1c — Prior Year",
            subtitle: "EMR Lab Integration",
            provider: "Quest Diagnostics (via Dr. Chen)",
            value: "7.8%",
            valueUnit: "HbA1c",
            hedisRelevant: true,
            hedisTag: "CDC — Prior Year Reference",
            source: "emr",
            cptCode: "83036",
            docPreview:
              "LABORATORY REPORT\nDate: December 12, 2024\nHbA1c: 7.8% (Elevated)\nNote: Prior year result — not in current MY window.",
            extractedFields: [
              { label: "Test", value: "Hemoglobin A1c (CPT 83036)" },
              { label: "Result", value: "7.8%" },
              {
                label: "MY Eligibility",
                value: "Prior year — not applicable to MY2026",
              },
            ],
            confidence: 97,
          },
        ],
      },
      {
        month: "September",
        events: [
          {
            id: "e11",
            date: "September 3, 2024",
            shortDate: "Sep 3",
            type: "encounter",
            title: "Annual Wellness Visit",
            subtitle: "Office Visit — No mammogram noted",
            provider: "Dr. Sarah Chen, MD",
            value: "BCS Gap",
            valueUnit: "",
            hedisRelevant: true,
            hedisTag: "BCS — No Mammogram",
            source: "emr",
            cptCode: "G0439",
            docPreview:
              "OFFICE VISIT NOTE\nDate: September 3, 2024\nProvider: Dr. Sarah Chen, MD\n\nPreventive care visit. Patient declined mammogram referral at this visit. No mammogram documentation present.",
            extractedFields: [
              { label: "Visit Type", value: "Annual Wellness (G0439)" },
              {
                label: "Mammogram",
                value: "Not ordered / declined by patient",
              },
              {
                label: "HEDIS Note",
                value: "BCS — No valid screening documented",
              },
            ],
            confidence: 82,
          },
        ],
      },
      {
        month: "March",
        events: [
          {
            id: "e12",
            date: "March 15, 2024",
            shortDate: "Mar 15",
            type: "medication",
            title: "Metformin 1000mg — Adjusted",
            subtitle: "Medication Adjustment",
            provider: "Dr. Sarah Chen, MD",
            value: "Metformin 1000mg",
            valueUnit: "BID",
            hedisRelevant: false,
            source: "emr",
            docPreview:
              "PRESCRIPTION RECORD\nMedication: Metformin 1000mg\nInstructions: Twice daily with meals\nPrescriber: Dr. Sarah Chen, MD",
            extractedFields: [
              { label: "Drug", value: "Metformin 1000mg" },
              { label: "Frequency", value: "Twice daily (BID)" },
            ],
            confidence: 100,
          },
        ],
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */

/* ── Measure Status Badge ── */
function MeasureBadge({
  id,
  name,
  status,
  selected,
  onClick,
}: {
  id: MeasureId;
  name: string;
  status: MeasureStatus;
  selected?: boolean;
  onClick?: () => void;
}) {
  const m = MEASURE_STATUS_META[status];
  const Icon = m.icon;
  return (
    <button
      onClick={onClick}
      title={name}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all
        ${selected ? "ring-2 ring-primary ring-offset-1" : "hover:opacity-80"}
        ${m.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${m.dot}`} />
      {id}
      <Icon className="w-3 h-3" />
    </button>
  );
}

/* ── Confidence Bar ── */
function ConfidenceBar({ score }: { score: number }) {
  const color =
    score >= 90
      ? "bg-emerald-500"
      : score >= 70
        ? "bg-amber-500"
        : "bg-red-500";
  const label = score >= 90 ? "High" : score >= 70 ? "Medium" : "Low";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span
        className={`text-[10px] font-bold ${score >= 90 ? "text-emerald-600" : score >= 70 ? "text-amber-600" : "text-red-600"}`}
      >
        {score}% {label}
      </span>
    </div>
  );
}

/* ── Source Tag ── */
function SourceTag({ source }: { source: "emr" | "uploaded" | "nlp" }) {
  const cfg = {
    emr: { label: "EMR", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    uploaded: {
      label: "Uploaded",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    nlp: {
      label: "AI/NLP",
      cls: "bg-violet-50 text-violet-700 border-violet-200",
    },
  }[source];
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wide ${cfg.cls}`}
    >
      {source === "nlp" && <Sparkles className="w-2.5 h-2.5" />}
      {cfg.label}
    </span>
  );
}

/* ── Timeline Event Card ── */
function EventCard({
  event,
  selected,
  onClick,
}: {
  event: TimelineEvent;
  selected: boolean;
  onClick: () => void;
}) {
  const m = EVENT_META[event.type];
  const Icon = m.icon;
  return (
    <div
      onClick={onClick}
      className={`relative ml-8 cursor-pointer rounded-xl border transition-all group
        ${
          selected
            ? "border-primary bg-primary/5 shadow-md"
            : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
        }`}
    >
      {/* Timeline dot */}
      <div
        className={`absolute -left-[29px] top-4 w-4 h-4 rounded-full border-2 flex items-center justify-center
        ${selected ? "border-primary bg-primary" : `border-border bg-card group-hover:border-primary/60`}`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full ${selected ? "bg-white" : m.color.replace("text-", "bg-")}`}
        />
      </div>

      <div className="p-3 flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.bg} ${m.border} border`}
        >
          <Icon className={`w-4 h-4 ${m.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-foreground leading-tight truncate">
                {event.title}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {event.subtitle}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-[10px] text-muted-foreground">
                {event.shortDate}
              </span>
              <SourceTag source={event.source} />
            </div>
          </div>

          {/* Value + HEDIS tag */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {event.value && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${m.bg} ${m.border} ${m.color}`}
              >
                {event.value} {event.valueUnit}
              </span>
            )}
            {event.hedisRelevant && event.hedisTag && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold
                ${
                  event.closesGap
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                <Tag className="w-2.5 h-2.5" />
                {event.hedisTag}
              </span>
            )}
          </div>

          <p className="text-[10px] text-muted-foreground mt-1 truncate">
            {event.provider}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EVIDENCE DRAWER
───────────────────────────────────────────────────────────── */
function EvidenceDrawer({
  event,
  onClose,
  onAccept,
  onReject,
}: {
  event: TimelineEvent;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  const m = EVENT_META[event.type];
  const Icon = m.icon;
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 h-[55%] flex flex-col bg-card border-t-2 border-primary shadow-2xl">
      {/* Drawer handle / header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-primary/5 flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.bg} border ${m.border}`}
        >
          <Icon className={`w-4 h-4 ${m.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-foreground">
            Evidence Review: {event.title}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {event.date} · {event.provider}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {event.source === "nlp" || event.confidence ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> AI Suggested
            </span>
          ) : null}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drawer body */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Document Preview */}
        <div className="w-1/2 border-r border-border overflow-y-auto p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Document Preview
            </p>
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Simulated document */}
          <div className="flex-1 bg-white border border-border rounded-xl p-4 font-mono text-[10px] leading-relaxed text-slate-700 overflow-y-auto shadow-inner">
            {event.docPreview?.split("\n").map((line, i) => {
              const isHeader = i === 0;
              const isDivider = line.startsWith("──");
              const isKeyVal = line.includes(":") && !isDivider;
              const highlight =
                event.closesGap &&
                (line.includes("HbA1c") ||
                  line.includes("Mammogram") ||
                  line.includes("CPT"));
              return (
                <div
                  key={i}
                  className={`${isHeader ? "font-bold text-slate-900 text-[11px] mb-2" : ""}
                    ${isDivider ? "text-slate-300 my-1" : ""}
                    ${highlight ? "bg-yellow-100 border-l-2 border-yellow-400 pl-1 rounded" : ""}
                  `}
                >
                  {line || <br />}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — Extracted Evidence */}
        <div className="w-1/2 overflow-y-auto p-4 flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Extracted Evidence
            </p>

            {/* Extracted fields */}
            <div className="space-y-2">
              {event.extractedFields?.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 py-1.5 border-b border-border/50 last:border-0"
                >
                  <span className="text-[10px] text-muted-foreground w-28 flex-shrink-0 pt-0.5">
                    {f.label}
                  </span>
                  <span
                    className={`text-[11px] font-semibold flex-1
                    ${f.label.includes("HEDIS") || f.label.includes("GAP") ? "text-primary" : "text-foreground"}`}
                  >
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence score */}
          {event.confidence && (
            <div className="border border-border rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold text-foreground">
                  AI Confidence Score
                </p>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full
                  ${event.confidence >= 90 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                >
                  {event.confidence >= 90 ? "High" : "Medium"}
                </span>
              </div>
              <ConfidenceBar score={event.confidence} />
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Extracted by NLP engine · Review recommended before acceptance
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onAccept}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-[12px] font-bold hover:bg-emerald-700 transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Accept
            </button>
            <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-foreground text-[12px] font-bold hover:bg-muted transition-colors">
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={onReject}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-[12px] font-bold hover:bg-red-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Reject
            </button>
          </div>

          {/* Footer */}
          <div className="border-t border-border pt-3 mt-auto">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <User className="w-3 h-3" />
              <span>
                Abstractor:{" "}
                <strong className="text-foreground">S. Johnson</strong>
              </span>
              <span>·</span>
              <Clock className="w-3 h-3" />
              <span>Feb 24, 2026 · 12:43 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LEFT FILTER PANEL
───────────────────────────────────────────────────────────── */
const DOC_TYPES: { type: EventType; label: string }[] = [
  { type: "encounter", label: "Encounter" },
  { type: "lab", label: "Lab Result" },
  { type: "vitals", label: "Vitals" },
  { type: "imaging", label: "Imaging" },
  { type: "medication", label: "Medication" },
  { type: "document", label: "Document" },
];

function FilterPanel({
  filters,
  onChange,
}: {
  filters: {
    search: string;
    hedisOnly: boolean;
    structuredOnly: boolean;
    docTypes: Set<EventType>;
    encounterType: string;
    provider: string;
  };
  onChange: (f: typeof filters) => void;
}) {
  const toggle = (type: EventType) => {
    const s = new Set(filters.docTypes);
    s.has(type) ? s.delete(type) : s.add(type);
    onChange({ ...filters, docTypes: s });
  };

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search timeline..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-8 pr-3 py-2 text-[12px] border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Date Range */}
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Date Range
        </p>
        <div className="space-y-1.5">
          <input
            type="date"
            className="w-full px-3 py-1.5 text-[11px] border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="date"
            className="w-full px-3 py-1.5 text-[11px] border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Document Type */}
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Document Type
        </p>
        <div className="space-y-1.5">
          {DOC_TYPES.map(({ type, label }) => {
            const m = EVENT_META[type];
            const Icon = m.icon;
            const checked = filters.docTypes.has(type);
            return (
              <label
                key={type}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(type)}
                  className="w-3.5 h-3.5 rounded accent-primary"
                />
                <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                <span className="text-[11px] text-foreground group-hover:text-primary transition-colors">
                  {label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Encounter Type */}
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Encounter Type
        </p>
        <select
          value={filters.encounterType}
          onChange={(e) =>
            onChange({ ...filters, encounterType: e.target.value })
          }
          className="w-full px-3 py-1.5 text-[11px] border border-border rounded-lg bg-background text-foreground focus:outline-none appearance-none"
        >
          {[
            "All Encounters",
            "Office Visit",
            "Telehealth",
            "Emergency",
            "Inpatient",
            "Procedure",
          ].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* Provider */}
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Provider
        </p>
        <select
          value={filters.provider}
          onChange={(e) => onChange({ ...filters, provider: e.target.value })}
          className="w-full px-3 py-1.5 text-[11px] border border-border rounded-lg bg-background text-foreground focus:outline-none appearance-none"
        >
          {[
            "All Providers",
            "Dr. Sarah Chen",
            "Dr. James Park",
            "Dr. Anita Patel",
          ].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* Toggles */}
      <div className="space-y-2 border-t border-border pt-3">
        {[
          {
            label: "HEDIS-Relevant Only",
            key: "hedisOnly",
            val: filters.hedisOnly,
          },
          {
            label: "Structured Data Only",
            key: "structuredOnly",
            val: filters.structuredOnly,
          },
        ].map(({ label, key, val }) => (
          <button
            key={key}
            onClick={() => onChange({ ...filters, [key]: !val })}
            className="w-full flex items-center justify-between gap-2 text-[11px] font-medium text-foreground hover:text-primary transition-colors"
          >
            <span>{label}</span>
            {val ? (
              <ToggleRight className="w-5 h-5 text-primary" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        ))}
      </div>

      {/* Clear filters */}
      <button
        onClick={() =>
          onChange({
            search: "",
            hedisOnly: false,
            structuredOnly: false,
            docTypes: new Set(DOC_TYPES.map((d) => d.type)),
            encounterType: "All Encounters",
            provider: "All Providers",
          })
        }
        className="text-[11px] font-semibold text-muted-foreground hover:text-foreground underline underline-offset-2 text-left"
      >
        Clear all filters
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   GO TO WORKSPACE BUTTON (self-contained)
───────────────────────────────────────────────────────────── */
function GoToWorkspaceButton({
  onDone,
  onOpenWorkspace,
}: {
  onDone: () => void;
  onOpenWorkspace: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "navigating" | "done">("idle");

  const handleClick = () => {
    if (phase !== "idle") return;
    setPhase("navigating");
    setTimeout(() => {
      setPhase("done");
      setTimeout(() => {
        onDone();
        onOpenWorkspace();
      }, 700);
    }, 1000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={phase !== "idle"}
      className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
        phase === "done"
          ? "bg-emerald-800 text-white scale-95"
          : phase === "navigating"
            ? "bg-emerald-700 text-white cursor-wait"
            : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"
      }`}
    >
      {phase === "navigating" ? (
        <>
          <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          Launching…
        </>
      ) : phase === "done" ? (
        <>
          <CheckCircle2 className="w-3 h-3" /> Workspace Launched
        </>
      ) : (
        <>
          <ArrowRight className="w-3 h-3" /> Go to Workspace
        </>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   OPEN ABSTRACTION BUTTON (self-contained)
───────────────────────────────────────────────────────────── */
function OpenAbstractionButton({
  onOpenWorkspace,
}: {
  onOpenWorkspace: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "loading" | "open">("idle");

  const handleClick = () => {
    if (phase !== "idle") return;
    setPhase("loading");
    setTimeout(() => setPhase("open"), 900);
  };

  const handleClose = () => setPhase("idle");

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={phase === "loading"}
        className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[12px] font-bold transition-all duration-200 shadow-sm ${
          phase === "open"
            ? "bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600"
            : phase === "loading"
              ? "bg-[#0891b2]/60 text-white cursor-wait shadow-none"
              : "bg-[#0891b2] text-white shadow-[#0891b2]/30 hover:bg-[#0e7490] hover:shadow-md active:scale-[0.98]"
        }`}
      >
        {phase === "loading" ? (
          <>
            <svg
              className="w-3.5 h-3.5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Opening…
          </>
        ) : phase === "open" ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" /> Abstraction Open
          </>
        ) : (
          <>
            <ClipboardCheck className="w-3.5 h-3.5" /> Open Abstraction
          </>
        )}
      </button>

      {phase === "open" && (
        <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-bold text-emerald-800">
                Abstraction Workspace Ready
              </span>
            </div>
            <button
              onClick={handleClose}
              className="text-emerald-500 hover:text-emerald-700 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[10px] text-emerald-700 leading-snug">
            Chart <span className="font-mono font-bold">CHT-2024-00892</span>{" "}
            has been loaded into the abstraction workspace. Review all flagged
            evidence before submitting.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-lg bg-white border border-emerald-200 px-2 py-1.5 text-center">
              <p className="text-[9px] text-emerald-600 font-semibold uppercase tracking-wider">
                Evidence Items
              </p>
              <p className="text-[14px] font-bold text-emerald-800">7</p>
            </div>
            <div className="rounded-lg bg-white border border-emerald-200 px-2 py-1.5 text-center">
              <p className="text-[9px] text-emerald-600 font-semibold uppercase tracking-wider">
                Gaps to Close
              </p>
              <p className="text-[14px] font-bold text-emerald-800">2</p>
            </div>
          </div>
          <GoToWorkspaceButton
            onDone={handleClose}
            onOpenWorkspace={onOpenWorkspace}
          />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   RIGHT MEASURE PANEL
───────────────────────────────────────────────────────────── */
function MeasurePanel({
  selectedMeasure,
  onMeasureChange,
  onOpenWorkspace,
}: {
  selectedMeasure: MeasureId;
  onMeasureChange: (m: MeasureId) => void;
  onOpenWorkspace?: () => void;
}) {
  const measure = MEASURES.find((m) => m.id === selectedMeasure)!;
  const detail = MEASURE_DETAIL[selectedMeasure];
  const statusMeta = MEASURE_STATUS_META[measure.status];
  const StatusIcon = statusMeta.icon;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Measure tabs */}
      <div className="flex-shrink-0 border-b border-border bg-muted/30 p-2 flex flex-col gap-1">
        {MEASURES.map((m) => {
          const sm = MEASURE_STATUS_META[m.status];
          const Icon = sm.icon;
          const active = m.id === selectedMeasure;
          return (
            <button
              key={m.id}
              onClick={() => onMeasureChange(m.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all w-full
                ${active ? "bg-card border border-border shadow-sm" : "hover:bg-muted/50"}`}
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${sm.dot}`}
              />
              <span
                className={`text-[11px] font-bold flex-1 ${active ? "text-foreground" : "text-muted-foreground"}`}
              >
                {m.id}
              </span>
              <Icon
                className={`w-3 h-3 flex-shrink-0 ${active ? (sm.pill.includes("emerald") ? "text-emerald-600" : sm.pill.includes("amber") ? "text-amber-600" : sm.pill.includes("red") ? "text-red-600" : "text-slate-400") : "text-muted-foreground"}`}
              />
            </button>
          );
        })}
      </div>

      {/* Measure detail — scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status header */}
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${statusMeta.pill}`}
        >
          <StatusIcon className="w-4 h-4" />
          <div className="flex-1">
            <p className="text-[12px] font-bold">
              {measure.id} — {statusMeta.label}
            </p>
            <p className="text-[10px] opacity-80 leading-tight">
              {measure.name}
            </p>
          </div>
        </div>

        {/* Eligibility */}
        {detail.eligibility.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Eligibility
            </p>
            <div className="space-y-2">
              {detail.eligibility.map((e, i) => (
                <div key={i} className="flex items-start gap-2">
                  {e.met ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-[11px] font-semibold text-foreground">
                      {e.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {e.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Numerator */}
        {detail.numerator.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Numerator Status
            </p>
            <div className="space-y-2">
              {detail.numerator.map((n, i) => (
                <div key={i} className="flex items-start gap-2">
                  {n.met ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-[11px] font-semibold text-foreground">
                      {n.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {n.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Evidence */}
        {detail.missing.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Missing Evidence
            </p>
            <div className="space-y-2">
              {detail.missing.map((miss, i) => {
                const sevCls =
                  miss.severity === "high"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : miss.severity === "medium"
                      ? "bg-amber-50 border-amber-200 text-amber-700"
                      : "bg-slate-50 border-slate-200 text-slate-600";
                return (
                  <div
                    key={i}
                    className={`text-[10px] p-2 rounded-lg border leading-snug ${sevCls}`}
                  >
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    {miss.text}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Last action */}
        {detail.lastAction && (
          <div className="border-t border-border pt-3">
            <p className="text-[10px] text-muted-foreground italic">
              {detail.lastAction}
            </p>
          </div>
        )}

        {/* CTA Buttons */}
        {measure.status !== "not-eligible" && (
          <div className="border-t border-border pt-3 space-y-2">
            <OpenAbstractionButton
              onOpenWorkspace={onOpenWorkspace ?? (() => {})}
            />
            <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border text-foreground text-[12px] font-semibold hover:bg-muted transition-colors">
              <Eye className="w-3.5 h-3.5" /> Mark Reviewed
            </button>
            <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-primary/30 text-primary text-[12px] font-semibold hover:bg-primary/5 transition-colors">
              <Send className="w-3.5 h-3.5" /> Send to QA
            </button>
            <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-violet-200 text-violet-600 text-[12px] font-semibold hover:bg-violet-50 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Trigger Re-calculation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────���─────────────
   CENTER TIMELINE
───────────────────────────────────────────────────────────── */
function TimelineCenter({
  events,
  selectedEventId,
  onEventClick,
  filters,
}: {
  events: TimelineYear[];
  selectedEventId: string | null;
  onEventClick: (event: TimelineEvent) => void;
  filters: {
    search: string;
    hedisOnly: boolean;
    structuredOnly: boolean;
    docTypes: Set<EventType>;
    provider: string;
  };
}) {
  const [collapsedYears, setCollapsedYears] = useState<Set<string>>(new Set());

  const toggleYear = (y: string) => {
    const s = new Set(collapsedYears);
    s.has(y) ? s.delete(y) : s.add(y);
    setCollapsedYears(s);
  };

  const filterEvent = (e: TimelineEvent) => {
    if (
      filters.search &&
      !e.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !e.provider.toLowerCase().includes(filters.search.toLowerCase()) &&
      !e.value?.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    if (filters.hedisOnly && !e.hedisRelevant) return false;
    if (filters.structuredOnly && e.source === "uploaded") return false;
    if (!filters.docTypes.has(e.type)) return false;
    if (
      filters.provider !== "All Providers" &&
      !e.provider.includes(filters.provider.replace("Dr. ", ""))
    )
      return false;
    return true;
  };

  return (
    <div className="h-full overflow-y-auto px-5 py-4">
      {events.map((yearGroup) => {
        const collapsed = collapsedYears.has(yearGroup.year);
        return (
          <div key={yearGroup.year} className="mb-6">
            {/* Year header */}
            <button
              onClick={() => toggleYear(yearGroup.year)}
              className="flex items-center gap-2 w-full mb-3 group"
            >
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 rounded-full bg-primary text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0">
                  {yearGroup.year.slice(2)}
                </div>
                <span className="text-[14px] font-bold text-foreground">
                  {yearGroup.year}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {!collapsed &&
              yearGroup.months.map((monthGroup) => {
                const visibleEvents = monthGroup.events.filter(filterEvent);
                if (!visibleEvents.length) return null;
                return (
                  <div key={monthGroup.month} className="mb-5">
                    {/* Month header */}
                    <div className="flex items-center gap-2 mb-3 ml-4">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        {monthGroup.month} {yearGroup.year}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        ({visibleEvents.length} event
                        {visibleEvents.length !== 1 ? "s" : ""})
                      </span>
                    </div>

                    {/* Events */}
                    <div className="relative pl-4">
                      {/* Vertical timeline line */}
                      <div className="absolute left-[22px] top-0 bottom-0 w-px bg-border" />

                      <div className="space-y-2">
                        {visibleEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            selected={selectedEventId === event.id}
                            onClick={() => onEventClick(event)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PATIENT 360 ROOT
───────────────────────────────────────────────────────────── */
export function Patient360({
  onBack,
  onOpenWorkspace,
}: {
  onBack?: () => void;
  onOpenWorkspace?: () => void;
}) {
  const [selectedMeasure, setSelectedMeasure] = useState<MeasureId>("BCS");
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [acceptedEvents, setAcceptedEvents] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    search: "",
    hedisOnly: false,
    structuredOnly: false,
    docTypes: new Set(DOC_TYPES.map((d) => d.type)) as Set<EventType>,
    encounterType: "All Encounters",
    provider: "All Providers",
  });

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setDrawerOpen(true);
  };

  const handleAccept = () => {
    if (selectedEvent)
      setAcceptedEvents((s) => new Set([...s, selectedEvent.id]));
    setDrawerOpen(false);
    setSelectedEvent(null);
  };

  const handleReject = () => {
    setDrawerOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background relative">
      {/* ════════════════════════════════════════════════════════
          STICKY PATIENT HEADER
      ════════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 bg-card border-b border-border px-5 py-3">
        <div className="flex items-start justify-between gap-4">
          {/* Demographics */}
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex-shrink-0"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[15px] font-bold text-foreground">
                  {PATIENT.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full
                  ${PATIENT.riskScore >= 2 ? "bg-red-50 text-red-700 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}
                >
                  <Shield className="w-2.5 h-2.5" />
                  Risk {PATIENT.riskScore}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {[
                  `DOB: ${PATIENT.dob}`,
                  `Age ${PATIENT.age}`,
                  PATIENT.gender,
                  PATIENT.memberId,
                ].map((item, i) => (
                  <span key={i} className="text-[11px] text-muted-foreground">
                    {item}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                {[
                  { icon: User, val: PATIENT.pcp },
                  { icon: Star, val: PATIENT.plan },
                  { icon: Calendar, val: `Last Visit: ${PATIENT.lastVisit}` },
                ].map(({ icon: Icon, val }, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"
                  >
                    <Icon className="w-3 h-3" />
                    {val}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Measure badges */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              HEDIS Measures
            </p>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {MEASURES.map((m) => (
                <MeasureBadge
                  key={m.id}
                  {...m}
                  selected={selectedMeasure === m.id}
                  onClick={() => setSelectedMeasure(m.id)}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              {Object.entries(MEASURE_STATUS_META).map(([s, meta]) => (
                <span key={s} className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                  {meta.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          THREE-COLUMN BODY
      ════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT — Filter Panel */}
        <div className="w-52 flex-shrink-0 border-r border-border bg-background">
          <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Filters
            </span>
          </div>
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>

        {/* CENTER — Timeline */}
        <div className="flex-1 min-w-0 flex flex-col border-r border-border bg-background">
          {/* Timeline header */}
          <div className="flex-shrink-0 px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Clinical Timeline
              </span>
              <span className="text-[10px] text-muted-foreground">
                — Longitudinal record view
              </span>
            </div>
            <div className="flex items-center gap-2">
              {acceptedEvents.size > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> {acceptedEvents.size}{" "}
                  accepted
                </span>
              )}
              {filters.hedisOnly && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                  <Tag className="w-3 h-3" /> HEDIS filter active
                </span>
              )}
            </div>
          </div>

          <TimelineCenter
            events={TIMELINE}
            selectedEventId={selectedEvent?.id ?? null}
            onEventClick={handleEventClick}
            filters={filters}
          />
        </div>

        {/* RIGHT — Measure Panel */}
        <div className="w-64 flex-shrink-0 bg-background">
          <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
            <ClipboardCheck className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Measure Panel
            </span>
          </div>
          <div className="h-[calc(100%-45px)]">
            <MeasurePanel
              selectedMeasure={selectedMeasure}
              onMeasureChange={setSelectedMeasure}
              onOpenWorkspace={onOpenWorkspace}
            />
          </div>
        </div>

        {/* ── EVIDENCE DRAWER ── */}
        {drawerOpen && selectedEvent && (
          <>
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/20 z-20"
              onClick={() => setDrawerOpen(false)}
            />
            <EvidenceDrawer
              event={selectedEvent}
              onClose={() => {
                setDrawerOpen(false);
                setSelectedEvent(null);
              }}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          </>
        )}
      </div>
    </div>
  );
}
