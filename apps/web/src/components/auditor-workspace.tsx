import { useState, useRef } from "react";
import type React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  FileText,
  Sparkles,
  Shield,
  User,
  FolderKanban,
  MessageSquare,
  TrendingUp,
  X,
  Hash,
  RefreshCw,
  Check,
  Flag,
  ClipboardList,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ChevronUp,
  Edit3,
  XCircle,
  Send,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  ScanText,
  Cpu,
  CircleAlert,
  Layers,
  Eye,
  EyeOff,
  Highlighter,
  RotateCcw,
  Play,
  BadgeCheck,
  BookOpen,
  Calendar,
  Activity,
  Stethoscope,
  Building2,
  Star,
  Copy,
  AlignLeft,
  List,
  Plus,
  Zap,
  PenLine,
  Ban,
  ShieldAlert,
} from "lucide-react";

/* ════════════════════════════════════════════
   TYPES
════════════════════════════════════════════ */
type CodeStatus = "matched" | "missing" | "incorrect" | "modifier" | "extra";
type AlertSev = "error" | "warning" | "info" | "success";
type AuditLevel = "L1" | "L2" | "L3";
type AuditDec = "accept" | "accept-mod" | "rework" | "reject" | null;
type PoaFlag = "Y" | "N" | "W" | "U" | "1";
type CodeAuditDec = "accepted" | "rejected" | "modified" | "overridden" | null;

interface AuditDosEntry {
  id: string;
  date: string;
  isoDate: string;
  encounterType: string;
  provider: string;
  sub: string;
}

const AUDIT_DOS_INITIAL: AuditDosEntry[] = [
  {
    id: "ad1",
    date: "Jan 14",
    isoDate: "2026-01-14",
    encounterType: "Inpatient",
    provider: "Dr. Rajesh Sharma, MD",
    sub: "Admit",
  },
  {
    id: "ad2",
    date: "Jan 15",
    isoDate: "2026-01-15",
    encounterType: "Inpatient",
    provider: "Dr. Rajesh Sharma, MD",
    sub: "",
  },
  {
    id: "ad3",
    date: "Jan 16",
    isoDate: "2026-01-16",
    encounterType: "Inpatient",
    provider: "Dr. Priya Nair, MD",
    sub: "",
  },
  {
    id: "ad4",
    date: "Jan 17",
    isoDate: "2026-01-17",
    encounterType: "Inpatient",
    provider: "Dr. Rajesh Sharma, MD",
    sub: "",
  },
  {
    id: "ad5",
    date: "Jan 18",
    isoDate: "2026-01-18",
    encounterType: "Inpatient",
    provider: "Dr. Rajesh Sharma, MD",
    sub: "D/C",
  },
];

const ENC_TYPES_AUDIT = [
  "Inpatient",
  "Outpatient",
  "Emergency Room",
  "Observation",
  "Telehealth",
  "Office Visit",
];
const PROVIDERS_AUDIT = [
  "Dr. Rajesh Sharma, MD",
  "Dr. Priya Nair, MD",
  "Dr. Anil Kumar, MD",
  "Dr. Sunita Patel, MD",
];

interface IcdRow {
  id: string;
  code: string;
  desc: string;
  isPDX: boolean;
  poa: PoaFlag;
  coderSubmitted: boolean;
  aiSuggested: boolean;
  status: CodeStatus;
  aiConf?: number;
  docRef?: string;
  modifier?: string;
  correction?: string;
  discrepancy?: string;
  codeComments: string[];
}
interface CptRow {
  id: string;
  code: string;
  desc: string;
  units: number;
  modifier?: string;
  coderSubmitted: boolean;
  aiSuggested: boolean;
  status: CodeStatus;
  aiConf?: number;
  docRef?: string;
  correction?: string;
  discrepancy?: string;
  codeComments: string[];
}
interface QAlert {
  id: string;
  sev: AlertSev;
  title: string;
  detail: string;
  recommendation: string;
  codes: string[];
  autoFixable: boolean;
}
interface TrailEntry {
  ts: string;
  actor: string;
  role: string;
  action: string;
  note?: string;
}

/* ════════════════════════════════════════════
   MOCK DATA
════════════════════════════════════════════ */
const CHART = {
  id: "CHT-78542",
  patientName: "Anderson, Jennifer K.",
  initials: "AJ",
  mrn: "MBR-2026-00142",
  dob: "15 Mar 1965",
  age: 60,
  gender: "Female",
  encounterType: "Inpatient",
  admitDate: "14 Jan 2026",
  dischargeDate: "18 Jan 2026",
  los: 4,
  facility: "Apollo Hospital & Research Centre",
  facilityCity: "New Delhi",
  provider: "Dr. Rajesh Sharma, MD, FACP",
  drg: "871",
  drgWeight: 1.82,
  drgDesc: "Septicemia / Severe Sepsis W/O MV ≥96 Hrs",
  project: "Apollo Inpatient FY26",
  coder: "Ankit Sharma",
  coderSubmittedAt: "20 Feb 2026, 08:42 IST",
  auditor: "Dr. Priya Nair, RHIA",
  auditLevel: "L2" as AuditLevel,
  slaHrsLeft: 2.25,
  slaStatus: "At Risk" as "On Track" | "At Risk" | "Breached",
  slaDeadline: "21 Feb 2026, 11:00 IST",
};

const ICD_ROWS: IcdRow[] = [
  {
    id: "I1",
    code: "A41.9",
    desc: "Sepsis, unspecified organism",
    isPDX: true,
    poa: "Y",
    coderSubmitted: true,
    aiSuggested: true,
    status: "matched",
    aiConf: 99.1,
    docRef: "PDX",
    codeComments: [],
  },
  {
    id: "I2",
    code: "E11.9",
    desc: "Type 2 diabetes mellitus without complications",
    isPDX: false,
    poa: "Y",
    coderSubmitted: true,
    aiSuggested: false,
    status: "incorrect",
    aiConf: 0,
    docRef: "SDX-2",
    correction: "E11.65",
    discrepancy:
      "Fasting glucose 312 mg/dL documented in labs (14 Jan). With T2DM, hyperglycemia must be coded as E11.65, not unspecified E11.9.",
    codeComments: [],
  },
  {
    id: "I3",
    code: "I10",
    desc: "Essential (primary) hypertension",
    isPDX: false,
    poa: "Y",
    coderSubmitted: true,
    aiSuggested: true,
    status: "matched",
    aiConf: 97.3,
    docRef: "SDX-3",
    codeComments: [],
  },
  {
    id: "I4",
    code: "N18.3",
    desc: "Chronic kidney disease, stage 3",
    isPDX: false,
    poa: "Y",
    coderSubmitted: true,
    aiSuggested: true,
    status: "matched",
    aiConf: 95.8,
    docRef: "SDX-4",
    modifier: "POA flag needed",
    discrepancy:
      "POA indicator documented as Y but prior QA return noted missing POA. Confirm POA = Y via admission note.",
    codeComments: ["POA confirmed as Y per admission note pg 2 — Ankit Sharma"],
  },
  {
    id: "I5",
    code: "J18.9",
    desc: "Pneumonia, unspecified organism",
    isPDX: false,
    poa: "Y",
    coderSubmitted: true,
    aiSuggested: true,
    status: "matched",
    aiConf: 98.5,
    docRef: "SDX-5",
    codeComments: [],
  },
  {
    id: "I6",
    code: "Z79.4",
    desc: "Long-term (current) use of insulin",
    isPDX: false,
    poa: "1",
    coderSubmitted: true,
    aiSuggested: true,
    status: "matched",
    aiConf: 96.0,
    docRef: "SDX-6",
    codeComments: [],
  },
  {
    id: "I7",
    code: "R65.20",
    desc: "Severe sepsis without septic shock",
    isPDX: false,
    poa: "Y",
    coderSubmitted: false,
    aiSuggested: true,
    status: "missing",
    aiConf: 91.4,
    docRef: "AI-1",
    discrepancy:
      "Severe sepsis criteria present: organ dysfunction (AKI, eGFR drop) documented. R65.20 should follow A41.9 per ICD-10 sequencing guidelines.",
    codeComments: [],
  },
  {
    id: "I8",
    code: "D64.9",
    desc: "Anemia, unspecified",
    isPDX: false,
    poa: "Y",
    coderSubmitted: false,
    aiSuggested: true,
    status: "missing",
    aiConf: 88.2,
    docRef: "AI-2",
    discrepancy:
      "Hemoglobin 9.2 g/dL documented in CBC (14 Jan labs). Anemia acknowledged in Assessment but not coded. Code if it affected clinical management.",
    codeComments: [],
  },
  {
    id: "I9",
    code: "E11.65",
    desc: "Type 2 DM with hyperglycemia",
    isPDX: false,
    poa: "Y",
    coderSubmitted: false,
    aiSuggested: true,
    status: "missing",
    aiConf: 97.8,
    docRef: "AI-3",
    discrepancy:
      "Correction for I2: This is the correct code to replace E11.9 given documented hyperglycemia (glucose 312 mg/dL).",
    codeComments: [],
  },
];

const CPT_ROWS: CptRow[] = [
  {
    id: "C1",
    code: "99291",
    desc: "Critical care, evaluation and management, first 30–74 minutes",
    units: 1,
    coderSubmitted: true,
    aiSuggested: true,
    status: "matched",
    aiConf: 95.2,
    docRef: "CPT-1",
    codeComments: [],
  },
  {
    id: "C2",
    code: "36415",
    desc: "Collection of venous blood by venipuncture",
    units: 2,
    coderSubmitted: true,
    aiSuggested: true,
    status: "matched",
    aiConf: 99.0,
    docRef: "CPT-2",
    codeComments: [],
  },
  {
    id: "C3",
    code: "71046",
    desc: "Radiologic examination, chest; 2 views",
    units: 1,
    modifier: "-26",
    coderSubmitted: true,
    aiSuggested: true,
    status: "modifier",
    aiConf: 96.7,
    docRef: "CPT-3",
    discrepancy:
      "Modifier -26 (Professional Component) applied by coder. However, this is a facility inpatient claim — modifier -26 should not be used on facility billing. Remove modifier.",
    codeComments: [
      "Facility billing confirmed — -26 should be removed per supervisor note",
    ],
  },
  {
    id: "C4",
    code: "93306",
    desc: "Echocardiography, transthoracic; complete",
    units: 1,
    coderSubmitted: false,
    aiSuggested: true,
    status: "missing",
    aiConf: 89.4,
    docRef: "AI-4",
    discrepancy:
      'Echocardiogram documented in procedure note (17 Jan): "Transthoracic echo performed, EF 55%, no valvular vegetations." CPT 93306 should be coded.',
    codeComments: [],
  },
];

const Q_ALERTS: QAlert[] = [
  {
    id: "Q1",
    sev: "error",
    title: "Incorrect Code: E11.9 → E11.65",
    codes: ["E11.9", "E11.65"],
    detail:
      "Type 2 DM coded as E11.9 (unspecified) but lab evidence of hyperglycemia (glucose 312 mg/dL, 14 Jan) mandates E11.65. This is a specificity error.",
    recommendation:
      "Replace E11.9 with E11.65. Add Z79.4 to confirm insulin use (already present).",
    autoFixable: true,
  },
  {
    id: "Q2",
    sev: "error",
    title: "Missing: R65.20 Severe Sepsis",
    codes: ["A41.9", "R65.20"],
    detail:
      "Severe sepsis (R65.20) must be sequenced when sepsis results in organ dysfunction. Documentation supports AKI and altered mentation — organ dysfunction criteria met.",
    recommendation:
      "Add R65.20 immediately after A41.9 (PDX) per ICD-10-CM Official Guidelines Section I.C.1.d.",
    autoFixable: false,
  },
  {
    id: "Q3",
    sev: "warning",
    title: "Modifier -26 Invalid on Facility Bill",
    codes: ["71046"],
    detail:
      "CPT 71046 was submitted with modifier -26 (Professional Component). This chart is a facility inpatient claim; professional component modifiers are invalid in this billing context.",
    recommendation:
      "Remove modifier -26 from CPT 71046. Confirm with biller if separate professional claim exists.",
    autoFixable: true,
  },
  {
    id: "Q4",
    sev: "warning",
    title: "Possible Missing: D64.9 Anemia",
    codes: ["D64.9"],
    detail:
      "Hemoglobin 9.2 g/dL documented (14 Jan CBC). Anemia noted in Assessment but not coded. Code only if it affected treatment (transfusion, iron supplementation, etc.).",
    recommendation:
      "Review physician Assessment to confirm if anemia required clinical management. Code D64.9 if applicable.",
    autoFixable: false,
  },
  {
    id: "Q5",
    sev: "warning",
    title: "Missing CPT: 93306 Echocardiogram",
    codes: ["93306"],
    detail:
      "Procedure note (17 Jan, 11:05) documents transthoracic echocardiogram with interpretation by Dr. Sharma. CPT 93306 not submitted by coder.",
    recommendation:
      "Add CPT 93306 with appropriate linkage to A41.9 (sepsis w/ cardiac monitoring).",
    autoFixable: false,
  },
  {
    id: "Q6",
    sev: "info",
    title: "POA Attestation: N18.3 CKD Stage 3",
    codes: ["N18.3"],
    detail:
      "POA = Y applied but prior QA return (Jan 2026) flagged missing POA for N18.3. Admission note pg 2 confirms CKD pre-existing. POA = Y is correct per documentation.",
    recommendation:
      "Verify admission note documentation explicitly confirms CKD Stage 3 pre-dates admission. Document reference in audit notes.",
    autoFixable: false,
  },
];

const TRAIL: TrailEntry[] = [
  {
    ts: "20 Feb, 09:15",
    actor: "Ankit Sharma",
    role: "Coder",
    action: "Chart submitted for audit",
    note: "All codes reviewed per project guidelines.",
  },
  {
    ts: "20 Feb, 09:22",
    actor: "System (AI)",
    role: "AI Engine",
    action: "Auto-validation completed",
    note: "6 issues detected. Audit triggered at L2.",
  },
  {
    ts: "20 Feb, 10:00",
    actor: "Dr. Priya Nair",
    role: "Auditor",
    action: "Audit opened (L2)",
    note: undefined,
  },
  {
    ts: "20 Feb, 10:14",
    actor: "Dr. Priya Nair",
    role: "Auditor",
    action: "Comment added on E11.9",
    note: "Glucose 312 mandates E11.65 — specificity error.",
  },
];

const DOCS = [
  { id: "D1", name: "Discharge Summary", pages: 6, ocrDone: true },
  { id: "D2", name: "Lab Report", pages: 4, ocrDone: true },
  { id: "D3", name: "Operative / Procedure Note", pages: 14, ocrDone: true },
  { id: "D4", name: "Nursing Assessment", pages: 8, ocrDone: false },
  { id: "D5", name: "Radiology Report", pages: 2, ocrDone: true },
];

/* ════════════════════════════════════════════
   HELPERS / CONFIG
════════════════════════════════════════════ */
const STATUS_CFG: Record<
  CodeStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: React.ElementType;
  }
> = {
  matched: {
    label: "Matched",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  missing: {
    label: "AI Suggests",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: CircleAlert,
  },
  incorrect: {
    label: "Incorrect",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: XCircle,
  },
  modifier: {
    label: "Modifier Issue",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: AlertTriangle,
  },
  extra: {
    label: "Coder Only",
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    icon: Info,
  },
};

const ALERT_CFG: Record<
  AlertSev,
  {
    bg: string;
    border: string;
    bar: string;
    icon: React.ElementType;
    text: string;
  }
> = {
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    bar: "bg-red-500",
    icon: AlertCircle,
    text: "text-red-700",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    bar: "bg-amber-400",
    icon: AlertTriangle,
    text: "text-amber-700",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    bar: "bg-blue-400",
    icon: Info,
    text: "text-blue-700",
  },
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    bar: "bg-emerald-500",
    icon: CheckCircle2,
    text: "text-emerald-700",
  },
};

const POA_LABEL: Record<PoaFlag, string> = {
  Y: "Present",
  N: "Not Present",
  W: "Undetermined",
  U: "Insufficient Doc",
  "1": "Exempt",
};
const POA_COLOR: Record<PoaFlag, string> = {
  Y: "text-emerald-600",
  N: "text-red-600",
  W: "text-amber-600",
  U: "text-orange-600",
  "1": "text-slate-500",
};

const AUDIT_LEVEL_CFG: Record<
  AuditLevel,
  { bg: string; text: string; border: string; desc: string }
> = {
  L1: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-300",
    desc: "Standard Review",
  },
  L2: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-300",
    desc: "Complex Review",
  },
  L3: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-300",
    desc: "Expert Review",
  },
};

/* ════════════════════════════════════════════
   DOCUMENT VIEWER — Simulated PDF
════════════════════════════════════════════ */
type Seg = {
  text: string;
  hl?: "dx" | "proc" | "ai" | "flag" | "poa";
  code?: string;
  tooltip?: string;
};

const PAGE_CONTENT: Seg[][] = [
  // --- DISCHARGE SUMMARY (Page 1) ---
  [{ text: "DISCHARGE SUMMARY", hl: undefined }],
  [
    {
      text: "Apollo Hospital & Research Centre · General Medicine · New Delhi",
    },
  ],
  [
    {
      text: "Patient: Anderson, Jennifer K.    MRN: MBR-2026-00142    DOB: 15 Mar 1965 (60y F)",
    },
    { text: "Admission: 14 Jan 2026    Discharge: 18 Jan 2026    LOS: 4 days" },
    { text: "Attending: Dr. Rajesh Sharma, MD, FACP    DRG: 871 (Wt 1.82)" },
  ],
  [
    { text: "PRINCIPAL DIAGNOSIS", hl: undefined },
    { text: "", hl: undefined },
    {
      text: "Sepsis, unspecified organism",
      hl: "dx",
      code: "A41.9",
      tooltip: "ICD-10: A41.9 · Matched by coder & AI",
    },
    { text: " — Patient presented 14 Jan 2026 with acute febrile illness, " },
    {
      text: "hypotension (BP 82/54 mmHg)",
      hl: "ai",
      tooltip: "AI-detected: supports severe sepsis R65.20",
    },
    { text: " and " },
    {
      text: "leukocytosis (WBC 18,400/μL)",
      hl: "ai",
      tooltip: "AI-detected: SIRS criteria met",
    },
    {
      text: ". Sepsis-3 criteria fulfilled. Blood cultures × 2 obtained; empiric IV antibiotics initiated.",
    },
  ],
  [
    { text: "SECONDARY DIAGNOSES", hl: undefined },
    { text: "" },
    {
      text: "1. Type 2 diabetes mellitus",
      hl: "flag",
      code: "E11.9→E11.65",
      tooltip: "⚠ Coded as E11.9 — should be E11.65 (hyperglycemia documented)",
    },
    { text: " — Fasting glucose " },
    {
      text: "312 mg/dL",
      hl: "flag",
      tooltip: "⚠ Glucose 312 mg/dL confirms hyperglycemia → E11.65 required",
    },
    {
      text: " on admission labs. Insulin sliding scale continued throughout stay.",
    },
    { text: "" },
    {
      text: "2. Essential hypertension",
      hl: "dx",
      code: "I10",
      tooltip: "ICD-10: I10 · Matched",
    },
    { text: " — BP 160/95 on admission, managed with amlodipine 5 mg OD." },
    { text: "" },
    {
      text: "3. Chronic kidney disease, stage 3",
      hl: "dx",
      code: "N18.3",
      tooltip: "ICD-10: N18.3 · Matched (POA = Y confirmed)",
    },
    {
      text: " — eGFR 42 mL/min/1.73m², serum creatinine 1.8 mg/dL. Pre-existing, documented since 2022.",
    },
    { text: "" },
    {
      text: "4. Pneumonia, right lower lobe",
      hl: "dx",
      code: "J18.9",
      tooltip: "ICD-10: J18.9 · Matched",
    },
    {
      text: " — CXR (14 Jan) confirmed right lower lobe consolidation. Treated with amoxicillin-clavulanate.",
    },
    { text: "" },
    {
      text: "5. Long-term insulin use",
      hl: "dx",
      code: "Z79.4",
      tooltip: "ICD-10: Z79.4 · Matched",
    },
    { text: " — Patient on basal-bolus insulin therapy for T2DM management." },
    { text: "" },
    {
      text: "6. [AI DETECTED] Severe sepsis criteria met",
      hl: "ai",
      code: "R65.20",
      tooltip: "AI: R65.20 Severe Sepsis — NOT SUBMITTED by coder",
    },
    {
      text: " — AKI (creatinine rise from baseline 1.2 to 1.8), confusion (GCS 13), and hypotension documented. ",
    },
    {
      text: "Organ dysfunction criteria fulfilled",
      hl: "ai",
      tooltip: "AI: R65.20 should follow A41.9 per sequencing guidelines",
    },
    { text: "." },
    { text: "" },
    {
      text: "7. [AI DETECTED] Anemia",
      hl: "ai",
      code: "D64.9",
      tooltip: "AI: D64.9 — Hgb 9.2 documented, not submitted by coder",
    },
    { text: " — Hemoglobin " },
    {
      text: "9.2 g/dL",
      hl: "ai",
      tooltip: "AI: Hgb 9.2 supports D64.9 — verify if treated",
    },
    { text: " on admission CBC. No active transfusion ordered." },
  ],
  [
    { text: "PROCEDURES PERFORMED", hl: undefined },
    { text: "" },
    {
      text: "1. Blood cultures × 2",
      hl: "proc",
      code: "36415",
      tooltip: "CPT: 36415 · Matched",
    },
    {
      text: " (14 Jan, 19:10) — Positive for Staphylococcus aureus (MSSA) after 36 hours.",
    },
    { text: "" },
    {
      text: "2. Chest X-Ray, 2 views",
      hl: "proc",
      code: "71046",
      tooltip: "CPT: 71046 · Modifier issue (−26 invalid on facility)",
    },
    {
      text: " (14 Jan, 20:30) — RLL consolidation confirmed. Repeat CXR on day 3 showed partial resolution.",
    },
    { text: "" },
    {
      text: "3. Echocardiogram (transthoracic)",
      hl: "ai",
      code: "93306",
      tooltip: "AI: CPT 93306 — NOT SUBMITTED by coder",
    },
    {
      text: " (17 Jan, 11:05) — EF 55%, no valvular vegetations or wall motion abnormalities. Ordered to rule out infective endocarditis.",
    },
    { text: "" },
    {
      text: "4. Critical care management",
      hl: "proc",
      code: "99291",
      tooltip: "CPT: 99291 · Matched",
    },
    {
      text: " — >30 minutes of critical care time documented on 14 Jan and 15 Jan. ICU-level monitoring.",
    },
  ],
  [
    { text: "DISCHARGE PLAN", hl: undefined },
    { text: "" },
    {
      text: "Patient discharged home in stable condition on 18 Jan 2026. Prescribed oral antibiotics (amoxicillin-clavulanate 625 mg BD × 7 days), amlodipine 5 mg OD, insulin regimen unchanged. Follow-up with Dr. Sharma in 2 weeks. Repeat CXR in 4 weeks. Nephrology follow-up scheduled for CKD monitoring.",
    },
  ],
];

function Highlight({ seg, showOcr }: { seg: Seg; showOcr: boolean }) {
  const [tip, setTip] = useState(false);
  if (!seg.hl)
    return (
      <span className="text-[11px] leading-relaxed text-slate-700">
        {seg.text}
      </span>
    );
  const cls = {
    dx: "bg-yellow-100 text-yellow-900 border-b-2 border-yellow-400 cursor-pointer",
    proc: "bg-emerald-100 text-emerald-900 border-b-2 border-emerald-500 cursor-pointer",
    ai: "bg-blue-100 text-blue-900 border-b-2 border-blue-400 border-dashed cursor-pointer",
    flag: "bg-red-100 text-red-900 border-b-2 border-red-500 cursor-pointer",
    poa: "bg-violet-100 text-violet-900 border-b-2 border-violet-400 cursor-pointer",
  }[seg.hl];

  return (
    <span
      className="relative inline"
      onMouseEnter={() => setTip(true)}
      onMouseLeave={() => setTip(false)}
    >
      <span
        className={`rounded px-0.5 py-px text-[11px] leading-relaxed font-medium ${cls} ${showOcr ? "ring-1 ring-blue-300/50 ring-offset-0" : ""}`}
      >
        {seg.text}
      </span>
      {tip && seg.tooltip && (
        <span className="absolute bottom-full left-0 mb-1 z-50 w-56 text-[10px] bg-slate-900 text-white rounded-lg shadow-xl px-2.5 py-1.5 leading-relaxed pointer-events-none">
          {seg.tooltip}
        </span>
      )}
    </span>
  );
}

function DocPage({
  pageContent,
  showOcr,
  showHighlights,
}: {
  pageContent: Seg[][];
  showOcr: boolean;
  showHighlights: boolean;
}) {
  return (
    <div className="bg-white shadow-lg rounded border border-slate-200 mx-4 my-3 p-7 min-h-[600px] text-slate-800 font-['Georgia',serif]">
      {pageContent.map((para, pi) => {
        if (pi === 0)
          return (
            <div key={pi} className="text-center mb-1">
              <span className="text-sm font-black tracking-widest uppercase text-slate-800">
                {para[0].text}
              </span>
            </div>
          );
        if (pi === 1)
          return (
            <div key={pi} className="text-center mb-4">
              <span className="text-[10px] text-slate-500 font-semibold tracking-wide">
                {para[0].text}
              </span>
            </div>
          );
        if (pi === 2)
          return (
            <div
              key={pi}
              className="bg-slate-50 rounded-lg p-3 mb-5 border border-slate-200 space-y-0.5"
            >
              {para.map((s, si) => (
                <div
                  key={si}
                  className="text-[10px] text-slate-600 font-medium font-sans"
                >
                  {s.text}
                </div>
              ))}
            </div>
          );
        const isHeader =
          para.length === 1 &&
          !para[0].hl &&
          (para[0].text?.match(/^[A-Z\s\/]+$/) ||
            para[0].text?.endsWith("DIAGNOSIS") ||
            para[0].text?.endsWith("DIAGNOSES") ||
            para[0].text?.endsWith("PERFORMED") ||
            para[0].text?.endsWith("PLAN"));
        if (isHeader && para[0].text)
          return (
            <div key={pi} className="mt-5 mb-2 pb-1 border-b border-slate-300">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 font-sans">
                {para[0].text}
              </span>
            </div>
          );
        if (para[0].text === "") return <div key={pi} className="h-1" />;
        return (
          <p key={pi} className="mb-1 leading-relaxed">
            {para.map((seg, si) =>
              showHighlights ? (
                <Highlight key={si} seg={seg} showOcr={showOcr} />
              ) : (
                <span
                  key={si}
                  className="text-[11px] leading-relaxed text-slate-700"
                >
                  {seg.text}
                </span>
              ),
            )}
          </p>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════
   CODE ROW
════════════════════════════════════════════ */
function CodeRow({
  code,
  desc,
  status,
  isPDX,
  poa,
  aiConf,
  modifier,
  correction,
  discrepancy,
  codeComments,
  onAddComment,
  isIcd,
  units,
  auditDecision,
  onAuditDecision,
}: {
  code: string;
  desc: string;
  status: CodeStatus;
  isPDX?: boolean;
  poa?: PoaFlag;
  aiConf?: number;
  modifier?: string;
  correction?: string;
  discrepancy?: string;
  codeComments: string[];
  onAddComment: (comment: string) => void;
  isIcd: boolean;
  units?: number;
  auditDecision?: CodeAuditDec;
  onAuditDecision?: (d: CodeAuditDec) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [draft, setDraft] = useState("");
  const [comments, setComments] = useState<string[]>(codeComments);

  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;

  const submitComment = () => {
    if (!draft.trim()) return;
    const c = `${draft.trim()} — Dr. Priya Nair`;
    setComments((prev) => [...prev, c]);
    onAddComment(c);
    setDraft("");
    setCommenting(false);
  };

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-shadow ${cfg.border} ${expanded ? "shadow-md" : "hover:shadow-sm"}`}
    >
      {/* Main row */}
      <div
        className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer group ${cfg.bg} transition-colors`}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Status icon */}
        <Icon className={`w-4 h-4 flex-shrink-0 ${cfg.text}`} />

        {/* Code + badges */}
        <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0 w-44">
          <span className="font-mono text-xs font-black text-foreground">
            {code}
          </span>
          {isPDX && (
            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-primary text-white">
              PDX
            </span>
          )}
          {modifier && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-300">
              {modifier}
            </span>
          )}
          {correction && (
            <span className="text-[9px] font-black text-red-600">
              → {correction}
            </span>
          )}
        </div>

        {/* Description */}
        <span className="flex-1 text-[11px] text-foreground leading-tight truncate">
          {desc}
        </span>

        {/* POA */}
        {isIcd && poa && (
          <div className="flex-shrink-0 text-center w-16">
            <div className="text-[8px] font-bold text-muted-foreground uppercase">
              POA
            </div>
            <div className={`text-[10px] font-bold ${POA_COLOR[poa]}`}>
              {poa}
            </div>
          </div>
        )}

        {/* Units (CPT) */}
        {!isIcd && units !== undefined && (
          <div className="flex-shrink-0 text-center w-12">
            <div className="text-[8px] font-bold text-muted-foreground uppercase">
              Units
            </div>
            <div className="text-[10px] font-bold text-foreground">{units}</div>
          </div>
        )}

        {/* AI Confidence */}
        {aiConf !== undefined && aiConf > 0 && (
          <div className="flex-shrink-0 w-16">
            <div className="flex items-center justify-between text-[8px] text-muted-foreground mb-0.5">
              <span>AI</span>
              <span className="font-bold text-foreground">{aiConf}%</span>
            </div>
            <div className="h-1 bg-white/70 rounded-full overflow-hidden border border-border/30">
              <div
                className="h-full bg-violet-500 rounded-full"
                style={{ width: `${aiConf}%` }}
              />
            </div>
          </div>
        )}

        {/* Status chip */}
        <span
          className={`flex-shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} whitespace-nowrap`}
        >
          {cfg.label}
        </span>

        {/* Auditor decision badge */}
        {auditDecision && (
          <span
            className={`flex-shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full border whitespace-nowrap ${
              auditDecision === "accepted"
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : auditDecision === "rejected"
                  ? "bg-red-50 text-red-700 border-red-300"
                  : auditDecision === "modified"
                    ? "bg-blue-50 text-blue-700 border-blue-300"
                    : "bg-orange-50 text-orange-700 border-orange-300"
            }`}
          >
            {auditDecision === "accepted"
              ? "✓ Accepted"
              : auditDecision === "rejected"
                ? "✗ Rejected"
                : auditDecision === "modified"
                  ? "✏ Modified"
                  : "⚡ Overridden"}
          </span>
        )}

        {/* Comment count */}
        {comments.length > 0 && (
          <span className="flex-shrink-0 flex items-center gap-1 text-[9px] text-primary font-bold px-1.5 py-0.5 rounded-full bg-primary/10">
            <MessageSquare className="w-2.5 h-2.5" />
            {comments.length}
          </span>
        )}

        {/* Expand */}
        <button
          className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
        >
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="bg-card border-t border-border px-4 py-3 space-y-3">
          {discrepancy && (
            <div
              className={`flex items-start gap-2 p-2.5 rounded-lg ${cfg.bg} border ${cfg.border}`}
            >
              <Icon
                className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${cfg.text}`}
              />
              <div>
                <p className={`text-[10px] font-bold ${cfg.text} mb-0.5`}>
                  Discrepancy Analysis
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {discrepancy}
                </p>
              </div>
            </div>
          )}

          {/* Comments */}
          {comments.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                Comments
              </p>
              {comments.map((c, i) => (
                <div
                  key={i}
                  className="text-[10px] text-foreground bg-muted/30 rounded-lg px-3 py-1.5 border border-border leading-relaxed"
                >
                  {c}
                </div>
              ))}
            </div>
          )}

          {/* ── Auditor Decision ── */}
          {onAuditDecision && (
            <div className="pt-1">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                Auditor Decision for this Code
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {(
                  [
                    {
                      val: "accepted",
                      label: "Accept",
                      Icon: ThumbsUp,
                      cls: "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100",
                    },
                    {
                      val: "modified",
                      label: "Modify",
                      Icon: PenLine,
                      cls: "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100",
                    },
                    {
                      val: "overridden",
                      label: "Override",
                      Icon: Zap,
                      cls: "border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100",
                    },
                    {
                      val: "rejected",
                      label: "Reject",
                      Icon: Ban,
                      cls: "border-red-300 text-red-700 bg-red-50 hover:bg-red-100",
                    },
                  ] as {
                    val: CodeAuditDec;
                    label: string;
                    Icon: React.ElementType;
                    cls: string;
                  }[]
                ).map(({ val, label, Icon, cls }) => (
                  <button
                    key={val}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAuditDecision(auditDecision === val ? null : val);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-colors ${cls} ${auditDecision === val ? "ring-2 ring-offset-1 ring-current" : ""}`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
                {auditDecision && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAuditDecision(null);
                    }}
                    className="text-[10px] text-muted-foreground hover:text-foreground ml-1 underline underline-offset-2"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Add comment */}
          {commenting ? (
            <div className="space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                placeholder="Add auditor comment for this code…"
                className="w-full text-[11px] border border-border rounded-lg px-3 py-2 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setCommenting(false)}
                  className="text-[10px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={submitComment}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  Add Comment
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCommenting(true);
              }}
              className="flex items-center gap-1.5 text-[10px] font-semibold text-primary hover:underline"
            >
              <MessageSquare className="w-3 h-3" />
              Add Code Comment
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   CODE COMPARISON TAB
════════════════════════════════════════════ */
function CodeComparisonTab() {
  const [filter, setFilter] = useState<"all" | "issues">("all");
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const [auditDecisions, setAuditDecisions] = useState<
    Record<string, CodeAuditDec>
  >({});

  const addComment = (id: string, c: string) =>
    setComments((prev) => ({ ...prev, [id]: [...(prev[id] || []), c] }));
  const setDecision = (id: string, d: CodeAuditDec) =>
    setAuditDecisions((prev) => ({ ...prev, [id]: d }));

  const acceptedCnt = Object.values(auditDecisions).filter(
    (d) => d === "accepted",
  ).length;
  const rejectedCnt = Object.values(auditDecisions).filter(
    (d) => d === "rejected",
  ).length;
  const modifiedCnt = Object.values(auditDecisions).filter(
    (d) => d === "modified" || d === "overridden",
  ).length;

  const icdFiltered =
    filter === "issues"
      ? ICD_ROWS.filter((r) => r.status !== "matched")
      : ICD_ROWS;
  const cptFiltered =
    filter === "issues"
      ? CPT_ROWS.filter((r) => r.status !== "matched")
      : CPT_ROWS;

  const matched = [...ICD_ROWS, ...CPT_ROWS].filter(
    (r) => r.status === "matched",
  ).length;
  const missing = [...ICD_ROWS, ...CPT_ROWS].filter(
    (r) => r.status === "missing",
  ).length;
  const incorrect = [...ICD_ROWS, ...CPT_ROWS].filter(
    (r) => r.status === "incorrect",
  ).length;
  const modIssue = [...ICD_ROWS, ...CPT_ROWS].filter(
    (r) => r.status === "modifier",
  ).length;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-2">
        {[
          {
            label: "Matched",
            n: matched,
            color: "bg-emerald-50 border-emerald-200 text-emerald-700",
            dot: "bg-emerald-500",
          },
          {
            label: "Missing",
            n: missing,
            color: "bg-amber-50 border-amber-200 text-amber-700",
            dot: "bg-amber-500",
          },
          {
            label: "Incorrect",
            n: incorrect,
            color: "bg-red-50 border-red-200 text-red-700",
            dot: "bg-red-500",
          },
          {
            label: "Modifier",
            n: modIssue,
            color: "bg-orange-50 border-orange-200 text-orange-700",
            dot: "bg-orange-500",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`flex flex-col items-center py-2.5 rounded-xl border ${s.color}`}
          >
            <span className="text-lg font-black">{s.n}</span>
            <span className="text-[9px] font-bold uppercase tracking-wide opacity-80">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Auditor decision summary */}
      {acceptedCnt + rejectedCnt + modifiedCnt > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 bg-muted/20 border border-border rounded-xl text-[10px] flex-wrap">
          <span className="font-bold text-muted-foreground">
            Auditor decisions:
          </span>
          {acceptedCnt > 0 && (
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <ThumbsUp className="w-3 h-3" />
              {acceptedCnt} Accepted
            </span>
          )}
          {rejectedCnt > 0 && (
            <span className="flex items-center gap-1 text-red-700 font-bold">
              <Ban className="w-3 h-3" />
              {rejectedCnt} Rejected
            </span>
          )}
          {modifiedCnt > 0 && (
            <span className="flex items-center gap-1 text-blue-700 font-bold">
              <PenLine className="w-3 h-3" />
              {modifiedCnt} Modified/Override
            </span>
          )}
        </div>
      )}

      {/* Filter toggle */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
        {(
          [
            ["all", "All Codes"],
            ["issues", "Issues Only"],
          ] as [typeof filter, string][]
        ).map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${filter === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ICD-10 Codes */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Hash className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-black text-foreground uppercase tracking-wide">
            ICD-10 Diagnosis Codes
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-bold">
            {ICD_ROWS.length} codes
          </span>
          <div className="flex-1 h-px bg-border" />
          <span className="text-[9px] text-muted-foreground">
            Coder:{" "}
            <strong className="text-foreground">
              {ICD_ROWS.filter((r) => r.coderSubmitted).length}
            </strong>{" "}
            submitted &nbsp; AI:{" "}
            <strong className="text-foreground">
              {ICD_ROWS.filter((r) => r.aiSuggested).length}
            </strong>{" "}
            suggested
          </span>
        </div>
        <div className="space-y-2">
          {icdFiltered.map((row) => (
            <CodeRow
              key={row.id}
              code={row.code}
              desc={row.desc}
              status={row.status}
              isPDX={row.isPDX}
              poa={row.poa}
              aiConf={row.aiConf}
              modifier={row.modifier}
              correction={row.correction}
              discrepancy={row.discrepancy}
              codeComments={[...(comments[row.id] || []), ...row.codeComments]}
              onAddComment={(c) => addComment(row.id, c)}
              isIcd={true}
              auditDecision={auditDecisions[row.id] ?? null}
              onAuditDecision={(d) => setDecision(row.id, d)}
            />
          ))}
        </div>
      </div>

      {/* CPT Codes */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px] font-black text-foreground uppercase tracking-wide">
            CPT Procedure Codes
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-bold">
            {CPT_ROWS.length} codes
          </span>
          <div className="flex-1 h-px bg-border" />
          <span className="text-[9px] text-muted-foreground">
            Coder:{" "}
            <strong className="text-foreground">
              {CPT_ROWS.filter((r) => r.coderSubmitted).length}
            </strong>{" "}
            submitted &nbsp; AI:{" "}
            <strong className="text-foreground">
              {CPT_ROWS.filter((r) => r.aiSuggested).length}
            </strong>{" "}
            suggested
          </span>
        </div>
        <div className="space-y-2">
          {cptFiltered.map((row) => (
            <CodeRow
              key={row.id}
              code={row.code}
              desc={row.desc}
              status={row.status}
              aiConf={row.aiConf}
              modifier={row.modifier}
              correction={row.correction}
              discrepancy={row.discrepancy}
              codeComments={[...(comments[row.id] || []), ...row.codeComments]}
              onAddComment={(c) => addComment(row.id, c)}
              isIcd={false}
              units={row.units}
              auditDecision={auditDecisions[row.id] ?? null}
              onAuditDecision={(d) => setDecision(row.id, d)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   QUALITY ALERTS TAB
════════════════════════════════════════════ */
function QualityAlertsTab() {
  const [sevFilter, setSevFilter] = useState<AlertSev | "all">("all");
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [fixed, setFixed] = useState<string[]>([]);

  const alerts = Q_ALERTS.filter(
    (a) =>
      !dismissed.includes(a.id) && (sevFilter === "all" || a.sev === sevFilter),
  );

  const counts = {
    error: Q_ALERTS.filter((a) => a.sev === "error").length,
    warning: Q_ALERTS.filter((a) => a.sev === "warning").length,
    info: Q_ALERTS.filter((a) => a.sev === "info").length,
  };

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {(
          [
            ["all", "All", Q_ALERTS.length],
            ["error", "Errors", counts.error],
            ["warning", "Warnings", counts.warning],
            ["info", "Info", counts.info],
          ] as [typeof sevFilter, string, number][]
        ).map(([v, l, n]) => (
          <button
            key={v}
            onClick={() => setSevFilter(v)}
            className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full border transition-colors ${
              sevFilter === v
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            }`}
          >
            {l}
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-full ${sevFilter === v ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"}`}
            >
              {n}
            </span>
          </button>
        ))}
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {alerts.length === 0 && (
          <div className="flex items-center gap-3 px-4 py-5 rounded-xl bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-800">
                No alerts in this category
              </p>
              <p className="text-[10px] text-emerald-700">
                All quality checks passed for the selected filter.
              </p>
            </div>
          </div>
        )}
        {alerts.map((a) => {
          const cfg = ALERT_CFG[a.sev];
          const Icon = cfg.icon;
          const isFixed = fixed.includes(a.id);
          return (
            <div
              key={a.id}
              className={`relative rounded-xl border overflow-hidden ${cfg.border} ${cfg.bg} group ${isFixed ? "opacity-60" : ""}`}
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar}`}
              />
              <div className="pl-4 pr-3 py-3">
                <div className="flex items-start gap-2.5">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 mt-0.5 ${cfg.text}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[11px] font-bold text-foreground">
                        {a.title}
                      </span>
                      {isFixed && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
                          Fixed
                        </span>
                      )}
                      <div className="flex gap-1">
                        {a.codes.map((c) => (
                          <span
                            key={c}
                            className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/70 border border-border text-foreground"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">
                      {a.detail}
                    </p>
                    <div className="flex items-start gap-1.5 px-2.5 py-1.5 bg-white/60 rounded-lg border border-border/50">
                      <BookOpen className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-foreground leading-relaxed">
                        <strong>Recommendation:</strong> {a.recommendation}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {a.autoFixable && !isFixed && (
                      <button
                        onClick={() => setFixed((prev) => [...prev, a.id])}
                        className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold bg-white border border-border rounded-lg text-primary hover:bg-primary/5 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        Auto-fix
                      </button>
                    )}
                    <button
                      onClick={() => setDismissed((prev) => [...prev, a.id])}
                      className="p-1.5 rounded hover:bg-black/5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   COMMENTS & AUDIT TRAIL TAB
═══════════��════════════════════════════════ */
function CommentsTrailTab() {
  const [globalNote, setGlobalNote] = useState("");
  const [saved, setSaved] = useState(false);

  const scoreNumerator = [...ICD_ROWS, ...CPT_ROWS].filter(
    (r) => r.status === "matched",
  ).length;
  const scoreTotal =
    ICD_ROWS.length +
    CPT_ROWS.length -
    ICD_ROWS.filter((r) => !r.coderSubmitted && !r.aiSuggested).length;
  const score = Math.round((scoreNumerator / (scoreTotal - 3)) * 100); // approximate

  const saveNote = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Audit Score */}
      <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-xl border border-border">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
              <circle
                cx="30"
                cy="30"
                r="24"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="6"
              />
              <circle
                cx="30"
                cy="30"
                r="24"
                fill="none"
                stroke={
                  score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"
                }
                strokeWidth="6"
                strokeDasharray={`${(score / 100) * 2 * Math.PI * 24} ${2 * Math.PI * 24}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`text-sm font-black ${score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-red-600"}`}
              >
                {score}%
              </span>
            </div>
          </div>
          <span className="text-[9px] font-bold text-muted-foreground mt-1">
            Audit Score
          </span>
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">Matched codes</span>
            <span className="font-bold text-emerald-600">
              {scoreNumerator} / {ICD_ROWS.length + CPT_ROWS.length}
            </span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">Issues found</span>
            <span className="font-bold text-red-600">
              {Q_ALERTS.filter((a) => a.sev === "error").length} errors,{" "}
              {Q_ALERTS.filter((a) => a.sev === "warning").length} warnings
            </span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">Audit level</span>
            <span className="font-bold text-primary">
              {CHART.auditLevel} — Complex Review
            </span>
          </div>
        </div>
      </div>

      {/* Per-code comments summary */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <MessageSquare className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-bold text-foreground">
            Code-Specific Comments
          </span>
        </div>
        <div className="space-y-2">
          {[...ICD_ROWS, ...CPT_ROWS]
            .filter((r) => r.codeComments.length > 0)
            .map((r) => (
              <div
                key={r.id}
                className="px-3 py-2.5 rounded-xl border border-border bg-muted/10"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-black text-primary">
                    {r.code}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {r.desc}
                  </span>
                </div>
                {r.codeComments.map((c, i) => (
                  <p
                    key={i}
                    className="text-[10px] text-foreground leading-relaxed pl-2 border-l-2 border-primary/30"
                  >
                    {c}
                  </p>
                ))}
              </div>
            ))}
          {[...ICD_ROWS, ...CPT_ROWS].filter((r) => r.codeComments.length > 0)
            .length === 0 && (
            <p className="text-[10px] text-muted-foreground italic">
              No per-code comments yet. Expand any code row to add a comment.
            </p>
          )}
        </div>
      </div>

      {/* Global audit notes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Edit3 className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-bold text-foreground">
              Global Audit Notes
            </span>
          </div>
          {saved && (
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <Check className="w-3 h-3" />
              Saved
            </span>
          )}
        </div>
        <textarea
          value={globalNote}
          onChange={(e) => setGlobalNote(e.target.value)}
          rows={4}
          placeholder="Enter overall audit findings, observations, or instructions for the coder…"
          className="w-full text-[11px] border border-border rounded-xl px-3 py-2.5 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none leading-relaxed"
        />
        <button
          onClick={saveNote}
          className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Check className="w-3 h-3" />
          Save Notes
        </button>
      </div>

      {/* Audit trail */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <ClipboardList className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[11px] font-bold text-foreground">
            Audit Trail
          </span>
        </div>
        <div className="relative pl-4 space-y-0">
          <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />
          {TRAIL.map((t, i) => (
            <div key={i} className="relative flex gap-3 pb-3">
              <div className="absolute left-[-13px] w-3 h-3 rounded-full bg-card border-2 border-primary mt-1 flex-shrink-0 z-10" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-foreground">
                    {t.actor}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                    {t.role}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {t.ts}
                  </span>
                </div>
                <p className="text-[10px] text-foreground mt-0.5">{t.action}</p>
                {t.note && (
                  <p className="text-[10px] text-muted-foreground italic">
                    {t.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   ADD ENCOUNTER MODAL
════════════════════════════════════════════ */
function AddEncounterModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (entry: AuditDosEntry) => void;
}) {
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    isoDate: "",
    encounterType: "Inpatient",
    provider: PROVIDERS_AUDIT[0],
    notes: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleAdd = () => {
    if (!form.isoDate) return;
    const d = new Date(form.isoDate + "T00:00:00");
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const entry: AuditDosEntry = {
      id: `ad-${Date.now()}`,
      date: label,
      isoDate: form.isoDate,
      encounterType: form.encounterType,
      provider: form.provider || PROVIDERS_AUDIT[0],
      sub: "",
    };
    setDone(true);
    setTimeout(() => {
      onAdd(entry);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {!done ? (
          <>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                <Plus className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Add Encounter / DOS
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {CHART.id} · {CHART.patientName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded hover:bg-muted"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Date of Service <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  type="date"
                  value={form.isoDate}
                  onChange={(e) => set("isoDate", e.target.value)}
                  className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Encounter Type
                </label>
                <select
                  value={form.encounterType}
                  onChange={(e) => set("encounterType", e.target.value)}
                  className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {ENC_TYPES_AUDIT.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Provider
                </label>
                <input
                  value={form.provider}
                  onChange={(e) => set("provider", e.target.value)}
                  placeholder="Dr. Name, MD"
                  list="audit-provider-list"
                  className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <datalist id="audit-provider-list">
                  {PROVIDERS_AUDIT.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Audit Note (optional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={2}
                  placeholder="Reason for adding this encounter or DOS…"
                  className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 text-xs font-semibold border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!form.isoDate}
                  className="flex-1 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-40 inline-flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Encounter
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 flex flex-col items-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <p className="text-sm font-bold text-foreground">Encounter Added</p>
            <p className="text-[11px] text-muted-foreground">
              New DOS added to the audit chart.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   AUDIT DECISION MODAL
════════════════════════════════════════════ */
function DecisionModal({
  dec,
  onClose,
  onConfirm,
}: {
  dec: AuditDec;
  onClose: () => void;
  onConfirm: (notes: string) => void;
}) {
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  if (!dec) return null;

  const cfg = {
    accept: {
      title: "Accept Audit",
      icon: ThumbsUp,
      color: "bg-emerald-600 hover:bg-emerald-700",
      desc: "Mark this chart as audited and accepted. No changes required.",
      placeholder: "Optional: Add acceptance notes…",
    },
    "accept-mod": {
      title: "Accept with Modification",
      icon: Edit3,
      color: "bg-blue-600 hover:bg-blue-700",
      desc: "Accept the chart but note required modifications to the codes.",
      placeholder: "Describe the modifications required…",
    },
    rework: {
      title: "Send for Rework",
      icon: RotateCcw,
      color: "bg-amber-600 hover:bg-amber-700",
      desc: "Return chart to coder for correction. Provide specific rework instructions.",
      placeholder: "Specify the rework instructions for the coder…",
    },
    reject: {
      title: "Reject Chart",
      icon: ThumbsDown,
      color: "bg-red-600 hover:bg-red-700",
      desc: "Reject this chart. Provide a detailed rejection reason.",
      placeholder: "Provide detailed rejection reason…",
    },
  }[dec];
  const Icon = cfg.icon;

  const confirm = () => {
    setSubmitted(true);
    setTimeout(() => {
      onConfirm(notes);
      onClose();
      setSubmitted(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {!submitted ? (
          <>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {cfg.title}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {CHART.id} · {CHART.patientName} · {CHART.mrn}
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded hover:bg-muted"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              {/* Audit summary */}
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  {
                    label: "ICD Codes",
                    val: ICD_ROWS.filter((r) => r.coderSubmitted).length,
                  },
                  {
                    label: "CPT Codes",
                    val: CPT_ROWS.filter((r) => r.coderSubmitted).length,
                  },
                  {
                    label: "Issues",
                    val: Q_ALERTS.filter(
                      (a) => a.sev === "error" || a.sev === "warning",
                    ).length,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="px-3 py-2 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="text-sm font-black text-foreground">
                      {s.val}
                    </div>
                    <div className="text-[9px] font-bold text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">{cfg.desc}</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder={cfg.placeholder}
                className="w-full text-xs border border-border rounded-xl px-3 py-2.5 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 text-xs font-semibold border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirm}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl text-white transition-colors ${cfg.color}`}
                >
                  Confirm — {cfg.title}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-foreground">
              {cfg.title} Submitted
            </p>
            <p className="text-[11px] text-muted-foreground">
              Audit decision recorded. Notifying coder…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   SLA MINI RING
════════════════════════════════════════════ */
function SlaChip({ hrs, status }: { hrs: number; status: string }) {
  const r = 12;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, hrs / 72);
  const color =
    status === "Breached"
      ? "#ef4444"
      : status === "At Risk"
        ? "#f59e0b"
        : "#10b981";
  const textCls =
    status === "Breached"
      ? "text-red-600"
      : status === "At Risk"
        ? "text-amber-600"
        : "text-emerald-600";
  const h = Math.floor(hrs);
  const m = Math.round((hrs - h) * 60);
  return (
    <div className="flex items-center gap-1.5">
      <svg width="32" height="32" className="-rotate-90 flex-shrink-0">
        <circle
          cx="16"
          cy="16"
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="3.5"
        />
        <circle
          cx="16"
          cy="16"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeDasharray={`${pct * circ} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div>
        <div className={`text-[11px] font-black leading-none ${textCls}`}>
          {h}h {m}m
        </div>
        <div className="text-[8px] text-muted-foreground leading-none mt-0.5">
          SLA {status}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN EXPORT
════════════════════════════════════════════ */
export function AuditorWorkspace({ onGoBack }: { onGoBack?: () => void }) {
  // Document viewer state
  const [activeDoc, setActiveDoc] = useState("D1");
  const [zoom, setZoom] = useState(100);
  const [showOcr, setShowOcr] = useState(false);
  const [showHighlights, setShowHighlights] = useState(true);
  const [page, setPage] = useState(1);
  const totalPages = DOCS.find((d) => d.id === activeDoc)?.pages ?? 1;

  // Review panel state
  const [activeTab, setActiveTab] = useState<
    "comparison" | "alerts" | "comments"
  >("comparison");
  const [decision, setDecision] = useState<AuditDec>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  // DOS & Encounter management
  const [dosEntries, setDosEntries] =
    useState<AuditDosEntry[]>(AUDIT_DOS_INITIAL);
  const [activeDoS, setActiveDoS] = useState(0);
  const [showAddEnc, setShowAddEnc] = useState(false);
  const [dosCtxMenu, setDosCtxMenu] = useState<number | null>(null);
  const [dosForm, setDosForm] = useState({
    isoDate: "",
    encounterType: "Inpatient",
    provider: PROVIDERS_AUDIT[0],
  });

  const handleAddDos = () => {
    if (!dosForm.isoDate) return;
    const d = new Date(dosForm.isoDate + "T00:00:00");
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const entry: AuditDosEntry = {
      id: `ad-${Date.now()}`,
      date: label,
      isoDate: dosForm.isoDate,
      encounterType: dosForm.encounterType,
      provider: dosForm.provider || PROVIDERS_AUDIT[0],
      sub: "",
    };
    setDosEntries((prev) => [...prev, entry]);
    setActiveDoS(dosEntries.length);
    setShowAddEnc(false);
    setDosForm({
      isoDate: "",
      encounterType: "Inpatient",
      provider: PROVIDERS_AUDIT[0],
    });
  };

  const lvlCfg = AUDIT_LEVEL_CFG[CHART.auditLevel];
  const errorCount = Q_ALERTS.filter((a) => a.sev === "error").length;
  const warningCount = Q_ALERTS.filter((a) => a.sev === "warning").length;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* ══════════════════════════════════════
          HEADER
      ══════════════════════════════════════ */}
      <div className="flex-shrink-0 bg-card border-b border-border">
        {/* Breadcrumb + primary actions */}
        <div className="flex items-center gap-2.5 px-4 py-2 border-b border-border/60">
          <button
            onClick={onGoBack}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Work Queue
          </button>
          <ChevronRight className="w-3 h-3 text-border" />
          <span className="text-[11px] text-muted-foreground">Operations</span>
          <ChevronRight className="w-3 h-3 text-border" />
          <span className="text-[11px] font-bold text-foreground">
            Auditor Workspace
          </span>
          <div className="w-px h-4 bg-border mx-1" />
          <span className="font-mono text-[11px] font-bold text-primary">
            {CHART.id}
          </span>

          <div className="flex-1" />

          {/* Decision buttons */}
          <button
            onClick={() => setDecision("accept")}
            className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-[11px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            Accept
          </button>
          <button
            onClick={() => setDecision("accept-mod")}
            className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-[11px] font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Accept w/ Modification
          </button>
          <button
            onClick={() => setDecision("rework")}
            className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-[11px] font-bold rounded-lg border border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Send for Rework
          </button>
          <button
            onClick={() => setDecision("reject")}
            className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-[11px] font-bold rounded-lg border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            Reject
          </button>
        </div>

        {/* Chart info bar */}
        <div className="flex items-center gap-5 px-4 py-2.5">
          {/* Avatar + patient */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-black text-primary">
                {CHART.initials}
              </span>
            </div>
            <div>
              <p className="text-xs font-black text-foreground">
                {CHART.patientName}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {CHART.mrn}
              </p>
            </div>
          </div>

          <div className="w-px h-8 bg-border flex-shrink-0" />

          {/* Chart meta */}
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap">
            <span>
              <span className="font-semibold text-foreground">DRG:</span>{" "}
              {CHART.drg} · Wt {CHART.drgWeight}
            </span>
            <span>
              <span className="font-semibold text-foreground">Encounter:</span>{" "}
              {CHART.encounterType} · {CHART.admitDate} → {CHART.dischargeDate}
            </span>
            <span>
              <span className="font-semibold text-foreground">Provider:</span>{" "}
              {CHART.provider}
            </span>
            <span>
              <span className="font-semibold text-foreground">Facility:</span>{" "}
              {CHART.facility}
            </span>
          </div>

          <div className="flex-1" />

          {/* Right meta chips */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Audit Level */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${lvlCfg.bg} ${lvlCfg.border}`}
            >
              <Shield className={`w-3.5 h-3.5 ${lvlCfg.text}`} />
              <span className={`text-[11px] font-black ${lvlCfg.text}`}>
                {CHART.auditLevel}
              </span>
              <span
                className={`text-[9px] font-semibold ${lvlCfg.text} opacity-70`}
              >
                {lvlCfg.desc}
              </span>
            </div>

            {/* SLA */}
            <SlaChip hrs={CHART.slaHrsLeft} status={CHART.slaStatus} />

            {/* Coder */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border bg-muted/30">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <div>
                <div className="text-[11px] font-bold text-foreground">
                  {CHART.coder}
                </div>
                <div className="text-[8px] text-muted-foreground">
                  Coder · {CHART.coderSubmittedAt}
                </div>
              </div>
            </div>

            {/* Auditor */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-primary/20 bg-primary/5">
              <BadgeCheck className="w-3.5 h-3.5 text-primary" />
              <div>
                <div className="text-[11px] font-bold text-primary">
                  {CHART.auditor}
                </div>
                <div className="text-[8px] text-muted-foreground">Auditor</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MAIN SPLIT LAYOUT
      ══════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ═══════════════════════════
            LEFT: DOCUMENT VIEWER
        ═══════════════════════════ */}
        <div
          className="flex flex-col border-r border-border"
          style={{ width: "52%", minWidth: 0 }}
        >
          {/* Document tab bar */}
          <div className="flex-shrink-0 flex items-center gap-0.5 px-3 pt-2 pb-0 border-b border-border bg-muted/10 overflow-x-auto">
            {DOCS.map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  setActiveDoc(doc.id);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeDoc === doc.id
                    ? "border-primary text-primary bg-card"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-3 h-3" />
                {doc.name}
                {!doc.ocrDone && (
                  <RefreshCw className="w-2.5 h-2.5 animate-spin text-amber-500" />
                )}
              </button>
            ))}
          </div>

          {/* Viewer toolbar */}
          <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-muted/10 border-b border-border text-[10px]">
            {/* Zoom */}
            <div className="flex items-center gap-1 bg-card border border-border rounded-lg px-1 py-0.5">
              <button
                onClick={() => setZoom((z) => Math.max(60, z - 10))}
                className="p-1 rounded hover:bg-muted transition-colors"
              >
                <ZoomOut className="w-3 h-3 text-muted-foreground" />
              </button>
              <span className="font-bold text-foreground w-8 text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(160, z + 10))}
                className="p-1 rounded hover:bg-muted transition-colors"
              >
                <ZoomIn className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>

            <div className="w-px h-4 bg-border" />

            {/* OCR toggle */}
            <button
              onClick={() => setShowOcr((v) => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-colors ${
                showOcr
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <ScanText className="w-3 h-3" />
              OCR Overlay
            </button>

            {/* Highlight toggle */}
            <button
              onClick={() => setShowHighlights((v) => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-colors ${
                showHighlights
                  ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Highlighter className="w-3 h-3" />
              Highlights
            </button>

            <div className="flex-1" />

            {/* Page navigation */}
            <div className="flex items-center gap-1 bg-card border border-border rounded-lg px-1 py-0.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-3 h-3 text-muted-foreground" />
              </button>
              <span className="font-semibold text-foreground px-1">
                Page <strong>{page}</strong> of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* OCR info banner */}
          {showOcr && (
            <div className="flex-shrink-0 flex items-center gap-2 px-4 py-1.5 bg-blue-50 border-b border-blue-200 text-[10px] text-blue-700">
              <Cpu className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                <strong>OCR Overlay Active</strong> — Blue rings indicate
                OCR-extracted text regions. Hover highlights to see code
                linkages.
              </span>
            </div>
          )}

          {/* Document area */}
          <div
            className="flex-1 overflow-y-auto bg-slate-100"
            style={{ fontSize: `${zoom}%` }}
          >
            {activeDoc === "D1" ? (
              <DocPage
                pageContent={PAGE_CONTENT}
                showOcr={showOcr}
                showHighlights={showHighlights}
              />
            ) : (
              <div className="mx-4 my-3 bg-white shadow-lg rounded border border-slate-200 p-7 min-h-[500px] flex flex-col items-center justify-center gap-4">
                <FileText className="w-12 h-12 text-slate-300" />
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-500">
                    {DOCS.find((d) => d.id === activeDoc)?.name}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {DOCS.find((d) => d.id === activeDoc)?.pages} pages ·{" "}
                    {DOCS.find((d) => d.id === activeDoc)?.ocrDone
                      ? "OCR Complete"
                      : "OCR In Progress"}
                  </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                  Open Document
                </button>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2 bg-card border-t border-border text-[9px] font-bold text-muted-foreground">
            <span className="text-[9px] font-black text-foreground uppercase tracking-wide">
              Legend:
            </span>
            {[
              {
                color: "bg-yellow-200 border-yellow-400",
                label: "Diagnosis (ICD)",
              },
              {
                color: "bg-emerald-200 border-emerald-500",
                label: "Procedure (CPT)",
              },
              {
                color: "bg-blue-200 border-blue-400 border-dashed",
                label: "AI Detected",
              },
              {
                color: "bg-red-200 border-red-500",
                label: "Flagged / Incorrect",
              },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className={`w-4 h-3 rounded-sm border-b-2 ${l.color}`} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════
            RIGHT: REVIEW PANEL
        ═══════════════════════════ */}
        <div
          className="flex flex-col bg-background"
          style={{ width: "48%", minWidth: 0 }}
        >
          {/* ── DOS Tab Strip ── */}
          <div className="flex-shrink-0 border-b border-border bg-card">
            <div className="flex items-stretch overflow-x-auto">
              {/* DOS label */}
              <div className="flex items-center px-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest flex-shrink-0 border-r border-border bg-muted/30 sticky left-0 z-10">
                DOS
              </div>

              {dosEntries.map((entry, i) => {
                const isActive = activeDoS === i;
                return (
                  <div
                    key={entry.id}
                    className="relative flex-shrink-0 border-r border-border/50 last:border-r-0 group/dtab"
                  >
                    <button
                      onClick={() => {
                        setActiveDoS(i);
                        setDosCtxMenu(null);
                      }}
                      className={`flex flex-col items-start px-2.5 pt-2 pb-1.5 min-w-[80px] border-b-2 transition-colors w-full ${isActive ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/30"}`}
                    >
                      <div className="flex items-center gap-1 w-full">
                        <span
                          className={`text-[10px] font-black leading-none ${isActive ? "text-primary" : "text-foreground"}`}
                        >
                          {entry.date}
                        </span>
                        {entry.sub && (
                          <span
                            className={`text-[8px] font-black px-1 py-0.5 rounded leading-none ${entry.sub === "Admit" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                          >
                            {entry.sub}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[8px] mt-0.5 leading-none truncate max-w-[70px] ${isActive ? "text-primary/70" : "text-muted-foreground"}`}
                      >
                        {entry.encounterType}
                      </span>
                    </button>
                    {/* Remove button (non-initial entries) */}
                    {i >= AUDIT_DOS_INITIAL.length && (
                      <button
                        onClick={() => {
                          setDosEntries((prev) =>
                            prev.filter((_, idx) => idx !== i),
                          );
                          setActiveDoS((prev) =>
                            Math.min(prev, dosEntries.length - 2),
                          );
                        }}
                        className="absolute top-1 right-0.5 w-4 h-4 rounded flex items-center justify-center opacity-0 group-hover/dtab:opacity-100 bg-muted/50 hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-all"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add Encounter button */}
              <button
                onClick={() => setShowAddEnc((v) => !v)}
                className={`flex items-center gap-1 px-2.5 flex-shrink-0 text-[10px] font-bold border-b-2 transition-colors whitespace-nowrap ${
                  showAddEnc
                    ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                    : "border-transparent text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                <Plus
                  className={`w-3 h-3 transition-transform ${showAddEnc ? "rotate-45" : ""}`}
                />
                <span className="hidden sm:inline">Add DOS</span>
              </button>
            </div>

            {/* ── Inline Add DOS Form ── */}
            {showAddEnc && (
              <div className="border-t-2 border-emerald-500 bg-card">
                {/* Form header */}
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50/60">
                  <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-3 h-3 text-emerald-700" />
                  </div>
                  <span className="text-[11px] font-black text-emerald-800 flex-1">
                    New Date of Service
                  </span>
                  <button
                    onClick={() => {
                      setShowAddEnc(false);
                      setDosForm({
                        isoDate: "",
                        encounterType: "Inpatient",
                        provider: PROVIDERS_AUDIT[0],
                      });
                    }}
                    className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* Form fields */}
                <div className="px-4 py-3 grid grid-cols-3 gap-3">
                  {/* Date of Service */}
                  <div>
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5">
                      Date of Service <span className="text-red-500">*</span>
                    </label>
                    <input
                      autoFocus
                      type="date"
                      value={dosForm.isoDate}
                      onChange={(e) =>
                        setDosForm((f) => ({ ...f, isoDate: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && dosForm.isoDate)
                          handleAddDos();
                        if (e.key === "Escape") setShowAddEnc(false);
                      }}
                      className="w-full text-[10px] border border-border rounded-lg px-2.5 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-shadow"
                    />
                  </div>
                  {/* Encounter Type */}
                  <div>
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5">
                      Encounter Type
                    </label>
                    <select
                      value={dosForm.encounterType}
                      onChange={(e) =>
                        setDosForm((f) => ({
                          ...f,
                          encounterType: e.target.value,
                        }))
                      }
                      className="w-full text-[10px] border border-border rounded-lg px-2.5 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-400/40 appearance-none"
                    >
                      {ENC_TYPES_AUDIT.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  {/* Provider */}
                  <div>
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5">
                      Provider
                    </label>
                    <input
                      type="text"
                      value={dosForm.provider}
                      onChange={(e) =>
                        setDosForm((f) => ({ ...f, provider: e.target.value }))
                      }
                      placeholder={PROVIDERS_AUDIT[0]}
                      list="audit-dos-provider-list"
                      className="w-full text-[10px] border border-border rounded-lg px-2.5 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                    />
                    <datalist id="audit-dos-provider-list">
                      {PROVIDERS_AUDIT.map((p) => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  </div>
                </div>
                {/* Form footer */}
                <div className="flex items-center justify-end gap-2 px-4 pb-3 pt-0 border-t border-border mt-0">
                  <button
                    onClick={() => {
                      setShowAddEnc(false);
                      setDosForm({
                        isoDate: "",
                        encounterType: "Inpatient",
                        provider: PROVIDERS_AUDIT[0],
                      });
                    }}
                    className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddDos}
                    disabled={!dosForm.isoDate}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-black rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3 h-3" />
                    Add DOS
                  </button>
                </div>
              </div>
            )}

            {/* Active DOS context strip */}
            <div className="flex items-center gap-2 px-3 py-1.5 border-t border-border bg-muted/10">
              <Stethoscope className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="text-[10px] font-black text-foreground">
                {dosEntries[activeDoS]?.date}
              </span>
              <span className="text-muted-foreground/40 text-[10px]">·</span>
              <span
                className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${dosEntries[activeDoS]?.encounterType === "Inpatient" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-muted border-border text-muted-foreground"}`}
              >
                {dosEntries[activeDoS]?.encounterType}
              </span>
              <span className="text-muted-foreground/40 text-[10px] hidden sm:inline">
                ·
              </span>
              <span className="text-[10px] text-muted-foreground truncate hidden sm:block flex-1">
                {dosEntries[activeDoS]?.provider}
              </span>
              <button
                onClick={() => setShowAddEnc(true)}
                className="ml-auto flex items-center gap-1 text-[9px] font-bold text-emerald-600 hover:text-emerald-700 border border-emerald-200 rounded-md px-2 py-0.5 hover:bg-emerald-50 transition-colors flex-shrink-0"
              >
                <Plus className="w-2.5 h-2.5" />
                Add Encounter
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex-shrink-0 flex items-center gap-1 px-4 pt-3 pb-0 border-b border-border bg-card">
            {(
              [
                [
                  "comparison",
                  "Code Comparison",
                  ICD_ROWS.filter((r) => r.status !== "matched").length +
                    CPT_ROWS.filter((r) => r.status !== "matched").length,
                ],
                ["alerts", "Quality Alerts", errorCount + warningCount],
                ["comments", "Comments & Trail", 0],
              ] as [typeof activeTab, string, number][]
            ).map(([id, label, badge]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
                {badge > 0 && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === id
                        ? "bg-primary text-white"
                        : id === "alerts" && errorCount > 0
                          ? "bg-red-100 text-red-700"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {activeTab === "comparison" && <CodeComparisonTab />}
            {activeTab === "alerts" && <QualityAlertsTab />}
            {activeTab === "comments" && <CommentsTrailTab />}
          </div>

          {/* Sticky bottom decision bar */}
          <div className="flex-shrink-0 bg-card border-t border-border px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            {confirmed ? (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-800">
                    Audit Decision Submitted
                  </p>
                  <p className="text-[10px] text-emerald-700">{confirmed}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                {/* Quick stats */}
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-1 min-w-0">
                  <span>
                    <strong className="text-emerald-600">
                      {
                        [...ICD_ROWS, ...CPT_ROWS].filter(
                          (r) => r.status === "matched",
                        ).length
                      }
                    </strong>{" "}
                    matched
                  </span>
                  <span className="text-border">·</span>
                  <span>
                    <strong className="text-red-600">{errorCount}</strong>{" "}
                    errors
                  </span>
                  <span className="text-border">·</span>
                  <span>
                    <strong className="text-amber-600">{warningCount}</strong>{" "}
                    warnings
                  </span>
                  <span className="text-border">·</span>
                  <span className="text-primary font-semibold">
                    Awaiting decision
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <button
                    onClick={() => setDecision("accept")}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-[11px] font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Accept
                  </button>
                  <button
                    onClick={() => setDecision("accept-mod")}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-[11px] font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Accept w/ Mod
                  </button>
                  <button
                    onClick={() => setDecision("rework")}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-[11px] font-bold rounded-xl border border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Rework
                  </button>
                  <button
                    onClick={() => setDecision("reject")}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-[11px] font-bold rounded-xl border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      <DecisionModal
        dec={decision}
        onClose={() => setDecision(null)}
        onConfirm={(notes) => {
          const labels: Record<NonNullable<AuditDec>, string> = {
            accept: "Audit accepted",
            "accept-mod": "Accepted with modifications",
            rework: "Sent for rework",
            reject: "Chart rejected",
          };
          if (decision)
            setConfirmed(
              `${labels[decision]} — ${new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })} IST`,
            );
          setDecision(null);
        }}
      />
    </div>
  );
}
