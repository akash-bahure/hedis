import { useState, useMemo, useEffect } from "react";
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
import { Pagination } from "./Pagination";
import { useGetApiMeasureLibrary, useGetApiMeasureLibraryId } from "@/api";
/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type ProductLine = "Commercial" | "Medicaid" | "Medicare";
type MeasureType = "Hybrid" | "Administrative" | "Digital";
type MeasureStatus = "Active" | "Retired" | "Updated";

interface MeasureSummary {
  id: number;
  measureCode: string;
  measureName: string;
  description: string;
  category: string;
  measureType: MeasureType;
  productLines: ProductLine[];
  active: boolean;
  measurementYear: string;
}

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
   STYLE MAPS
───────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────
   CATEGORY STYLES (Extended for new categories)
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
  Utilization: {
    border: "border-l-orange-500",
    icon: Activity,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    bg: "bg-orange-50/40",
  },
  "Appropriate Treatment": {
    border: "border-l-teal-500",
    icon: Target,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    bg: "bg-teal-50/40",
  },
  "Geriatric Care": {
    border: "border-l-purple-500",
    icon: Users,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    bg: "bg-purple-50/40",
  },
  "Patient Experience": {
    border: "border-l-pink-500",
    icon: Star,
    iconBg: "bg-pink-50",
    iconColor: "text-pink-600",
    bg: "bg-pink-50/40",
  },
  Respiratory: {
    border: "border-l-sky-500",
    icon: Activity,
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    bg: "bg-sky-50/40",
  },
  Immunizations: {
    border: "border-l-emerald-500",
    icon: Baby,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    bg: "bg-emerald-50/40",
  },
  "Pediatric Care": {
    border: "border-l-emerald-500",
    icon: Baby,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    bg: "bg-emerald-50/40",
  },
  "Behavioral Health": {
    border: "border-l-amber-500",
    icon: Brain,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    bg: "bg-amber-50/40",
  },
  // Add more as needed
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

function TabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-muted/40 rounded-xl" />
      ))}
    </div>
  );
}

/* ── TAB CONTENT ── */
function TabEligibility({
  m,
  detail,
  loading,
}: {
  m: MeasureSummary;
  detail: any;
  loading: boolean;
}) {
  if (loading) return <TabSkeleton />;

  const elig = detail?.eligibility;
  const age = elig?.ageCriteria;
  const enroll = elig?.continuousEnrollment;

  return (
    <div className="space-y-4">
      <SectionDivider label="Age Criteria" />
      <div className="grid grid-cols-2 gap-3">
        <RuleCard
          icon={Users}
          title="Age Range"
          value={`${age?.minAge ?? "?"}–${age?.maxAge ?? "?"} years`}
          sub={age?.ageCalculationDate ?? ""}
          accent="border-l-4 border-l-primary"
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <RuleCard
          icon={Calendar}
          title="Age Calculation Date"
          value={
            age?.ageCalculationDate ?? "December 31 of the Measurement Year"
          }
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
          value={enroll?.enrollmentRule ?? "—"}
          accent="border-l-4 border-l-emerald-500"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <RuleCard
          icon={AlertCircle}
          title="Maximum Gap Allowed"
          value={enroll?.maximumGapAllowed ?? "—"}
          sub="Gaps exceeding this threshold disqualify the member."
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      <SectionDivider label="Gender Rules" />
      <RuleCard
        icon={Users}
        title="Gender Restriction"
        value={
          elig?.genderRules?.length
            ? elig.genderRules.join(", ")
            : "No restriction"
        }
        iconBg="bg-violet-50"
        iconColor="text-violet-600"
      />
    </div>
  );
}

function TabDenominator({
  detail,
  loading,
}: {
  detail: any;
  loading: boolean;
}) {
  if (loading) return <TabSkeleton />;

  const denom = detail?.denominator;
  const diagnoses = (denom?.requiredDiagnoses ?? []).map((d: any) => ({
    code: d.code,
    system: d.codeSystem,
    description: d.description,
    required: true,
  }));

  // Product line notes from productLineRules object
  const productLineNotes = Object.entries(denom?.productLineRules ?? {})
    .filter(([, v]) => v)
    .map(([key]) => ({
      line: (key.charAt(0).toUpperCase() + key.slice(1)) as ProductLine,
      note: `${key.charAt(0).toUpperCase() + key.slice(1)} product line applies standard enrollment rules.`,
    }));

  return (
    <div className="space-y-4">
      <SectionDivider label="Eligible Population" />
      <div className="border border-border rounded-xl p-4 bg-card">
        <p className="text-[12px] font-semibold text-foreground">
          {denom?.eligiblePopulation ?? "—"}
        </p>
      </div>

      <SectionDivider label="Required Diagnoses" />
      {diagnoses.length > 0 ? (
        <CodeTable codes={diagnoses} />
      ) : (
        <p className="text-[11px] text-muted-foreground">
          No required diagnoses specified.
        </p>
      )}

      <SectionDivider label="Product Line Rules" />
      <div className="grid grid-cols-3 gap-3">
        {productLineNotes.map((pln) => (
          <div
            key={pln.line}
            className="border border-border rounded-xl p-3 bg-card"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border 
                ${
                  pln.line === "Commercial"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : pln.line === "Medicaid"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-violet-50 text-violet-700 border-violet-200"
                }`}
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

function TabNumerator({ detail, loading }: { detail: any; loading: boolean }) {
  if (loading) return <TabSkeleton />;

  const num = detail?.numerator;
  const codes = (num?.codes ?? []).map((c: any) => ({
    code: c.code,
    system: c.codeSystem,
    description: c.description,
    lookback: num?.serviceDateValidity?.lookbackPeriod ?? "MY",
    required: true,
  }));

  const services = (num?.requiredServices ?? []).map((s: string) => ({
    name: s,
    description: "",
    required: true,
  }));

  return (
    <div className="space-y-4">
      <SectionDivider label="Numerator Definition" />
      <div className="border-l-4 border-l-emerald-500 bg-emerald-50/40 border border-emerald-200 rounded-r-xl p-4">
        <p className="text-[12px] font-semibold text-foreground">
          {num?.numeratorDefinition ?? "—"}
        </p>
      </div>

      {num?.complianceThresholds && (
        <>
          <SectionDivider label="Compliance Thresholds" />
          <div className="border border-border rounded-lg px-4 py-3 bg-card">
            {typeof num.complianceThresholds === "string" ? (
              <p className="text-[12px] text-foreground">
                {num.complianceThresholds}
              </p>
            ) : (
              <div className="space-y-2">
                {Object.entries(num.complianceThresholds).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between text-[12px]"
                    >
                      <span className="font-medium capitalize text-muted-foreground">
                        {key}
                      </span>
                      <span className="font-semibold text-foreground">
                        {String(value)}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </>
      )}

      <SectionDivider label="Required Services" />
      <div className="grid grid-cols-2 gap-3">
        {services.map((s, i) => (
          <div
            key={i}
            className="border rounded-xl p-3.5 flex items-start gap-2.5 border-l-4 border-l-emerald-500 border-emerald-200 bg-emerald-50/30"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
            <div>
              <p className="text-[12px] font-bold text-foreground">{s.name}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionDivider label="CPT / LOINC Codes" />
      <CodeTable codes={codes} showLookback={true} />

      <SectionDivider label="Lookback Period" />
      <RuleCard
        icon={Clock}
        title="Lookback Period"
        value={num?.serviceDateValidity?.lookbackPeriod ?? "—"}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
        accent="border-l-4 border-l-amber-500"
      />

      {num?.abstractionNotes?.length > 0 && (
        <>
          <SectionDivider label="Abstraction Notes" />
          <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-4 space-y-2">
            {num.abstractionNotes.map((n: any, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-foreground">
                    {n.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{n.note}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TabExclusions({ detail, loading }: { detail: any; loading: boolean }) {
  if (loading) return <TabSkeleton />;

  const exclusions = detail?.exclusions ?? [];

  return (
    <div className="space-y-4">
      {exclusions.map((exc: any, idx: number) => (
        <div
          key={idx}
          className="border border-red-200 rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-red-50/60 border-b border-red-200">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-[12px] font-bold text-red-800">
                {exc.reason}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3 bg-card">
            <p className="text-[12px] text-foreground">{exc.description}</p>
            <CodeTable
              codes={[
                {
                  code: exc.code,
                  system: exc.codeSystem,
                  description: exc.description,
                },
              ]}
            />
          </div>
        </div>
      ))}

      <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-4 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-foreground">
          Exclusions must be verified through claims, chart abstraction, or
          supplemental data. Applying exclusions incorrectly (over-excluding) is
          an NCQA audit risk. Always document the source of the exclusion
          criteria.
        </p>
      </div>
    </div>
  );
}

function TabDocumentation({
  detail,
  loading,
}: {
  detail: any;
  loading: boolean;
}) {
  if (loading) return <TabSkeleton />;

  const doc = detail?.documentation;
  const evidenceTypes = (doc?.acceptedEvidenceTypes ?? []).map((e: any) => ({
    type: e.type,
    description: e.notes,
    acceptable: e.priority !== "Excluded",
    priority: (e.priority?.toLowerCase() ?? "supplemental") as
      | "required"
      | "preferred"
      | "supplemental",
    notes: e.notes,
  }));

  return (
    <div className="space-y-4">
      <SectionDivider label="Accepted Evidence Types" />
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              {["Evidence Type", "Priority", "Notes"].map((h) => (
                <th
                  key={h}
                  className="text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {evidenceTypes.map((e: any, i: number) => {
              const ps =
                PRIORITY_STYLES[e.priority] ?? PRIORITY_STYLES.supplemental;
              return (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[12px] font-semibold text-foreground">
                        {e.type}
                      </span>
                    </div>
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
        {(doc?.fileRequirements ?? []).map((r: string, i: number) => (
          <div
            key={i}
            className="border border-border rounded-xl p-3.5 bg-card flex items-start gap-2.5"
          >
            <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-foreground font-medium">{r}</p>
          </div>
        ))}
      </div>

      {doc?.highlightRequirements?.length > 0 && (
        <>
          <SectionDivider label="Highlight Requirements" />
          <div className="space-y-2">
            {doc.highlightRequirements.map((hr: string, i: number) => (
              <div
                key={i}
                className="border border-yellow-200 rounded-xl p-3.5 bg-yellow-50/40 flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded bg-yellow-300 flex items-center justify-center text-[10px] font-bold text-yellow-900 flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-[12px] font-semibold text-foreground">
                  {hr}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {doc?.commonErrorsToAvoid?.length > 0 && (
        <>
          <SectionDivider label="Common Errors to Avoid" />
          <div className="border border-red-200 bg-red-50/30 rounded-xl p-4 space-y-2">
            {doc.commonErrorsToAvoid.map((e: string, i: number) => (
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
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [myFilter, setMyFilter] = useState("MY2026");
  const [activeTab, setActiveTab] = useState<
    "eligibility" | "denominator" | "numerator" | "exclusions" | "documentation"
  >("eligibility");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // API Call
  const { data, isLoading, error, refetch } = useGetApiMeasureLibrary({
    search: searchQuery || undefined,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    productLine: productFilter === "all" ? undefined : productFilter,
    measurementYear: myFilter === "all" ? undefined : myFilter,
    active: true,
    page,
    limit: PAGE_SIZE,
  });

  const measures: MeasureSummary[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // After existing useGetApiMeasureLibrary call
  const { data: detailData, isLoading: detailLoading } =
    useGetApiMeasureLibraryId(selectedId ? String(selectedId) : undefined);

  const measureDetail = detailData?.data;

  // Selected Measure (for now using summary; later we'll fetch full details)
  const selected = measures.find((m) => m.id === selectedId) ?? measures[0];
  const catStyle = selected
    ? (CATEGORY_STYLES[selected.category] ?? CATEGORY_STYLES["Cardiovascular"])
    : CATEGORY_STYLES["Cardiovascular"];

  const CatDetailIcon = catStyle.icon;

  // Dynamic Categories
  const categories = useMemo(() => {
    const cats = new Set(measures.map((m) => m.category));
    return ["all", ...Array.from(cats)];
  }, [measures]);

  // Inside MeasuresLibrary — replace the broken useMemo auto-select
  useEffect(() => {
    if (measures.length > 0 && selectedId === null) {
      setSelectedId(measures[0].id);
    }
  }, [measures.length, selectedId]);

  // Add this useEffect alongside the existing ones
  useEffect(() => {
    setPage(1);
  }, [searchQuery, categoryFilter, productFilter, myFilter]);

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
              placeholder="Search measures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-[11px] border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-56"
            />
          </div>

          <FilterSel
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categories.map((c) => [
              c,
              c === "all" ? "All Categories" : c,
            ])}
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
              ["MY2026", "MY 2026"],
              ["MY2025", "MY 2025"],
              ["all", "All Years"],
            ]}
          />

          <div className="flex-1" />
          <span className="text-[10px] text-muted-foreground">
            {total} measures
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
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* ── LEFT PANEL: MEASURE LIST ── */}
        {/* ── LEFT PANEL: MEASURE LIST ── */}
        <div className="w-full md:w-72 flex-shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-border overflow-hidden bg-card">
          {/* Count header */}
          <div className="flex-shrink-0 px-3 py-2 border-b border-border">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {isLoading ? "Loading..." : `${total} Measures`}
            </p>
          </div>

          {/* Scrollable list — flex-1 so it fills space between header and pagination */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-3" />
                <p className="text-[12px]">Loading measures...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-red-500">
                <AlertTriangle className="w-8 h-8 mb-2" />
                <p className="text-[12px]">Failed to load measures</p>
                <button
                  onClick={() => refetch()}
                  className="mt-4 text-primary underline text-[11px]"
                >
                  Retry
                </button>
              </div>
            ) : measures.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="w-7 h-7 opacity-30 mb-2" />
                <p className="text-[12px]">No measures found</p>
              </div>
            ) : (
              measures.map((m) => {
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
                    className={`w-full text-left px-3 py-3.5 border-b border-border transition-all hover:bg-muted/30 border-l-[3px] ${
                      isSelected
                        ? cs.border + " " + cs.bg
                        : "border-l-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                          isSelected ? cs.iconBg : "bg-muted/40 border-border"
                        }`}
                      >
                        <CatIcon
                          className={`w-4 h-4 ${
                            isSelected ? cs.iconColor : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              isSelected
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {m.measureCode}
                          </span>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${
                              m.active
                                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                : "text-slate-600 bg-slate-50 border-slate-200"
                            }`}
                          >
                            {m.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p
                          className={`text-[12px] font-semibold leading-tight mb-1 ${
                            isSelected ? "text-foreground" : ""
                          }`}
                        >
                          {m.measureName}
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] text-muted-foreground">
                            {m.category}
                          </span>
                          <span className="text-muted-foreground/40">·</span>
                          <span
                            className={`text-[9px] font-semibold px-1 py-0.5 rounded ${
                              m.measureType === "Hybrid"
                                ? "bg-blue-50 text-blue-600"
                                : m.measureType === "Administrative"
                                  ? "bg-slate-50 text-slate-600"
                                  : "bg-teal-50 text-teal-600"
                            }`}
                          >
                            {m.measureType}
                          </span>
                        </div>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {m.productLines.map((pl) => (
                            <span
                              key={pl}
                              className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${
                                pl === "Commercial"
                                  ? "bg-blue-50 text-blue-600 border-blue-200"
                                  : pl === "Medicaid"
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                    : "bg-violet-50 text-violet-600 border-violet-200"
                              }`}
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

          {/* Pagination */}
          <div className="flex-shrink-0 overflow-x-auto border-t border-border">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalRecords={total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              recordLabel="measures"
            />
          </div>
        </div>

        {/* ── CENTER PANEL: MEASURE DETAIL ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Guard: list still loading or nothing selected yet */}
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              <p className="text-[12px]">Loading measure details...</p>
            </div>
          ) : (
            <>
              {/* ── HEADER ── */}
              <div
                className={`flex-shrink-0 border-b border-border px-6 py-4 ${catStyle.bg}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center flex-shrink-0 ${catStyle.iconBg} ${catStyle.border.replace("border-l-", "border-")}`}
                  >
                    <CatDetailIcon
                      className={`w-6 h-6 ${catStyle.iconColor}`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xl font-black text-foreground">
                        {detailLoading ? (
                          <span className="h-5 w-12 bg-muted animate-pulse rounded inline-block" />
                        ) : (
                          (measureDetail?.measureCode ?? selected.measureCode)
                        )}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          (measureDetail?.active ?? selected.active)
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {(measureDetail?.active ?? selected.active)
                          ? "Active"
                          : "Inactive"}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          (measureDetail?.measureType ??
                            selected.measureType) === "Hybrid"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : (measureDetail?.measureType ??
                                  selected.measureType) === "Administrative"
                              ? "bg-slate-50 text-slate-600 border-slate-200"
                              : "bg-teal-50 text-teal-700 border-teal-200"
                        }`}
                      >
                        {detailLoading
                          ? "…"
                          : (measureDetail?.measureType ??
                            selected.measureType)}
                      </span>

                      {(detailLoading
                        ? selected.productLines
                        : (measureDetail?.productLines ?? selected.productLines)
                      )?.map((pl: string) => (
                        <span
                          key={pl}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            pl === "Commercial"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : pl === "Medicaid"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-violet-50 text-violet-700 border-violet-200"
                          }`}
                        >
                          {pl}
                        </span>
                      ))}
                    </div>

                    <h2 className="text-base font-bold text-foreground leading-tight">
                      {detailLoading ? (
                        <span className="h-4 w-48 bg-muted animate-pulse rounded inline-block" />
                      ) : (
                        (measureDetail?.measureName ?? selected.measureName)
                      )}
                    </h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {detailLoading
                        ? "…"
                        : (measureDetail?.category ?? selected.category)}
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
                      value: detailLoading
                        ? "…"
                        : `${measureDetail?.eligibility?.ageCriteria?.minAge ?? "?"}–${measureDetail?.eligibility?.ageCriteria?.maxAge ?? "?"} yrs`,
                    },
                    {
                      label: "Measurement Year",
                      value: detailLoading
                        ? "…"
                        : (measureDetail?.measurementYear ??
                          selected.measurementYear),
                    },
                    {
                      label: "Enrollment Gap",
                      value: detailLoading
                        ? "…"
                        : (measureDetail?.eligibility?.continuousEnrollment
                            ?.maximumGapAllowed ?? "—"),
                    },
                    {
                      label: "Gender",
                      value: detailLoading
                        ? "…"
                        : (measureDetail?.eligibility?.genderRules?.join(
                            ", "
                          ) ?? "All"),
                    },
                    {
                      label: "Exclusions",
                      value: detailLoading
                        ? "…"
                        : `${measureDetail?.exclusions?.length ?? 0} categories`,
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

                {/* Description */}
                <div className="flex items-start gap-2 mt-3 p-2.5 bg-card/60 rounded-lg border border-border/60">
                  <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  {detailLoading ? (
                    <div className="h-3 w-64 bg-muted animate-pulse rounded" />
                  ) : (
                    <p className="text-[11px] text-foreground line-clamp-2">
                      {measureDetail?.description ?? selected.description}
                    </p>
                  )}
                </div>
              </div>

              {/* ── TABS BAR ── */}
              <div className="flex-shrink-0 border-b border-border bg-card flex items-center px-5 overflow-x-auto">
                {TAB_META.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* ── TAB CONTENT ── */}
              <div className="flex-1 overflow-y-auto p-5">
                {activeTab === "eligibility" && (
                  <TabEligibility
                    m={selected}
                    detail={measureDetail}
                    loading={detailLoading}
                  />
                )}
                {activeTab === "denominator" && (
                  <TabDenominator
                    detail={measureDetail}
                    loading={detailLoading}
                  />
                )}
                {activeTab === "numerator" && (
                  <TabNumerator
                    detail={measureDetail}
                    loading={detailLoading}
                  />
                )}
                {activeTab === "exclusions" && (
                  <TabExclusions
                    detail={measureDetail}
                    loading={detailLoading}
                  />
                )}
                {activeTab === "documentation" && (
                  <TabDocumentation
                    detail={measureDetail}
                    loading={detailLoading}
                  />
                )}
              </div>

              {/* ── FOOTER ── */}
              <div className="flex-shrink-0 border-t border-border bg-card px-5 py-2.5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Last Updated:{" "}
                    {measureDetail?.updated_at
                      ? new Date(measureDetail.updated_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {/* Use snake_case field first, then camelCase alias, then summary fallback */}
                    Version:{" "}
                    {measureDetail?.measurement_year ??
                      measureDetail?.measurementYear ??
                      selected.measurementYear}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Source: NCQA HEDIS{" "}
                    {measureDetail?.measurementYear ??
                      selected.measurementYear}{" "}
                    Technical Specifications
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                    View on NCQA.org
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
