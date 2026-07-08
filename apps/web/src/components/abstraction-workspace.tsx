import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Maximize2,
  FileText,
  ArrowUpRight,
  Search,
  X,
  Plus,
  Check,
  AlertTriangle,
  Send,
  Sparkles,
  CheckCircle2,
  User,
  Calendar,
  Stethoscope,
  ClipboardList,
  ChevronDown,
  Upload,
  Activity,
  Pill,
  Clock,
  Heart,
  ArrowLeft,
  Paperclip,
  RefreshCw,
  Flag,
  AlertCircle,
  Save,
  Highlighter,
  RotateCcw,
  FlaskConical,
  ScanLine,
  FileSearch,
  Info,
  Microscope,
  BadgeCheck,
  ShieldAlert,
  BarChart3,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetApiHedisAbstractorDraftPatientid,
  useGetApiHedisAbstractorMeasuresPatientid,
  useGetApiHedisEvidenceTimelineId,
  useGetApiMeasureLibraryId,
  useGetApiPatients,
  useGetApiProfileMe,
  usePostApiHedisAbstractorMarkNotFound,
  usePostApiHedisAbstractorSaveDraft,
  usePostApiHedisSendToQa,
} from "@/api";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */
type EventType = "encounter" | "lab" | "imaging" | "medication" | "document";
type HedisMatch = "satisfies" | "fails" | "supporting" | null;

interface TLEvent {
  id: string;
  date: string;
  isoDate: string;
  year: number;
  month: string;
  type: EventType;
  title: string;
  subtitle: string;
  code: string;
  codeType: string;
  provider: string;
  value?: string;
  hedisRelevant: boolean;
  hedisMatch: HedisMatch;
  docPage?: number;
  notes?: string;
}
interface FormData {
  serviceDate: string;
  screeningType: string;
  evidenceType: string;
  systolic: string;
  diastolic: string;
  cptCode: string;
  icdCode: string;
  evidenceSource: string;
  notes: string;
  numerator: string;
}
interface DocSegment {
  text: string;
  highlight?: "dx" | "cpt" | "value" | "ai";
}
interface DocPage {
  number: number;
  title: string;
  content: DocSegment[];
}

/* ══════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════ */
const CHART = {
  id: "CHT-4891",
  patientName: "Anderson, Jennifer K.",
  mrn: "MBR-2026-00142",
  dob: "10/03/1971",
  age: 54,
  gender: "Female",
  measure: "Controlling Blood Pressure",
  measureCode: "CBP",
  plan: "Medicare Advantage",
  status: "Gap Open" as const,
  assignedTo: "S. Johnson, RN",
  assignedAvatar: "SJ",
  slaHrsLeft: 8,
  pcp: "Dr. Rajesh Sharma, MD",
  measurePeriod: "Jan 1 – Dec 31, 2025",
  numeratorCriteria: "Most recent BP < 140/90 mmHg during measurement period",
  chartId: "CHT-4891",
};

const DOCUMENTS = [
  {
    id: "DOC-001",
    name: "Discharge Summary",
    pages: 6,
    ocrDone: true,
    size: "1.2 MB",
  },
  {
    id: "DOC-002",
    name: "Lab Results",
    pages: 4,
    ocrDone: true,
    size: "0.4 MB",
  },
  {
    id: "DOC-003",
    name: "Nephrology Consult Note",
    pages: 3,
    ocrDone: false,
    size: "0.8 MB",
  },
];

const PAGES: DocPage[] = [
  {
    number: 1,
    title: "Discharge Summary – Page 1",
    content: [
      {
        text: "APOLLO HOSPITAL & RESEARCH CENTRE\nDEPARTMENT OF INTERNAL MEDICINE\nDISCHARGE SUMMARY\n\n",
      },
      { text: "Patient: " },
      { text: "Anderson, Jennifer K.", highlight: "value" },
      { text: "   DOB: 10/03/1971   Age: 54 F\nMRN: " },
      { text: "MBR-2026-00142", highlight: "value" },
      {
        text: "   Admit: 2026-01-14   Discharge: 2026-01-18\nPCP: Dr. Rajesh Sharma, MD   Plan: Medicare Advantage\n\n",
      },
      { text: "PRINCIPAL DIAGNOSIS\n" },
      {
        text: "E11.9 — Type 2 Diabetes Mellitus, without complications",
        highlight: "dx",
      },
      {
        text: "\nAdmitted for glycemic management and blood pressure optimization\n\n",
      },
      { text: "VITAL SIGNS ON ADMISSION\n" },
      { text: "BP: 164/98 mmHg", highlight: "value" },
      { text: "   HR: 88   RR: 16   Temp: 98.6°F   SpO₂: 98%\n\n" },
      { text: "BP HISTORY (EHR Longitudinal Pull)\n" },
      {
        text: "2025-10-15: 142/88 mmHg\n2025-08-03: 148/92 mmHg\n2025-04-12: 146/90 mmHg\n",
        highlight: "value",
      },
      {
        text: "\nACTIVE MEDICATIONS\nAmlodipine 10 mg daily · Lisinopril 20 mg daily\nMetformin 1000 mg BID · Insulin Glargine 20 units QHS\n\n",
      },
      {
        text: "DISCHARGE PLAN: Follow up with PCP in 2 weeks. BP goal <140/90.\n",
      },
    ],
  },
  {
    number: 2,
    title: "Lab Results – Jan 14, 2026",
    content: [
      {
        text: "LABORATORY REPORT\nApollo Hospital · Specimen: 2026-01-14 07:22\n\n━━━ BASIC METABOLIC PANEL ━━━\n",
      },
      { text: "Glucose: 312 mg/dL  [H]", highlight: "value" },
      {
        text: "\nCreatinine: 1.8 mg/dL  eGFR: 42  BUN: 24\nSodium: 138  Potassium: 4.2  CO₂: 23\n\n",
      },
      { text: "━━━ HEMOGLOBIN A1c ━━━\n" },
      { text: "HbA1c: 9.2%  [H]   (Reference: <5.7%)", highlight: "value" },
      { text: "\n\n━━━ LIPID PANEL ━━━\n" },
      {
        text: "Total Chol: 218 [H]   LDL: 128 [H]\nHDL: 41 [L]   Triglycerides: 243 [H]",
        highlight: "value",
      },
      {
        text: "\n\n━━━ COMPLETE BLOOD COUNT ━━━\nWBC: 7.2   Hgb: 11.8 [L]   Hct: 35.4 [L]   Plt: 244\n",
      },
    ],
  },
  {
    number: 3,
    title: "Nephrology Consult — Jul 22, 2025",
    content: [
      {
        text: "NEPHROLOGY CONSULTATION NOTE\nDr. Sunita Patel, MD, FASN\nJuly 22, 2025 — 10:14 AM\n\nREFERRAL: CKD Stage 3 — Quarterly monitoring\n\n",
      },
      { text: "VITAL SIGNS\n" },
      { text: "Blood Pressure: 136/86 mmHg", highlight: "ai" },
      { text: "   Heart Rate: 74   Weight: 168 lbs\n\n" },
      {
        text: "ASSESSMENT\nCKD Stage 3 stable. eGFR 44 (improved from 42 prior quarter).\n",
      },
      {
        text: "Blood pressure well-controlled on current antihypertensive regimen.\nBP 136/86 satisfies CBP HEDIS numerator criteria (<140/90).",
        highlight: "ai",
      },
      {
        text: "\n\nPLAN: Continue Lisinopril 20 mg and Amlodipine 10 mg unchanged.\nRecheck BMP in 3 months.\n\n",
      },
      { text: "CPT: " },
      {
        text: "99214 — Office/Outpatient Visit, Established, Moderate Complexity",
        highlight: "cpt",
      },
      { text: "\nICD-10: " },
      {
        text: "N18.3 — CKD Stage 3   I10 — Essential Hypertension",
        highlight: "dx",
      },
      {
        text: "\n\n— Electronically signed: Dr. Sunita Patel, MD  07/22/2025 11:42 AM\n",
      },
    ],
  },
];

const TIMELINE_EVENTS: TLEvent[] = [
  {
    id: "e1",
    date: "Jan 14, 2026",
    isoDate: "2026-01-14",
    year: 2026,
    month: "January 2026",
    type: "encounter",
    title: "Inpatient Admission",
    subtitle: "Apollo Hospital — Inpatient",
    code: "99223",
    codeType: "CPT",
    provider: "Dr. Rajesh Sharma, MD",
    value: "BP: 164/98 mmHg",
    hedisRelevant: true,
    hedisMatch: "fails",
    docPage: 1,
    notes:
      "Severely elevated. Outside 2025 measurement period — not eligible for CBP numerator.",
  },
  {
    id: "e2",
    date: "Oct 15, 2025",
    isoDate: "2025-10-15",
    year: 2025,
    month: "October 2025",
    type: "encounter",
    title: "Office Visit — Hypertension F/U",
    subtitle: "General Medicine",
    code: "99213",
    codeType: "CPT",
    provider: "Dr. Rajesh Sharma, MD",
    value: "BP: 142/88 mmHg",
    hedisRelevant: true,
    hedisMatch: "fails",
    docPage: 1,
    notes: "BP 142/88 — exceeds CBP threshold of <140/90. Systolic borderline.",
  },
  {
    id: "e3",
    date: "Sep 9, 2025",
    isoDate: "2025-09-09",
    year: 2025,
    month: "September 2025",
    type: "lab",
    title: "Basic Metabolic Panel",
    subtitle: "Quest Diagnostics",
    code: "80048",
    codeType: "CPT",
    provider: "Dr. Rajesh Sharma, MD",
    value: "Glucose: 218 H · eGFR: 44",
    hedisRelevant: false,
    hedisMatch: null,
    docPage: 2,
  },
  {
    id: "e4",
    date: "Aug 3, 2025",
    isoDate: "2025-08-03",
    year: 2025,
    month: "August 2025",
    type: "encounter",
    title: "Office Visit — Diabetes F/U",
    subtitle: "General Medicine",
    code: "99214",
    codeType: "CPT",
    provider: "Dr. Rajesh Sharma, MD",
    value: "BP: 148/92 mmHg",
    hedisRelevant: true,
    hedisMatch: "fails",
    docPage: 1,
    notes: "BP 148/92 — fails CBP. Both values exceed threshold.",
  },
  {
    id: "e5",
    date: "Jul 22, 2025",
    isoDate: "2025-07-22",
    year: 2025,
    month: "July 2025",
    type: "encounter",
    title: "Nephrology Consultation",
    subtitle: "Nephrology Dept.",
    code: "99214",
    codeType: "CPT",
    provider: "Dr. Sunita Patel, MD",
    value: "BP: 136/86 mmHg",
    hedisRelevant: true,
    hedisMatch: "satisfies",
    docPage: 3,
    notes:
      "BP 136/86 — satisfies CBP numerator (<140/90). AI-detected in consult note. Recommend using this as evidence.",
  },
  {
    id: "e6",
    date: "Jun 16, 2025",
    isoDate: "2025-06-16",
    year: 2025,
    month: "June 2025",
    type: "lab",
    title: "HbA1c — Hemoglobin A1c",
    subtitle: "LabCorp",
    code: "83036",
    codeType: "CPT",
    provider: "Dr. Rajesh Sharma, MD",
    value: "HbA1c: 9.2% H",
    hedisRelevant: false,
    hedisMatch: null,
    docPage: 2,
  },
  {
    id: "e7",
    date: "Apr 12, 2025",
    isoDate: "2025-04-12",
    year: 2025,
    month: "April 2025",
    type: "encounter",
    title: "Annual Wellness Visit",
    subtitle: "Preventive Care",
    code: "G0439",
    codeType: "CPT",
    provider: "Dr. Priya Nair, MD",
    value: "BP: 146/90 mmHg",
    hedisRelevant: true,
    hedisMatch: "fails",
    notes:
      "Borderline — does not satisfy (<140/90 required). Systolic at exactly threshold.",
  },
  {
    id: "e8",
    date: "Mar 5, 2025",
    isoDate: "2025-03-05",
    year: 2025,
    month: "March 2025",
    type: "medication",
    title: "Amlodipine 10 mg — Refill",
    subtitle: "90-day Rx · Walgreens",
    code: "0069-1540",
    codeType: "NDC",
    provider: "Dr. Rajesh Sharma, MD",
    value: "90-day supply",
    hedisRelevant: false,
    hedisMatch: null,
  },
  {
    id: "e9",
    date: "Jan 22, 2025",
    isoDate: "2025-01-22",
    year: 2025,
    month: "January 2025",
    type: "lab",
    title: "Lipid Panel",
    subtitle: "Quest Diagnostics",
    code: "80061",
    codeType: "CPT",
    provider: "Dr. Rajesh Sharma, MD",
    value: "LDL: 128 H · TG: 243 H",
    hedisRelevant: false,
    hedisMatch: null,
    docPage: 2,
  },
  {
    id: "e10",
    date: "Nov 14, 2024",
    isoDate: "2024-11-14",
    year: 2024,
    month: "November 2024",
    type: "encounter",
    title: "Office Visit — Routine F/U",
    subtitle: "General Medicine",
    code: "99214",
    codeType: "CPT",
    provider: "Dr. Anil Kumar, MD",
    value: "BP: 138/84 mmHg",
    hedisRelevant: true,
    hedisMatch: "satisfies",
    notes:
      "BP 138/84 satisfies CBP — but in measurement year 2024. Not valid for 2025 gap closure.",
  },
  {
    id: "e11",
    date: "Sep 20, 2024",
    isoDate: "2024-09-20",
    year: 2024,
    month: "September 2024",
    type: "lab",
    title: "HbA1c — Hemoglobin A1c",
    subtitle: "LabCorp",
    code: "83036",
    codeType: "CPT",
    provider: "Dr. Rajesh Sharma, MD",
    value: "HbA1c: 8.4% H",
    hedisRelevant: false,
    hedisMatch: null,
  },
  {
    id: "e12",
    date: "Aug 12, 2024",
    isoDate: "2024-08-12",
    year: 2024,
    month: "August 2024",
    type: "medication",
    title: "Lisinopril 20 mg — New Rx",
    subtitle: "ACE Inhibitor",
    code: "68180-0519",
    codeType: "NDC",
    provider: "Dr. Rajesh Sharma, MD",
    value: "Initial 30-day supply",
    hedisRelevant: false,
    hedisMatch: null,
  },
  {
    id: "e13",
    date: "Apr 8, 2024",
    isoDate: "2024-04-08",
    year: 2024,
    month: "April 2024",
    type: "imaging",
    title: "Colonoscopy — Screening",
    subtitle: "GI Procedures Lab",
    code: "45378",
    codeType: "CPT",
    provider: "Dr. Anil Kumar, MD",
    value: "Result: Normal",
    hedisRelevant: false,
    hedisMatch: "supporting",
  },
  {
    id: "e14",
    date: "Feb 28, 2024",
    isoDate: "2024-02-28",
    year: 2024,
    month: "February 2024",
    type: "document",
    title: "Cardiology Consult — Uploaded",
    subtitle: "External document",
    code: "",
    codeType: "",
    provider: "Dr. Heart Specialist, MD",
    value: "Uploaded by: S. Johnson",
    hedisRelevant: false,
    hedisMatch: null,
  },
];

const EVENT_CFG: Record<
  EventType,
  {
    icon: React.ElementType;
    dot: string;
    bg: string;
    text: string;
    border: string;
    label: string;
  }
> = {
  encounter: {
    icon: Stethoscope,
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    label: "Encounter",
  },
  lab: {
    icon: FlaskConical,
    dot: "bg-violet-500",
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    label: "Lab",
  },
  imaging: {
    icon: ScanLine,
    dot: "bg-cyan-500",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    label: "Imaging",
  },
  medication: {
    icon: Pill,
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    label: "Medication",
  },
  document: {
    icon: FileText,
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    label: "Document",
  },
};

const SCREENING_TYPES = [
  "Standard Blood Pressure Reading",
  "Home BP Monitoring Reading",
  "Telehealth BP Reading",
  "Automated BP Device Reading",
  "Manual Auscultation",
];
const EVIDENCE_TYPES = [
  "Office Visit BP Reading",
  "Specialist Consult BP Reading",
  "Telehealth Visit BP Reading",
  "Home BP Monitoring Record",
  "Annual Wellness Visit",
  "Emergency Dept. Reading",
  "Urgent Care Reading",
];
const CPT_OPTIONS = [
  "99211 — Office Visit, Level 1",
  "99212 — Office Visit, Level 2",
  "99213 — Office Visit, Level 3",
  "99214 — Office Visit, Level 4",
  "99215 — Office Visit, Level 5",
  "99397 — Preventive Visit, Est., 65+",
  "G0438 — Annual Wellness Visit, Initial",
  "G0439 — Annual Wellness Visit, Subsequent",
];
const ICD_OPTIONS = [
  "I10 — Essential (Primary) Hypertension",
  "I11.9 — Hypertensive Heart Disease w/o HF",
  "I12.9 — Hypertensive Chronic Kidney Disease",
  "N18.3 — Chronic Kidney Disease, Stage 3",
  "E11.9 — Type 2 DM, w/o Complications",
];
const EVIDENCE_SOURCES = [
  "Electronic Health Record (EHR)",
  "Physician Office Chart Note",
  "Hospital Medical Record",
  "Specialist Consultation Note",
  "Telehealth Encounter Record",
  "Home BP Monitoring Report",
  "Patient-Reported Form",
];

const EMPTY_FORM: FormData = {
  serviceDate: "",
  screeningType: "",
  evidenceType: "",
  systolic: "",
  diastolic: "",
  cptCode: "",
  icdCode: "",
  evidenceSource: "",
  notes: "",
  numerator: "",
};

/* ══════════════════════════════════════════════════════════════
   DOCUMENT VIEWER
══════════════════════════════════════════════════════════════ */
function DocumentViewer({
  requestPage,
  flashActive,
  flashCode,
  fullscreen,
  onToggleFullscreen,
  pdfUrl,
}: {
  requestPage?: number;
  flashActive?: boolean;
  flashCode?: string | null;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  pdfUrl?: string;
}) {
  // const [activeDoc, setActiveDoc] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [ocrMode, setOcrMode] = useState(false);
  const [hlMode, setHlMode] = useState(true);
  const [numPages, setNumPages] = useState(0);
  const [file, setFile] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error(error);
  };

  // const doc = DOCUMENTS[activeDoc];
  // const total = Math.min(PAGES.length, doc.pages);
  // const docPage = PAGES[page - 1] ?? PAGES[0];

  useEffect(() => {
    if (pdfUrl) {
      setFile(pdfUrl);
    } else {
      setFile(null);
    }
  }, [pdfUrl]);

  return (
    <div className="flex flex-col h-full bg-[#e8eaed]">
      {/* ── Doc tabs ── */}
      <div className="flex items-center border-b border-border bg-card overflow-x-auto flex-shrink-0 shadow-sm">
        {/* {DOCUMENTS.map((d, i) => (
          <button
            key={d.id}
            onClick={() => {
              setActiveDoc(i);
              setPage(1);
            }}
            className={`group flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-semibold whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
              activeDoc === i
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <FileText className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[90px]">{d.name}</span>
            {d.ocrDone ? (
              <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-1 rounded">
                OCR
              </span>
            ) : (
              <span className="text-[8px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-1 rounded">
                PENDING
              </span>
            )}
          </button>
        ))} */}
        <div className="flex items-center px-3 py-2">
          <FileText className="w-4 h-4 mr-2" />

          <span className="text-[11px] font-semibold truncate">
            {pdfUrl ? pdfUrl.split("/").pop() : "No PDF Selected"}
          </span>
        </div>
      </div>

      {/* ── Viewer toolbar ── */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-[#3c4043] border-b border-[#2a2d30] flex-shrink-0">
        {/* Page nav */}
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 text-white/70 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-1 text-[11px] text-white/80 font-mono px-1">
          <input
            type="number"
            value={page}
            min={1}
            max={numPages}
            onChange={(e) =>
              setPage(
                Math.min(numPages, Math.max(1, parseInt(e.target.value) || 1)),
              )
            }
            className="w-8 text-center bg-white/10 border border-white/20 rounded text-white text-[10px] px-1 py-0.5 focus:outline-none focus:border-white/40"
          />
          <span className="opacity-50">/</span>
          <span className="opacity-60">{numPages}</span>
        </div>
        <button
          onClick={() => setPage((p) => Math.min(numPages, p + 1))}
          disabled={page >= numPages}
          className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 text-white/70 transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-white/20 mx-1" />

        {/* Zoom */}
        <button
          onClick={() => setZoom((z) => Math.max(60, z - 15))}
          className="p-1.5 rounded hover:bg-white/10 text-white/70"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom(100)}
          className="px-2 text-[10px] font-mono text-white/70 hover:bg-white/10 rounded min-w-[38px] text-center py-1 transition-colors"
        >
          {zoom}%
        </button>
        <button
          onClick={() => setZoom((z) => Math.min(200, z + 15))}
          className="p-1.5 rounded hover:bg-white/10 text-white/70"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-white/20 mx-1" />

        {/* Tools */}
        <button
          onClick={() => setHlMode((v) => !v)}
          className={`flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded transition-colors ${
            hlMode
              ? "bg-amber-400/30 text-amber-300 border border-amber-400/40"
              : "text-white/50 hover:bg-white/10"
          }`}
        >
          <Highlighter className="w-3 h-3" />
          <span className="hidden xl:inline">Highlight</span>
        </button>

        <button
          onClick={() => setOcrMode((v) => !v)}
          className={`flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded transition-colors ${
            ocrMode
              ? "bg-blue-400/30 text-blue-300 border border-blue-400/40"
              : "text-white/50 hover:bg-white/10"
          }`}
        >
          <ScanLine className="w-3 h-3" />
          <span className="hidden xl:inline">OCR</span>
        </button>

        <div className="flex-1" />

        {/* Fit + Fullscreen */}
        <button
          onClick={() => setZoom(100)}
          className="p-1.5 rounded hover:bg-white/10 text-white/70"
          title="Reset zoom"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
        <button
          onClick={onToggleFullscreen}
          className="p-1.5 rounded hover:bg-white/10 text-white/70"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── AI / Flash banner ── */}
      {flashActive && flashCode && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-semibold flex-shrink-0 animate-pulse">
          <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
          Navigated to evidence for{" "}
          <span className="font-mono font-black mx-1 bg-white/20 px-1 rounded">
            {flashCode}
          </span>
          — highlighted in document below
        </div>
      )}

      {/* ── Page canvas ── */}
      <div className="flex-1 overflow-auto p-4">
        <div
          className="mx-auto bg-white shadow-2xl border border-slate-300/60 rounded-sm"
          style={{
            width: `${Math.max(zoom, 60)}%`,
            minWidth: "260px",
            maxWidth: "900px",
          }}
        >
          {/* Page header chrome */}
          {/* <div className="bg-[#1a1f2e] text-white px-5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded bg-blue-500/30 flex items-center justify-center">
                <FileText className="w-2.5 h-2.5 text-blue-300" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">
                  Apollo Hospital & Research Centre
                </p>
                <p className="text-[10px] font-semibold text-white/90">
                  {docPage.title}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-white/40 font-mono">{CHART.mrn}</p>
              <p className="text-[8px] text-white/40">
                Pg {page} of {numPages}
              </p>
            </div>
          </div> */}

          {/* OCR mode banner */}
          {/* {ocrMode && (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 border-b border-blue-200">
              <Eye className="w-3 h-3 text-blue-600" />
              <span className="text-[10px] text-blue-700 font-semibold">
                OCR Active
              </span>
              <span className="text-[10px] text-blue-500">
                — 99.2% confidence · {docPage.content.length} text blocks
                extracted
              </span>
            </div>
          )} */}

          {/* Document body */}
          {/* <div
            className={`px-6 py-5 ${ocrMode ? "bg-blue-50/10" : ""}`}
            style={{
              fontFamily: "'Courier New', monospace",
              lineHeight: "1.85",
              fontSize: "11px",
            }}
          >
            <div className="text-slate-800 whitespace-pre-wrap">
              {docPage.content.map((seg, si) => {
                if (!seg.highlight || !hlMode)
                  return <span key={si}>{seg.text}</span>;
                const cls =
                  seg.highlight === "ai"
                    ? `bg-emerald-100 text-emerald-900 border-b-2 border-emerald-500 rounded-sm px-0.5 ${flashActive ? "ring-2 ring-emerald-400 ring-offset-1" : ""}`
                    : seg.highlight === "dx"
                      ? `bg-blue-100 text-blue-900 border-b-2 border-blue-400 rounded-sm px-0.5 ${flashActive ? "ring-2 ring-blue-400 ring-offset-1" : ""}`
                      : seg.highlight === "cpt"
                        ? `bg-violet-100 text-violet-900 border-b-2 border-violet-400 rounded-sm px-0.5`
                        : `bg-amber-50 text-amber-900 font-bold`;
                return (
                  <span key={si} className={cls}>
                    {seg.text}
                  </span>
                );
              })}
            </div>
          </div> */}

          {/* Page footer */}
          {/* <div className="border-t border-slate-200 px-5 py-2 flex justify-between items-center bg-slate-50">
            <span className="text-[8px] text-slate-400 font-mono uppercase tracking-wider">
              CONFIDENTIAL — MEDICAL RECORD — DO NOT DISTRIBUTE
            </span>
            <span className="text-[8px] text-slate-400">
              Page {page} of {numPages}
            </span>
          </div> */}
          <div className="flex justify-center bg-slate-200 p-4">
            {file ? (
              <iframe
                src={file}
                className="w-full h-[85vh] bg-white"
                title="PDF Viewer"
              />
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                No PDF Selected
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Highlight legend ── */}
      <div className="flex items-center gap-4 px-3 py-2 bg-card border-t border-border flex-shrink-0">
        <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide">
          Legend:
        </span>
        <span className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
          <span className="w-4 h-2 bg-emerald-100 border-b-2 border-emerald-500 inline-block rounded-sm" />
          AI Evidence
        </span>
        <span className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
          <span className="w-4 h-2 bg-blue-100 border-b-2 border-blue-400 inline-block rounded-sm" />
          ICD-10 Dx
        </span>
        <span className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
          <span className="w-4 h-2 bg-violet-100 border-b-2 border-violet-400 inline-block rounded-sm" />
          CPT Code
        </span>
        <span className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
          <span className="w-4 h-2 bg-amber-50 border border-amber-200 inline-block rounded-sm" />
          Clinical Value
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   EVIDENCE TIMELINE
══════════════════════════════════════════════════════════════ */
function EvidenceTimeline({
  measure,
  timeline,
  loading,
  filter,
  search,
  onFilterChange,
  onSearchChange,
  onSelectEvent,
  onAutoFillEvidence,
}: {
  measure?: any;
  timeline: Record<string, any>;
  loading: boolean;
  filter: string;
  search: string;
  onFilterChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onSelectEvent: (docPage: number, code: string) => void;
  onAutoFillEvidence: (ev: any) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>("e5");
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-card">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">
            Loading Evidence Timeline...
          </p>
        </div>
      </div>
    );
  }

  const getEvidenceStatus = (ev: any) => {
    switch (ev.review_status) {
      case "ACCEPTED":
        return "satisfies";
      case "REJECTED":
        return "fails";
      case "PENDING":
      default:
        return "pending";
    }
  };

  const events = Object.entries(timeline).flatMap(([year, months]: any) =>
    Object.entries(months).flatMap(([month, monthEvents]: any) =>
      monthEvents.map((event: any) => ({
        /* ───────── IDs ───────── */
        id: event.id,
        patientId: event.patient_id,
        chartUuid: chartUuid,

        /* ───────── CORE DISPLAY ───────── */
        title: event.event_title,
        subtitle: event.document_type,
        type: event.event_type?.toLowerCase(),
        provider: event.provider ?? "Unknown",
        date: new Date(event.event_date).toLocaleDateString(),
        year: Number(year),
        month,

        /* ───────── QA STATUS (CRITICAL) ───────── */
        reviewStatus: event.review_status,
        rejectionReason: event.rejection_reason,
        reviewedAt: event.reviewed_at,
        reviewedBy: event.reviewed_by,

        hedisMatch: getEvidenceStatus(event),

        /* ───────── CLINICAL DATA ───────── */
        summary: event.summary,
        notes: event.source_text,
        evidenceText: event.evidence,
        sourceExcerpt: event.source_excerpt,

        /* ───────── AI / ML ───────── */
        aiConfidence: event.ai_confidence,
        aiConfidenceScore: event.ai_confidence_score,

        /* ───────── STRUCTURED DATA ───────── */
        extractedFields: event.extracted_fields,
        structuredData: event.extracted_structured_data,

        /* ───────── CODING ───────── */
        code: event.cpt_code ?? "",
        codeType: "CPT",

        measures: event.measures ?? [],

        /* ───────── DEFAULT FLAGS ───────── */
        hedisRelevant: true,

        ...event,
      })),
    ),
  );

  type FilterKey = EventType | "all" | "hedis";
  const filters: { key: FilterKey; label: string; count?: number }[] = [
    { key: "all", label: "All", count: events.length },
    {
      key: "hedis",
      label: "HEDIS Only",
      count: events.filter((e) => e.hedisRelevant).length,
    },
    {
      key: "encounter",
      label: "Encounters",
      count: events.filter((e) => e.type === "encounter").length,
    },
    {
      key: "lab",
      label: "Labs",
      count: events.filter((e) => e.type === "lab").length,
    },
    {
      key: "medication",
      label: "Meds",
      count: events.filter((e) => e.type === "medication").length,
    },
    {
      key: "document",
      label: "Docs",
      count: events.filter((e) => e.type === "document").length,
    },
  ];

  // const filtered = events.filter((e) => {
  //   if (filter === "hedis" && !e.hedisRelevant) return false;
  //   if (filter !== "all" && filter !== "hedis" && e.type !== filter)
  //     return false;
  //   if (search) {
  //     const q = search.toLowerCase();
  //     return (
  //       e.title.toLowerCase().includes(q) ||
  //       e.code.toLowerCase().includes(q) ||
  //       e.provider.toLowerCase().includes(q) ||
  //       (e.value ?? "").toLowerCase().includes(q)
  //     );
  //   }
  //   return true;
  // });
  const filtered = events;

  /* Group by year → month */
  const grouped: {
    year: number;
    months: { month: string; events: TLEvent[] }[];
  }[] = [];
  filtered.forEach((ev) => {
    let yg = grouped.find((g) => g.year === ev.year);
    if (!yg) {
      yg = { year: ev.year, months: [] };
      grouped.push(yg);
    }
    let mg = yg.months.find((m) => m.month === ev.month);
    if (!mg) {
      mg = { month: ev.month, events: [] };
      yg.months.push(mg);
    }
    mg.events.push(ev);
  });

  const satisfiesCount = events.filter(
    (e) => e.hedisMatch === "satisfies",
  ).length;
  const failsCount = events.filter((e) => e.hedisMatch === "fails").length;

  return (
    <div className="flex flex-col h-full bg-card">
      {/* ── Panel header ── */}
      <div className="flex-shrink-0 px-4 pt-3 pb-3 border-b border-border bg-gradient-to-b from-slate-50/80 to-transparent">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
              <h2 className="text-[12px] font-black text-foreground">
                Evidence Timeline
              </h2>
            </div>
            <p className="text-[9px] text-muted-foreground">
              {events.length} events · {measure?.measure_code} •{" "}
              {measure?.measure_name}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
              <span className="text-[9px] font-black text-emerald-700">
                {satisfiesCount} Pass
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 border border-red-200">
              <TrendingDown className="w-2.5 h-2.5 text-red-500" />
              <span className="text-[9px] font-black text-red-600">
                {failsCount} Fail
              </span>
            </div>
          </div>
        </div>

        {/* AI suggestion callout */}
        <div className="flex items-start gap-2 px-2.5 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 mb-3">
          <Sparkles className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[9px] font-black text-blue-800 mb-0.5">
              AI Evidence Detected
            </p>
            <p className="text-[9px] text-blue-700 leading-snug">
              Nephrology consult Jul 22, 2025 contains{" "}
              <span className="font-bold">BP 136/86</span> — qualifies as CBP
              numerator. Click event below to review.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-2.5">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search encounters, codes, providers…"
            className="w-full pl-7 pr-7 py-1.5 text-[11px] border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full border transition-all whitespace-nowrap ${
                filter === f.key
                  ? f.key === "hedis"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-primary text-white border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary bg-transparent"
              }`}
            >
              {f.label}
              {f.count !== undefined && (
                <span
                  className={`ml-0.5 ${filter === f.key ? "opacity-80" : "opacity-50"}`}
                >
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Timeline body ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileSearch className="w-8 h-8 text-muted-foreground/30 mb-3" />
            <p className="text-[11px] font-semibold text-muted-foreground">
              No events match your filter
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              Try adjusting your search or filter
            </p>
          </div>
        )}

        <div className="space-y-5">
          {grouped.map((yg) => (
            <div key={yg.year}>
              {/* Year header */}
              <div className="flex items-center gap-3 mb-3 sticky top-0 bg-card z-10 py-1">
                <span className="flex items-center gap-1.5 text-[11px] font-black text-foreground bg-slate-100 border border-border px-2.5 py-1 rounded-full">
                  {yg.year}
                  {yg.year === 2025 && (
                    <span className="text-[8px] font-black text-primary bg-primary/10 border border-primary/20 px-1 rounded-full">
                      Active
                    </span>
                  )}
                </span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-[9px] text-muted-foreground">
                  {yg.months.reduce((n, m) => n + m.events.length, 0)} events
                </span>
              </div>

              <div className="space-y-4">
                {yg.months.map((mg) => (
                  <div key={mg.month}>
                    {/* Month label */}
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2 pl-1">
                      {mg.month.replace(` ${yg.year}`, "")}
                    </p>

                    {/* Events with rail */}
                    <div className="relative pl-4">
                      {/* Vertical connector rail */}
                      <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />

                      <div className="space-y-2">
                        {mg.events.map((ev, idx) => {
                          const cfg = EVENT_CFG[ev.type] ?? EVENT_CFG.document;
                          const Icon = cfg.icon;
                          const isExp = expanded === ev.id;
                          const isSat = ev.reviewStatus === "ACCEPTED";
                          const isFail = ev.reviewStatus === "REJECTED";
                          const isPending = ev.reviewStatus === "PENDING";
                          const isAI = isSat && ev.id === "e5";

                          return (
                            <div key={ev.id} className="relative">
                              {/* Rail dot */}
                              <div
                                className={`absolute -left-4 top-3 w-2.5 h-2.5 rounded-full border-2 border-card z-10 ${
                                  isSat
                                    ? "bg-emerald-500"
                                    : isFail
                                      ? "bg-red-400"
                                      : cfg.dot
                                }`}
                              />

                              <div
                                className={`rounded-xl border transition-all cursor-pointer ${
                                  isAI
                                    ? "border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm shadow-emerald-100/60"
                                    : isSat
                                      ? "border-emerald-200 bg-emerald-50/60"
                                      : isFail
                                        ? "border-red-200 bg-red-50/30"
                                        : "border-border bg-card hover:bg-muted/20"
                                }`}
                              >
                                {/* AI badge */}
                                {isAI && (
                                  <div className="flex items-center gap-1 px-3 pt-2 pb-0">
                                    <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                    <span className="text-[8px] font-black text-emerald-700 uppercase tracking-wider">
                                      AI-Detected Evidence
                                    </span>
                                  </div>
                                )}

                                {/* Main row */}
                                <button
                                  onClick={() =>
                                    setExpanded(isExp ? null : ev.id)
                                  }
                                  className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left"
                                >
                                  <div
                                    className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg?.bg} ${cfg?.border} border`}
                                  >
                                    <Icon className={`w-3 h-3 ${cfg.text}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-1">
                                      <p
                                        className={`text-[11px] font-bold truncate ${isSat ? "text-emerald-800" : isFail ? "text-red-700" : "text-foreground"}`}
                                      >
                                        {ev.title}
                                      </p>
                                      {ev.hedisMatch && (
                                        <span
                                          className={`flex-shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded-full border ${
                                            isSat
                                              ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                                              : isFail
                                                ? "bg-red-50 border-red-200 text-red-600"
                                                : "bg-amber-50 border-amber-200 text-amber-600"
                                          }`}
                                        >
                                          {isSat
                                            ? "✓ PASS"
                                            : isFail
                                              ? "✗ FAIL"
                                              : "SUPP"}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[9px] text-muted-foreground">
                                      {ev.subtitle} · {ev.date}
                                    </p>
                                    {ev.value && (
                                      <p
                                        className={`text-[11px] font-bold mt-1 ${isSat ? "text-emerald-700" : isFail ? "text-red-600" : "text-foreground"}`}
                                      >
                                        {ev.value}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      {ev.code && (
                                        <span className="text-[8px] font-mono font-black text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                                          {ev.codeType} {ev.code}
                                        </span>
                                      )}
                                      <span className="text-[9px] text-muted-foreground truncate">
                                        {
                                          (ev.provider ?? "Unknown").split(
                                            ",",
                                          )[0]
                                        }
                                      </span>
                                    </div>
                                  </div>
                                  <ChevronDown
                                    className={`w-3 h-3 text-muted-foreground flex-shrink-0 mt-1.5 transition-transform ${isExp ? "rotate-180" : ""}`}
                                  />
                                </button>

                                {/* Expanded */}
                                {isExp && (
                                  <div
                                    className={`px-3 pb-3 pt-2 border-t space-y-2 ${
                                      isSat
                                        ? "border-emerald-200 bg-emerald-50/40"
                                        : isFail
                                          ? "border-red-100 bg-red-50/20"
                                          : "border-border bg-muted/10"
                                    }`}
                                  >
                                    {ev.notes && (
                                      <div
                                        className={`flex items-start gap-1.5 px-2 py-1.5 rounded-lg ${
                                          isSat
                                            ? "bg-emerald-100/60 text-emerald-800"
                                            : isFail
                                              ? "bg-red-50 text-red-700"
                                              : "bg-muted text-muted-foreground"
                                        }`}
                                      >
                                        <Info className="w-2.5 h-2.5 flex-shrink-0 mt-0.5" />
                                        <p className="text-[9px] leading-snug">
                                          {ev.notes}
                                        </p>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {ev.docPage && (
                                        <button
                                          onClick={() =>
                                            onSelectEvent(
                                              ev.docPage!,
                                              ev.code || ev.title,
                                            )
                                          }
                                          className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                                        >
                                          <FileText className="w-2.5 h-2.5" />
                                          View in Document (Pg {ev.docPage})
                                          <ArrowUpRight className="w-2.5 h-2.5" />
                                        </button>
                                      )}
                                      {isSat && (
                                        <button
                                          onClick={() => onAutoFillEvidence(ev)}
                                          className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200 transition-colors"
                                        >
                                          <Plus className="w-2.5 h-2.5" />
                                          Use as Evidence
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ABSTRACTION FORM
══════════════════════════════════════════════════════════════ */
function AbstractionForm({
  form,
  setForm,
  onSubmitQA,
  onSaveDraft,
  onMarkNotFound,
  prefillData,
  measure,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmitQA: () => void;
  onSaveDraft: () => void;
  onMarkNotFound: () => void;
  prefillData?: Partial<FormData>;
  measure?: any;
}) {
  const [files, setFiles] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Prefill when an evidence event is selected */
  useEffect(() => {
    if (prefillData) setForm((f) => ({ ...f, ...prefillData }));
  }, [prefillData]);

  const set = (k: keyof FormData, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // =======================
  // Measure Library Mapping
  // =======================

  const screeningTypes = measure?.documentation?.highlightRequirements ?? [];

  const evidenceTypes = measure?.documentation?.acceptedEvidenceTypes ?? [];

  const cptCodes =
    measure?.numerator?.codes?.filter(
      (code: any) => code.codeSystem === "CPT",
    ) ?? [];

  const icdCodes = measure?.denominator?.requiredDiagnoses ?? [];
  const numeratorThreshold = measure?.numerator?.complianceThresholds ?? "";
  const requiredServices = measure?.numerator?.requiredServices ?? [];
  const abstractionNotes = measure?.numerator?.abstractionNotes ?? [];
  const commonErrors = measure?.documentation?.commonErrorsToAvoid ?? [];
  const fileRequirements = measure?.documentation?.fileRequirements ?? [];
  const highlightRequirements =
    measure?.documentation?.highlightRequirements ?? [];
  const evidenceSources = measure?.documentation?.fileRequirements ?? [];
  const fields = [
    form.serviceDate,
    form.screeningType,
    form.evidenceType,
    form.numerator,
    form.cptCode,
    form.evidenceSource,
  ];
  const filledCount = fields.filter(Boolean).length;
  const completePct = Math.round((filledCount / fields.length) * 100);
  const requiredFilled = fields.every(Boolean);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setFiles((p) => [
      ...p,
      ...Array.from(e.dataTransfer.files).map((f) => f.name),
    ]);
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles((p) => [
      ...p,
      ...Array.from(e.target.files ?? []).map((f) => f.name),
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleSave = () => {
    setSavedFlash(true);
    onSaveDraft();
    setTimeout(() => setSavedFlash(false), 2200);
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* ── Measure info banner ── */}
      <div className="flex-shrink-0 px-4 pt-3 pb-3 border-b border-border bg-gradient-to-b from-sky-50/70 to-card">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                HEDIS Measure
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {measure?.measure_code}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground">
                {measure?.measurement_year}
              </span>
            </div>
            <h2 className="text-[13px] font-black text-foreground">
              {measure?.measure_name}
            </h2>
            <p className="text-[9px] text-muted-foreground mt-0.5 leading-snug">
              {measure?.description}
              {CHART.measurePeriod}
            </p>
          </div>
          <div className="flex-shrink-0 flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-50 border border-red-300 text-red-700 text-[10px] font-black whitespace-nowrap">
              <AlertCircle className="w-3 h-3" />
              GAP OPEN
            </span>
          </div>
        </div>

        {/* Numerator criteria */}
        <div className="flex items-start gap-2 px-2.5 py-2 rounded-xl bg-blue-50 border border-blue-200">
          <Sparkles className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[9px] font-black text-blue-800 mb-0.5">
              AI Suggestion
            </p>
            <p className="text-[9px] text-blue-700 leading-snug">
              Nephrology consult (Jul 22) contains{" "}
              <span className="font-bold">BP 136/86</span> — satisfies CBP
              numerator. Click "Use as Evidence" in the timeline to auto-fill
              this form.
            </p>
          </div>
        </div>
      </div>

      {/* ── Scrollable form body ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* ─── SECTION 1: Service Information ─── */}
        <section>
          <SectionHeader icon={Calendar} label="Service Information" />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Service Date" required>
              <input
                type="date"
                value={form.serviceDate}
                onChange={(e) => set("serviceDate", e.target.value)}
                className="form-input"
              />
            </FormField>
            <FormField label="Screening Type" required>
              <select
                value={form.screeningType}
                onChange={(e) => set("screeningType", e.target.value)}
                className="form-input"
              >
                <option value="">Select Screening Type</option>

                {screeningTypes.map((item: string) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="col-span-2">
              <FormField label="Evidence Type" required>
                <select
                  value={form.evidenceType}
                  onChange={(e) => set("evidenceType", e.target.value)}
                  className="form-input"
                >
                  <option value="">Select Evidence Type</option>

                  {evidenceTypes.map((item: any) => (
                    <option key={item.type} value={item.type}>
                      {item.type}
                    </option>
                  ))}
                </select>
                {form.evidenceType && (
                  <div className="mt-2 p-3 rounded bg-slate-50 border">
                    {evidenceTypes

                      .filter((e: any) => e.type === form.evidenceType)

                      .map((e: any) => (
                        <div key={e.type}>
                          <p>
                            <b>Priority:</b>

                            {e.priority}
                          </p>

                          <p>
                            <b>Notes:</b>

                            {e.notes}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </FormField>
            </div>
          </div>
        </section>

        {/* ─── SECTION 2: BP Reading ─── */}
        {/* <section> */}
        {/* <div className="flex items-center justify-between mb-2">
            <SectionHeader
              icon={Heart}
              label="Numerator Evidence — BP Reading"
              required
            />
          </div> */}

        {/* <div className="grid grid-cols-2 gap-3 mb-2">
            <FormField label="Systolic (mmHg)" required>
              <input
                type="number"
                value={form.systolic}
                onChange={(e) => set("systolic", e.target.value)}
                placeholder="e.g. 136"
                min={60}
                max={260}
                className={`form-input ${bpEntered ? (bpSatisfies ? "border-emerald-400 ring-emerald-200" : "border-red-300 ring-red-200") : ""}`}
              />
            </FormField>
            <FormField label="Diastolic (mmHg)" required>
              <input
                type="number"
                value={form.diastolic}
                onChange={(e) => set("diastolic", e.target.value)}
                placeholder="e.g. 86"
                min={40}
                max={160}
                className={`form-input ${bpEntered ? (bpSatisfies ? "border-emerald-400 ring-emerald-200" : "border-red-300 ring-red-200") : ""}`}
              />
            </FormField>
          </div> */}

        {/* Live BP validation banner */}
        {/* {bpEntered ? (
            <div
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[11px] font-bold ${
                bpSatisfies
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "bg-red-50 border-red-300 text-red-700"
              }`}
            >
              {bpSatisfies ? (
                <>
                  <BadgeCheck className="w-4 h-4 flex-shrink-0" />
                  {sys}/{dia} mmHg —{" "}
                  <span className="font-black">Satisfies CBP numerator</span>{" "}
                  (&lt;140/90 ✓)
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  {sys}/{dia} mmHg —{" "}
                  <span className="font-black">Does NOT satisfy CBP</span>{" "}
                  (threshold: &lt;140/90)
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border text-[10px] text-muted-foreground">
              <Info className="w-3 h-3 flex-shrink-0" />
              Enter BP values above to check CBP numerator compliance in
              real-time
            </div>
          )} */}
        {/* </section> */}
        <section>
          <SectionHeader icon={Heart} label="Numerator Evidence" />

          <FormField label="Compliance Threshold" required>
            <input
              className="form-input"
              value={form.numerator}
              onChange={(e) => set("numerator", e.target.value)}
              placeholder={numeratorThreshold}
            />
          </FormField>

          <p className="text-xs text-muted-foreground mt-2">
            Expected:
            <strong>{numeratorThreshold}</strong>
          </p>
        </section>

        {/* ─── SECTION 3: Code Documentation ─── */}
        <section>
          <SectionHeader icon={ClipboardList} label="Code Documentation" />
          <div className="space-y-3">
            <FormField label="CPT Code Used" required>
              <select
                value={form.cptCode}
                onChange={(e) => set("cptCode", e.target.value)}
                className="form-input"
              >
                <option value="">Select CPT</option>

                {cptCodes.map((code: any) => (
                  <option key={code.code} value={code.code}>
                    {code.code}-{code.description}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="ICD-10 Diagnosis Code">
              <select
                value={form.icdCode}
                onChange={(e) => set("icdCode", e.target.value)}
                className="form-input"
              >
                <option value="">Select ICD-10</option>

                {icdCodes.map((code: any) => (
                  <option key={code.code} value={code.code}>
                    {code.code}-{code.description}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Evidence Source" required>
              <select
                value={form.evidenceSource}
                onChange={(e) => set("evidenceSource", e.target.value)}
                className="form-input"
              >
                <option value="">Select Source</option>

                {evidenceSources.map((source: string) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </section>

        {/* ─── SECTION 4: Upload Documentation ─── */}
        <section>
          <SectionHeader icon={Upload} label="Supporting Documentation" />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl px-4 py-5 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border hover:border-primary/50 hover:bg-muted/20"
            }`}
          >
            <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-[11px] font-semibold text-foreground">
              Drop files or click to upload
            </p>
            <p className="text-[9px] text-muted-foreground mt-0.5">
              Accepted Files
              {fileRequirements.join(" • ")}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />

          {files.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/30 border border-border"
                >
                  <Paperclip className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="flex-1 text-[10px] text-foreground truncate">
                    {f}
                  </span>
                  <span className="text-[8px] text-muted-foreground">
                    Ready
                  </span>
                  <button
                    onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                    className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── SECTION 5: Abstractor Notes ─── */}
        <section>
          <SectionHeader icon={ClipboardList} label="Abstractor Notes" />
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            placeholder="Add abstraction rationale, data discrepancies, or clinical context for QA reviewer…"
            className="form-input resize-none w-full"
          />
        </section>

        <p className="text-[9px] text-muted-foreground pb-1">
          <span className="text-red-500">*</span> Required fields · All entries
          are timestamped and auditable
        </p>
      </div>

      {/* ── Sticky footer — submission ── */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-border bg-card space-y-2.5">
        {/* Completion bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] text-muted-foreground font-semibold">
              Form completion
            </span>
            <span
              className={`text-[9px] font-black ${requiredFilled ? "text-emerald-600" : completePct > 50 ? "text-amber-600" : "text-muted-foreground"}`}
            >
              {completePct}% ·{" "}
              {requiredFilled
                ? "Ready to submit"
                : `${fields.length - filledCount} field${fields.length - filledCount !== 1 ? "s" : ""} remaining`}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${requiredFilled ? "bg-emerald-500" : completePct > 50 ? "bg-amber-400" : "bg-slate-300"}`}
              style={{ width: `${completePct}%` }}
            />
          </div>
        </div>

        {/* Secondary buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold border border-border rounded-xl text-foreground hover:bg-muted transition-colors whitespace-nowrap"
          >
            {savedFlash ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Draft
              </>
            )}
          </button>
          <button
            onClick={onMarkNotFound}
            className="inline-flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold border border-amber-300 rounded-xl text-amber-700 hover:bg-amber-50 transition-colors whitespace-nowrap"
          >
            <Flag className="w-3.5 h-3.5" />
            Mark Not Found
          </button>
        </div>

        {/* Primary submit */}
        <button
          onClick={onSubmitQA}
          disabled={!requiredFilled}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-[12px] font-black rounded-xl text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm whitespace-nowrap"
          style={{
            background: requiredFilled
              ? "linear-gradient(135deg, #0891b2, #0e7490)"
              : undefined,
            backgroundColor: !requiredFilled ? "#94a3b8" : undefined,
          }}
        >
          <Send className="w-3.5 h-3.5" />
          Submit for QA Review
          <span className="text-[9px] opacity-75 font-semibold ml-1">
            · HEDIS Engine Re-run
          </span>
        </button>
      </div>
    </div>
  );
}

/* ── Shared sub-components ── */
function SectionHeader({
  icon: Icon,
  label,
  required,
}: {
  icon: React.ElementType;
  label: string;
  required?: boolean;
}) {
  return (
    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
      <Icon className="w-3 h-3" />
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </h3>
  );
}
function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-muted-foreground block mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SUBMIT MODAL — with HEDIS Engine animation
══════════════════════════════════════════════════════════════ */
type SubmitMode = "qa" | "notfound" | null;

const ENGINE_STEPS = [
  { label: "Validating service dates", dur: 400 },
  { label: "Mapping CPT/ICD-10 codes", dur: 700 },
  { label: "Applying CBP numerator logic", dur: 900 },
  { label: "Cross-referencing denominator data", dur: 1200 },
  { label: "Calculating measure compliance", dur: 1600 },
  { label: "Generating QA submission packet", dur: 1900 },
];

function SubmitModal({
  mode,
  onSubmitQA,
  onMarkNotFound,
  patientName,
  chartUuid,
  submittedBy,
}: {
  mode: SubmitMode;
  onSubmitQA: () => Promise<void>;
  onMarkNotFound: () => Promise<void>;
  patientName: string;
  chartUuid: string;
  submittedBy: string;
}) {
  const [phase, setPhase] = useState<"confirm" | "running" | "done">("confirm");
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setPhase("confirm");
    setStep(0);
    setProgress(0);
  }, [mode]);

  if (!mode) return null;

  const isQA = mode === "qa";
  const cfg = isQA
    ? {
        title: "Submit for QA Review",
        desc: "This chart will be sent to the QA reviewer queue and HEDIS Engine will re-run to verify measure compliance.",
        accent: "#0891b2",
      }
    : {
        title: "Mark as Not Found",
        desc: 'The chart will be flagged as "Evidence Not Found". A QA reviewer will be notified to manually verify.',
        accent: "#d97706",
      };

  const handleConfirm = async () => {
    if (isQA) {
      await onSubmitQA();
    } else {
      await onMarkNotFound();
    }

    setPhase("running");

    ENGINE_STEPS.forEach((s, i) => {
      setTimeout(() => {
        setStep(i + 1);
        setProgress(Math.round(((i + 1) / ENGINE_STEPS.length) * 100));
      }, s.dur);
    });

    setTimeout(() => {
      setPhase("done");
    }, 2200);

    setTimeout(() => {
      onClose();
    }, 3800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* CONFIRM */}
        {phase === "confirm" && (
          <>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${cfg.accent}18` }}
              >
                {isQA ? (
                  <Send className="w-4 h-4" style={{ color: cfg.accent }} />
                ) : (
                  <Flag className="w-4 h-4" style={{ color: cfg.accent }} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black text-foreground">
                  {cfg.title}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {chartUuid} · {patientName}
                </p>
              </div>
              <button
                // onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="px-5 py-5">
              <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
                {cfg.desc}
              </p>

              {isQA && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 mb-5">
                  <RefreshCw className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-blue-800 mb-0.5">
                      HEDIS Engine v2026.1
                    </p>
                    <p className="text-[10px] text-blue-700">
                      Will re-calculate CBP measure compliance and update the
                      gap status. This may take a few seconds.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl bg-muted/40 border border-border">
                <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground">
                  Submitting as{" "}
                  <span className="font-bold text-foreground">
                    {submittedBy}
                  </span>
                </span>
                <span className="ml-auto text-[9px] font-mono text-muted-foreground">
                  {new Date().toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 text-[11px] font-semibold border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 text-[11px] font-black rounded-xl text-white transition-all shadow-sm hover:opacity-90"
                  style={{ backgroundColor: cfg.accent }}
                >
                  Confirm & {isQA ? "Submit" : "Flag"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* RUNNING — HEDIS Engine animation */}
        {phase === "running" && (
          <div className="px-6 py-8">
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                <RefreshCw className="w-7 h-7 text-primary animate-spin" />
              </div>
              <p className="text-sm font-black text-foreground">
                HEDIS Engine Running…
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Re-calculating CBP measure compliance
              </p>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between mb-1.5">
                <span className="text-[10px] text-muted-foreground font-semibold">
                  Progress
                </span>
                <span className="text-[10px] font-black text-primary">
                  {progress}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Step list */}
            <div className="space-y-1.5">
              {ENGINE_STEPS.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-[10px] transition-all ${
                    i < step
                      ? "text-emerald-600"
                      : i === step - 1
                        ? "text-primary font-semibold"
                        : "text-muted-foreground/40"
                  }`}
                >
                  {i < step ? (
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-emerald-500" />
                  ) : i === step - 1 ? (
                    <RefreshCw className="w-3 h-3 flex-shrink-0 text-primary animate-spin" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-current flex-shrink-0" />
                  )}
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DONE */}
        {phase === "done" && (
          <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-black text-foreground mb-1">
                {isQA ? "Submitted for QA Review" : "Marked as Not Found"}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {isQA
                  ? "Chart moved to QA queue. HEDIS Engine re-run complete — CBP compliance updated."
                  : "Chart flagged. QA reviewer has been notified for manual verification."}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700 font-semibold w-full justify-center">
              <BadgeCheck className="w-3.5 h-3.5" />
              Chart ID {chartUuid} · Audit trail recorded
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN WORKSPACE
══════════════════════════════════════════════════════════════ */
export function AbstractionWorkspace({
  onBack,
  patientId,
  chartUuid,
  patientData,
}: {
  onBack?: () => void;
  patientId?: string;
  chartUuid?: string;
  patientData?: any;
}) {
  const [viewerPage, setViewerPage] = useState(1);
  const [flashCode, setFlashCode] = useState<string | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const [submitMode, setSubmitMode] = useState<SubmitMode>(null);
  const [savedStatus, setSavedStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [mobileTab, setMobileTab] = useState<"doc" | "timeline" | "form">(
    "timeline",
  );
  const [viewerFull, setViewerFull] = useState(false);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [prefill, setPrefill] = useState<Partial<FormData> | undefined>(
    undefined,
  );
  const [selectedMeasureCode, setSelectedMeasureCode] = useState<string>("");
  const [timelineFilter, setTimelineFilter] = useState("all");
  const [timelineSearch, setTimelineSearch] = useState("");

  const slaAtRisk = CHART.slaHrsLeft <= 12;
  const now = new Date();
  const timeStr = now.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const { data: patientsResponse } = useGetApiPatients();
  const { data: profile } = useGetApiProfileMe();

  const patients = Array.isArray(patientsResponse)
    ? patientsResponse
    : (patientsResponse?.patients ?? patientsResponse?.data ?? []);

  const patient = patients.find(
    (p: any) => p.patientId === patientId || p.id === patientId,
  );
  console.log("Selected Patient:", patient);
  const selectedPatient = patient
    ? {
        first_name: patient.first_name,
        last_name: patient.last_name,
        patientName: `${patient.first_name} ${patient.last_name}`,
        chart_id: patient.chart_id,
        mrn: patient.patient_id,
        dob: patient.dob,
        gender: patient.gender,
        plan: patient.plan,
        age: patient.dob
          ? new Date().getFullYear() - new Date(patient.dob).getFullYear()
          : "",
      }
    : null;
  const formatDOB = (dob?: string) => {
    if (!dob) return "—";

    return new Date(dob).toLocaleDateString("en-GB");
  };
  const currentChartUuid = patientData?.chart_uuid ?? chartUuid ?? "";

  const handleSelectEvent = (docPage: number, code: string) => {
    setViewerPage(docPage);
    setFlashCode(code);
    setFlashActive(true);
    if (mobileTab !== "doc") setMobileTab("doc");
    setTimeout(() => setFlashActive(false), 2800);
  };

  const handleAutoFill = (ev: TLEvent) => {
    const dateMatch = ev.isoDate;
    const bpMatch = ev.value?.match(/(\d+)\/(\d+)/);
    setPrefill({
      serviceDate: dateMatch,
      systolic: bpMatch?.[1] ?? "",
      diastolic: bpMatch?.[2] ?? "",
      cptCode: CPT_OPTIONS.find((c) => c.startsWith(ev.code)) ?? "",
      evidenceSource: "Specialist Consultation Note",
      evidenceType: "Specialist Consult BP Reading",
    });
  };

  const handleSaveDraft = async () => {
    try {
      setSavedStatus("saving");

      await saveDraftMutation.mutateAsync({
        data: {
          patientId,

          chartUuid: currentChartUuid,

          measurecode: selectedMeasure?.measure_code,

          serviceDate: formData.serviceDate,

          screeningType: formData.screeningType,

          evidenceType: formData.evidenceType,

          reading: formData.numerator,

          cptCode: formData.cptCode,

          icd10Code: formData.icdCode,

          evidenceSource: formData.evidenceSource,

          notes: formData.notes,
        },
      });

      await refetchDraft();

      setSavedStatus("saved");

      toast.success("Draft Saved Successfully");

      setTimeout(() => {
        setSavedStatus("idle");
      }, 2000);
    } catch (error) {
      setSavedStatus("idle");

      toast.error("Unable to Save Draft");
    }
  };
  const markNotFoundMutation = usePostApiHedisAbstractorMarkNotFound();
  const saveDraftMutation = usePostApiHedisAbstractorSaveDraft();

  const { data } = useGetApiHedisAbstractorMeasuresPatientid(patientId);

  const measureList = data?.measures ?? [];

  useEffect(() => {
    if (measureList.length > 0 && !selectedMeasureCode) {
      setSelectedMeasureCode(measureList[0].measure_code);
    }
  }, [measureList, selectedMeasureCode]);

  const selectedMeasure = measureList.find(
    (m: any) => m.measure_code === selectedMeasureCode,
  );

  const { data: draftData, refetch: refetchDraft } =
    useGetApiHedisAbstractorDraftPatientid(
      patientId,
      {
        chartUuid: currentChartUuid,
        measureCode: selectedMeasure?.measure_code,
      },
      {
        query: {
          enabled:
            !!patientId &&
            !!currentChartUuid &&
            !!selectedMeasure?.measure_code,
        },
      },
    );

  useEffect(() => {
    const draft = draftData?.draft;

    if (!draft) {
      setFormData(EMPTY_FORM);
      return;
    }

    setFormData({
      ...EMPTY_FORM,

      serviceDate: draft.service_date ?? "",
      screeningType: draft.screening_type ?? "",
      evidenceType: draft.evidence_type ?? "",
      numerator: draft.reading ?? "",
      cptCode: draft.cpt_code ?? "",
      icdCode: draft.icd10_code ?? "",
      evidenceSource: "",
      notes: draft.notes ?? "",
    });
  }, [draftData]);

  const { data: timelineData, isLoading: timelineLoading } =
    useGetApiHedisEvidenceTimelineId(patientId, {
      filter: timelineFilter,
      search: timelineSearch,
    });

  const { data: measureLibrary } = useGetApiMeasureLibraryId(
    selectedMeasure?.measure_code,
    {
      query: {
        enabled: !!selectedMeasure?.measure_code,
      },
    },
  );
  const sendToQaMutation = usePostApiHedisSendToQa();
  const handleMarkNotFound = async () => {
    try {
      await markNotFoundMutation.mutateAsync({
        data: {
          patientId: patientId!,
          chartUuid: currentChartUuid,
          measureId: selectedMeasure,
          comment: formData.notes || "Evidence not found by Abstractor.",
        },
      });

      toast.success("Evidence marked as Not Found.");

      setSubmitMode("notfound");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Unable to mark evidence as Not Found.",
      );
    }
  };
  const handleSubmitQA = async () => {
    try {
      await sendToQaMutation.mutateAsync({
        data: {
          patientId,
          patientName: selectedPatient?.patientName,
          chartUuid: currentChartUuid,
          measureCode: selectedMeasure?.measure_code,
          measureName: selectedMeasure?.measure_name,
          qaAssigneeId: selectedMeasure?.qa_assignee_id,
          notes: formData.notes,
        },
      });

      toast.success(
        "Patient successfully submitted to QA. Evidence has been saved and is ready for QA review.",
      );

      setSubmitMode("qa");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Unable to submit patient to QA. Please try again.",
      );
    }
  };

  return (
    <div
      className="flex flex-col bg-[#f4f6f9]"
      style={{ height: "calc(100vh - 104px)" }}
    >
      {/* ══════════════ WORKSPACE HEADER ══════════════ */}
      <div className="flex-shrink-0 bg-card border-b border-border shadow-sm">
        {/* Row 1: Patient identity bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/60">
          <button
            onClick={onBack}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-[11px] font-semibold whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Queue
          </button>
          <div className="w-px h-5 bg-border flex-shrink-0" />

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-primary/15 border-2 border-primary/25 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-black text-primary">
              {" "}
              {(patientData?.patientName || CHART.patientName)
                ?.split(",")[0]
                ?.trim()
                .substring(0, 2)
                .toUpperCase() || "JD"}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <span className="text-[13px] font-black text-foreground whitespace-nowrap">
              {selectedPatient?.patientName ?? CHART.patientName}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border whitespace-nowrap">
              {selectedPatient?.mrn ?? CHART.mrn}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground whitespace-nowrap">
              <Calendar className="w-2.5 h-2.5" />
              DOB {formatDOB(selectedPatient?.dob) ?? CHART.dob}
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {selectedPatient?.age ?? CHART.age}y ·{" "}
              {patient?.gender ?? CHART.gender}
            </span>
            <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border whitespace-nowrap">
              {selectedPatient?.plan ?? CHART.plan}
            </span>
          </div>

          <div className="flex-1" />

          {/* Assignee + SLA */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-muted-foreground whitespace-nowrap">
              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-[8px] font-black text-slate-600">
                  {CHART.assignedAvatar}
                </span>
              </div>
              {CHART.assignedTo}
            </div>
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[9px] font-black whitespace-nowrap ${
                slaAtRisk
                  ? "bg-amber-50 border-amber-300 text-amber-700"
                  : "bg-emerald-50 border-emerald-300 text-emerald-700"
              }`}
            >
              <Clock className="w-2.5 h-2.5" />
              SLA {CHART.slaHrsLeft}h left
              {slaAtRisk && <AlertTriangle className="w-2.5 h-2.5 ml-0.5" />}
            </div>
          </div>
        </div>

        {/* Row 2: Measure + actions */}
        {/* <div className="flex items-center gap-3 px-4 py-2"> */}
        {/* Measure badge */}
        {/* <div className="flex items-center gap-2 min-w-0">
            <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
              {CHART.measureCode}
            </span>
            <span className="text-[11px] font-bold text-foreground whitespace-nowrap hidden md:block">
              {CHART.measure}
            </span>
            <span className="text-[9px] text-muted-foreground hidden lg:block">
              · {CHART.measurePeriod}
            </span> */}

        {/* </div> */}

        <div className="flex items-center gap-2 min-w-0">
          {/* Measure Code Badge */}
          <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
            {selectedMeasure ? selectedMeasure.measure_code : "-"}
          </span>

          {/* Measure Dropdown */}
          <select
            value={selectedMeasureCode}
            onChange={(e) => setSelectedMeasureCode(e.target.value)}
            disabled={measureList.length === 0}
            className="h-8 rounded border px-2 text-sm"
          >
            {measureList.length === 0 ? (
              <option>No Measures Assigned</option>
            ) : (
              measureList.map((measure: any) => (
                <option key={measure.measure_code} value={measure.measure_code}>
                  {measure.measure_name}
                </option>
              ))
            )}
          </select>

          {/* Measurement Year */}
          <span className="text-[9px] text-muted-foreground hidden lg:block">
            · {selectedMeasure?.measurementYear ?? ""}
          </span>

          {/* Gap open badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 border border-red-300 text-red-700 text-[9px] font-black whitespace-nowrap flex-shrink-0">
            <AlertCircle className="w-2.5 h-2.5" />
            GAP OPEN
          </span>

          <div className="flex-1" />

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold border border-border rounded-xl text-foreground hover:bg-muted transition-colors whitespace-nowrap"
            >
              {savedStatus === "saved" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Saved
                </>
              ) : savedStatus === "saving" ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Draft
                </>
              )}
            </button>
            <button
              onClick={() => setSubmitMode("notfound")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold border border-amber-300 rounded-xl text-amber-700 hover:bg-amber-50 transition-colors whitespace-nowrap"
            >
              <Flag className="w-3.5 h-3.5" />
              Mark Not Found
            </button>
            <button
              onClick={() => setSubmitMode("qa")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black rounded-xl text-white bg-[#0891b2] hover:bg-[#0e7490] transition-all shadow-sm whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              Submit for QA
            </button>
          </div>
        </div>
      </div>

      {/* ══ MOBILE TAB BAR ══ */}
      <div className="flex-shrink-0 flex border-b border-border bg-card lg:hidden">
        {(["doc", "timeline", "form"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-2.5 text-[11px] font-bold border-b-2 -mb-px transition-colors ${
              mobileTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "doc"
              ? "📄 Document"
              : tab === "timeline"
                ? "📋 Timeline"
                : "📝 Form"}
          </button>
        ))}
      </div>

      {/* ══ THREE-PANEL BODY ══ */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── LEFT: Document Viewer (27%) ── */}
        <div
          className={`flex-col overflow-hidden border-r border-border lg:flex lg:w-[27%] lg:flex-shrink-0 ${
            mobileTab === "doc" ? "flex flex-1" : "hidden"
          } ${viewerFull ? "fixed inset-0 z-40 w-full" : ""}`}
        >
          <DocumentViewer
            pdfUrl={data?.pdfUrl ?? null}
            requestPage={viewerPage}
            flashActive={flashActive}
            flashCode={flashCode}
            fullscreen={viewerFull}
            onToggleFullscreen={() => setViewerFull((v) => !v)}
          />
        </div>

        {/* ── CENTER: Evidence Timeline (33%) ── */}
        <div
          className={`flex-col overflow-hidden border-r border-border lg:flex lg:w-[33%] lg:flex-shrink-0 ${
            mobileTab === "timeline" ? "flex flex-1" : "hidden"
          }`}
        >
          <EvidenceTimeline
            measure={selectedMeasure}
            timeline={timelineData?.timeline ?? {}}
            loading={timelineLoading}
            filter={timelineFilter}
            search={timelineSearch}
            onFilterChange={setTimelineFilter}
            onSearchChange={setTimelineSearch}
            onSelectEvent={handleSelectEvent}
            onAutoFillEvidence={handleAutoFill}
          />
        </div>

        {/* ── RIGHT: Abstraction Form (40%) ── */}
        <div
          className={`flex-col overflow-hidden lg:flex lg:flex-1 ${
            mobileTab === "form" ? "flex flex-1" : "hidden"
          }`}
        >
          <AbstractionForm
            form={formData}
            setForm={setFormData}
            onSubmitQA={handleSubmitQA}
            onSaveDraft={handleSaveDraft}
            onMarkNotFound={handleMarkNotFound}
            prefillData={prefill}
            measure={measureLibrary}
          />
        </div>
      </div>

      {/* ══ WORKSPACE FOOTER ══ */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-1.5 bg-card border-t border-border">
        <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-[7px] font-black text-slate-600">
                {CHART.assignedAvatar}
              </span>
            </div>
            <span>
              Abstractor:{" "}
              <span className="font-semibold text-foreground">
                {CHART.assignedTo}
              </span>
            </span>
          </div>
          <div className="w-px h-3 bg-border" />
          <span className="font-mono">{timeStr}</span>
          <div className="w-px h-3 bg-border" />
          <span>
            Chart:{" "}
            <span className="font-mono font-semibold">{CHART.chartId}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auto-save active</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <span>HEDIS MY2026 · CBP · {CHART.mrn}</span>
        </div>
      </div>

      {/* ══ SUBMIT MODAL ══ */}
      <SubmitModal
        mode={submitMode}
        onSubmitQA={handleSubmitQA}
        onMarkNotFound={handleMarkNotFound}
        patientName={selectedPatient?.patientName ?? ""}
        chartUuid={currentChartUuid}
        submittedBy={profile?.data?.full_name ?? ""}
      />
    </div>
  );
}

/* Inject shared form-input class */
const style = document.createElement("style");
style.textContent = `.form-input{width:100%;font-size:11px;border:1px solid var(--border);border-radius:8px;padding:8px 12px;background:var(--background);color:var(--foreground);outline:none;transition:border-color .15s,box-shadow .15s}.form-input:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 15%,transparent)}.form-input::placeholder{color:color-mix(in srgb,var(--muted-foreground) 60%,transparent)}`;
if (!document.head.querySelector("[data-workspace-styles]")) {
  style.setAttribute("data-workspace-styles", "");
  document.head.appendChild(style);
}
