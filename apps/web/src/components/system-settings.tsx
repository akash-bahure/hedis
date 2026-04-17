import { useState, useCallback } from "react";
import {
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Bell,
  Clock,
  BookOpen,
  Sparkles,
  Brain,
  Gauge,
  Sliders,
  Plug,
  Server,
  Key,
  Zap,
  Download,
  FileSpreadsheet,
  FileText,
  Shield,
  Monitor,
  Smartphone,
  Database,
  Archive,
  Check,
  CheckCircle2,
  X,
  XCircle,
  AlertTriangle,
  Info,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Settings,
  Save,
  RotateCcw,
  ChevronDown,
  Wifi,
  WifiOff,
  Star,
  HardDrive,
  CalendarClock,
  Lock,
  Fingerprint,
  ClipboardList,
  BarChart2,
  FileLock2,
  UserX,
  ShieldCheck,
  Inbox,
  Layers,
  Activity,
  Network,
  Hash,
  AlarmClock,
  FileOutput,
  LayoutGrid,
  Package,
  Printer,
  Link2,
  Terminal,
  Cpu,
} from "lucide-react";

/* ════════════════════════════════  HELPERS  */
type Saved = string | null;

function Toggle({
  on,
  onChange,
  size = "md",
  disabled = false,
}: {
  on: boolean;
  onChange: () => void;
  size?: "sm" | "md";
  disabled?: boolean;
}) {
  const w = size === "sm" ? "w-7 h-4" : "w-9 h-5";
  const k =
    size === "sm" ? "w-3 h-3 top-0.5 left-0.5" : "w-4 h-4 top-0.5 left-0.5";
  const t = size === "sm" ? "translate-x-3" : "translate-x-4";
  return (
    <button
      type="button"
      onClick={!disabled ? onChange : undefined}
      className={`relative ${w} rounded-full flex-shrink-0 transition-colors ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"} ${on ? "bg-primary" : "bg-slate-200 hover:bg-slate-300"}`}
    >
      <span
        className={`absolute ${k} bg-white rounded-full shadow-sm transition-transform ${on ? t : ""}`}
      />
    </button>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  sub,
  prefix,
  suffix,
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  sub?: string;
  prefix?: string;
  suffix?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {sub && (
        <p className="text-[9px] text-muted-foreground mb-1.5 leading-relaxed">
          {sub}
        </p>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-[11px] text-muted-foreground pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full py-2 text-[11px] bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${prefix ? "pl-8 pr-3" : suffix ? "pl-3 pr-8" : "px-3"} ${mono ? "font-mono" : ""}`}
        />
        {suffix && (
          <span className="absolute right-3 text-[11px] text-muted-foreground pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  sub,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  sub?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
        {label}
      </label>
      {sub && (
        <p className="text-[9px] text-muted-foreground mb-1.5 leading-relaxed">
          {sub}
        </p>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-[11px] bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none pr-7 transition-all"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

function SettingCard({
  title,
  sub,
  icon: Icon,
  iconColor = "text-primary",
  children,
}: {
  title: string;
  sub?: string;
  icon: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-muted/5">
        <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-xs font-black text-foreground">{title}</p>
          {sub && <p className="text-[9px] text-muted-foreground">{sub}</p>}
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  sub,
  on,
  onChange,
  badge,
}: {
  label: string;
  sub?: string;
  on: boolean;
  onChange: () => void;
  badge?: { text: string; cls: string };
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-foreground">
            {label}
          </span>
          {badge && (
            <span
              className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${badge.cls}`}
            >
              {badge.text}
            </span>
          )}
        </div>
        {sub && (
          <p className="text-[9px] text-muted-foreground mt-0.5 leading-snug">
            {sub}
          </p>
        )}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

function SaveBar({
  onSave,
  onReset,
  saved,
  dirty,
}: {
  onSave: () => void;
  onReset: () => void;
  saved: boolean;
  dirty: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 pt-4 border-t border-border mt-2 transition-all ${dirty ? "opacity-100" : "opacity-60"}`}
    >
      {dirty ? (
        <span className="flex items-center gap-1.5 text-[10px] text-amber-600 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Unsaved changes
        </span>
      ) : saved ? (
        <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Changes saved successfully
        </span>
      ) : (
        <span className="text-[10px] text-muted-foreground">
          All changes saved
        </span>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          disabled={!dirty}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground disabled:opacity-40 whitespace-nowrap"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
        <button
          onClick={onSave}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-bold rounded-xl transition-all whitespace-nowrap ${saved ? "bg-emerald-500 text-white" : "bg-primary text-white hover:opacity-90"}`}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-3 h-3" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function InfoTip({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 mt-3">
      <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
      <p className="text-[10px] text-blue-700 leading-relaxed">{text}</p>
    </div>
  );
}

function useSave() {
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const markDirty = useCallback(() => {
    setDirty(true);
    setSaved(false);
  }, []);
  const save = useCallback(() => {
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, []);
  const reset = useCallback(() => {
    setDirty(false);
    setSaved(false);
  }, []);
  return { dirty, saved, markDirty, save, reset };
}

/* ════════════════════════════════  SECTION: GENERAL  */
function GeneralSection() {
  const sv = useSave();
  const upd = (fn: () => void) => {
    fn();
    sv.markDirty();
  };
  const [org, setOrg] = useState({
    name: "HealthSys Coding Solutions Pvt. Ltd.",
    shortName: "HSCS",
    type: "coding-vendor",
    email: "admin@healthsys.in",
    phone: "+91 22 4812 9900",
    website: "https://healthsys.in",
    address: "12th Floor, Bandra Kurla Complex, Mumbai, Maharashtra 400051",
    timezone: "Asia/Kolkata",
    dateFormat: "DD MMM YYYY",
    fiscalStart: "April",
    currency: "INR",
    locale: "en-IN",
  });

  const set = (key: keyof typeof org) => (v: string) => {
    setOrg((p) => ({ ...p, [key]: v }));
    sv.markDirty();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SettingCard
          title="Organization Identity"
          icon={Building2}
          iconColor="text-primary"
        >
          <div className="space-y-3">
            {/* Logo upload */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                Organization Logo
              </p>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-white font-black text-xl">HS</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground whitespace-nowrap">
                    <Plus className="w-3 h-3" />
                    Upload Logo
                  </button>
                  <p className="text-[9px] text-muted-foreground">
                    PNG/SVG, max 1MB, recommended 256×256
                  </p>
                </div>
              </div>
            </div>
            <InputField
              label="Organization Name"
              value={org.name}
              onChange={set("name")}
              required
              placeholder="Legal entity name"
            />
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Short Name"
                value={org.shortName}
                onChange={set("shortName")}
                placeholder="Abbreviation"
              />
              <SelectField
                label="Organization Type"
                value={org.type}
                onChange={set("type")}
                options={[
                  { value: "health-system", label: "Health System" },
                  { value: "hospital", label: "Hospital" },
                  { value: "coding-vendor", label: "Coding Vendor" },
                  { value: "clinic", label: "Clinic" },
                  { value: "insurance", label: "Insurance / Payer" },
                ]}
              />
            </div>
          </div>
        </SettingCard>

        <SettingCard
          title="Contact & Location"
          icon={MapPin}
          iconColor="text-teal-600"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <InputField
                label="Primary Email"
                value={org.email}
                onChange={set("email")}
                type="email"
                prefix="✉"
                required
              />
              <InputField
                label="Phone Number"
                value={org.phone}
                onChange={set("phone")}
                prefix="📞"
              />
              <InputField
                label="Website"
                value={org.website}
                onChange={set("website")}
                prefix="🌐"
              />
              <InputField
                label="Address"
                value={org.address}
                onChange={set("address")}
                placeholder="Street, City, State, Postal Code"
              />
            </div>
          </div>
        </SettingCard>
      </div>

      <SettingCard
        title="Regional & Locale Settings"
        icon={Globe}
        iconColor="text-violet-600"
      >
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <SelectField
            label="Timezone"
            value={org.timezone}
            onChange={set("timezone")}
            options={[
              { value: "Asia/Kolkata", label: "IST (Asia/Kolkata, UTC+5:30)" },
              { value: "America/New_York", label: "EST (New York, UTC−5)" },
              {
                value: "America/Los_Angeles",
                label: "PST (Los Angeles, UTC−8)",
              },
              { value: "Europe/London", label: "GMT (London, UTC+0)" },
              { value: "Asia/Dubai", label: "GST (Dubai, UTC+4)" },
            ]}
          />
          <SelectField
            label="Date Format"
            value={org.dateFormat}
            onChange={set("dateFormat")}
            options={[
              { value: "DD MMM YYYY", label: "DD MMM YYYY (20 Feb 2026)" },
              { value: "MM/DD/YYYY", label: "MM/DD/YYYY (02/20/2026)" },
              { value: "DD/MM/YYYY", label: "DD/MM/YYYY (20/02/2026)" },
              { value: "YYYY-MM-DD", label: "YYYY-MM-DD (ISO 8601)" },
            ]}
          />
          <SelectField
            label="Fiscal Year Start"
            value={org.fiscalStart}
            onChange={set("fiscalStart")}
            options={[
              { value: "January", label: "January" },
              { value: "April", label: "April (India)" },
              { value: "July", label: "July" },
              { value: "October", label: "October" },
            ]}
          />
          <SelectField
            label="Default Currency"
            value={org.currency}
            onChange={set("currency")}
            options={[
              { value: "INR", label: "INR — Indian Rupee (₹)" },
              { value: "USD", label: "USD — US Dollar ($)" },
              { value: "EUR", label: "EUR — Euro (€)" },
              { value: "GBP", label: "GBP — British Pound (£)" },
            ]}
          />
        </div>
        <InfoTip text="Timezone setting affects all timestamps in audit logs, reports, and SLA calculations. Changing this will retroactively display all historical logs in the new timezone." />
      </SettingCard>

      <SaveBar
        onSave={sv.save}
        onReset={sv.reset}
        saved={sv.saved}
        dirty={sv.dirty}
      />
    </div>
  );
}

/* ════════════════════════════════  SECTION: NOTIFICATIONS  */
const NOTIF_EVENTS = [
  {
    id: "new-assign",
    label: "New Chart Assignment",
    sub: "When a chart is assigned to a coder or auditor",
  },
  {
    id: "sla-warning",
    label: "SLA Warning",
    sub: "When remaining SLA time drops below threshold",
  },
  {
    id: "sla-breach",
    label: "SLA Breach",
    sub: "When a chart exceeds its SLA window",
  },
  {
    id: "audit-feedback",
    label: "Audit Feedback",
    sub: "When auditor provides feedback on submitted code",
  },
  {
    id: "coding-submit",
    label: "Coding Submission",
    sub: "When a coder submits codes for a chart",
  },
  {
    id: "override",
    label: "Manager Override",
    sub: "When a manager overrides an audit decision",
  },
  {
    id: "exception",
    label: "Exception Raised",
    sub: "When a chart is flagged as an exception",
  },
  {
    id: "query-resp",
    label: "Query Response",
    sub: "When a physician responds to a clinical query",
  },
  {
    id: "daily-summary",
    label: "Daily Summary Report",
    sub: "Automated daily digest of key metrics",
  },
  {
    id: "weekly-report",
    label: "Weekly Analytics Report",
    sub: "Weekly performance and productivity digest",
  },
  {
    id: "system-alert",
    label: "System Alert / Downtime",
    sub: "Critical system events and maintenance windows",
  },
];

type NotifChannel = "email" | "inapp" | "sms" | "webhook";

function NotificationsSection() {
  const sv = useSave();
  const [notifs, setNotifs] = useState<
    Record<string, Record<NotifChannel, boolean>>
  >(() =>
    Object.fromEntries(
      NOTIF_EVENTS.map((e) => [
        e.id,
        {
          email: !["daily-summary", "weekly-report"].includes(e.id),
          inapp: true,
          sms: ["sla-breach", "system-alert"].includes(e.id),
          webhook: ["coding-submit", "exception"].includes(e.id),
        },
      ]),
    ),
  );
  const [frequency, setFrequency] = useState("immediate");
  const [emailTemplate, setEmailTemplate] = useState("default");

  const toggle = (eventId: string, ch: NotifChannel) => {
    setNotifs((p) => ({
      ...p,
      [eventId]: { ...p[eventId], [ch]: !p[eventId][ch] },
    }));
    sv.markDirty();
  };

  const CHANNELS: {
    id: NotifChannel;
    label: string;
    icon: React.ElementType;
    color: string;
  }[] = [
    { id: "email", label: "Email", icon: Mail, color: "text-blue-600" },
    { id: "inapp", label: "In-App", icon: Monitor, color: "text-teal-600" },
    { id: "sms", label: "SMS", icon: Smartphone, color: "text-violet-600" },
    { id: "webhook", label: "Webhook", icon: Zap, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SettingCard
          title="Delivery Preferences"
          icon={Bell}
          iconColor="text-blue-600"
        >
          <div className="space-y-3">
            <SelectField
              label="Email Delivery Frequency"
              value={frequency}
              onChange={(v) => {
                setFrequency(v);
                sv.markDirty();
              }}
              sub="Controls how quickly notifications are delivered for non-critical events"
              options={[
                { value: "immediate", label: "Immediate — send right away" },
                { value: "hourly", label: "Hourly digest — batch per hour" },
                {
                  value: "daily",
                  label: "Daily digest — 08:00 IST each morning",
                },
              ]}
            />
            <SelectField
              label="Email Template"
              value={emailTemplate}
              onChange={(v) => {
                setEmailTemplate(v);
                sv.markDirty();
              }}
              options={[
                { value: "default", label: "Default Healthcare Theme" },
                { value: "minimal", label: "Minimal Plain Text" },
                { value: "branded", label: "Branded (Organization Logo)" },
              ]}
            />
          </div>
        </SettingCard>
        <SettingCard
          title="Channel Legend"
          icon={Layers}
          iconColor="text-slate-500"
        >
          <div className="space-y-2">
            {CHANNELS.map((c) => {
              const Icon = c.icon;
              const total = NOTIF_EVENTS.filter(
                (e) => notifs[e.id]?.[c.id],
              ).length;
              return (
                <div key={c.id} className="flex items-center gap-2.5 py-1.5">
                  <Icon className={`w-4 h-4 ${c.color}`} />
                  <span className="text-[11px] font-semibold text-foreground flex-1">
                    {c.label} notifications
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {total}/{NOTIF_EVENTS.length} events
                  </span>
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${(total / NOTIF_EVENTS.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SettingCard>
      </div>

      {/* Notification Matrix */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-muted/5">
          <Bell className="w-4 h-4 text-blue-600" />
          <p className="text-xs font-black text-foreground">
            Notification Preferences Matrix
          </p>
          <span className="ml-auto text-[10px] text-muted-foreground">
            Toggle channels per event type
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/5">
                <th className="px-5 py-2.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wide w-80">
                  Event
                </th>
                {CHANNELS.map((c) => {
                  const Icon = c.icon;
                  return (
                    <th
                      key={c.id}
                      className="px-4 py-2.5 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wide"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Icon className={`w-3.5 h-3.5 ${c.color}`} />
                        <span>{c.label}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {NOTIF_EVENTS.map((ev, i) => (
                <tr
                  key={ev.id}
                  className={`hover:bg-muted/10 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}
                >
                  <td className="px-5 py-3">
                    <p className="text-[11px] font-semibold text-foreground">
                      {ev.label}
                    </p>
                    <p className="text-[9px] text-muted-foreground">{ev.sub}</p>
                  </td>
                  {CHANNELS.map((c) => (
                    <td key={c.id} className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <Toggle
                          on={notifs[ev.id]?.[c.id] ?? false}
                          onChange={() => toggle(ev.id, c.id)}
                          size="sm"
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SaveBar
        onSave={sv.save}
        onReset={sv.reset}
        saved={sv.saved}
        dirty={sv.dirty}
      />
    </div>
  );
}

/* ════════════════════════════════  SECTION: SLA  */
function SLASection() {
  const sv = useSave();
  const [sla, setSla] = useState([
    {
      priority: "Critical",
      color: "bg-red-500",
      light: "bg-red-50",
      text: "text-red-700",
      window: 4,
      unit: "hours",
      warnAt: 50,
      escalateAfter: 2,
    },
    {
      priority: "High",
      color: "bg-orange-500",
      light: "bg-orange-50",
      text: "text-orange-700",
      window: 8,
      unit: "hours",
      warnAt: 60,
      escalateAfter: 6,
    },
    {
      priority: "Normal",
      color: "bg-blue-500",
      light: "bg-blue-50",
      text: "text-blue-700",
      window: 24,
      unit: "hours",
      warnAt: 70,
      escalateAfter: 18,
    },
    {
      priority: "Low",
      color: "bg-slate-400",
      light: "bg-slate-50",
      text: "text-slate-600",
      window: 48,
      unit: "hours",
      warnAt: 80,
      escalateAfter: 40,
    },
  ]);
  const [bizHours, setBizHours] = useState({
    enabled: true,
    start: "08:00",
    end: "18:00",
    sat: false,
    sun: false,
  });

  const updateSla = (i: number, key: string, v: any) => {
    setSla((p) => p.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
    sv.markDirty();
  };

  return (
    <div className="space-y-4">
      {/* SLA table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-muted/5">
          <AlarmClock className="w-4 h-4 text-amber-600" />
          <p className="text-xs font-black text-foreground">
            SLA Windows by Priority
          </p>
          <InfoTip text="SLA windows apply to all new charts. Existing charts retain their original SLA assignment." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/5">
                {[
                  "Priority",
                  "SLA Window (hours)",
                  "Warn At (% elapsed)",
                  "Escalate After (hours)",
                  "Visual",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sla.map((row, i) => (
                <tr key={row.priority} className={`${row.light}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${row.color}`} />
                      <span className={`text-[11px] font-black ${row.text}`}>
                        {row.priority}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={row.window}
                        min={1}
                        max={168}
                        onChange={(e) =>
                          updateSla(i, "window", Number(e.target.value))
                        }
                        className="w-16 px-2 py-1 text-[11px] bg-white border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-center font-bold"
                      />
                      <span className="text-[10px] text-muted-foreground">
                        hours
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={row.warnAt}
                        min={10}
                        max={95}
                        onChange={(e) =>
                          updateSla(i, "warnAt", Number(e.target.value))
                        }
                        className="w-16 px-2 py-1 text-[11px] bg-white border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-center font-bold"
                      />
                      <span className="text-[10px] text-muted-foreground">
                        %
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={row.escalateAfter}
                        min={1}
                        max={row.window}
                        onChange={(e) =>
                          updateSla(i, "escalateAfter", Number(e.target.value))
                        }
                        className="w-16 px-2 py-1 text-[11px] bg-white border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-center font-bold"
                      />
                      <span className="text-[10px] text-muted-foreground">
                        h
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-36 relative">
                      <div className="h-3 bg-white/60 rounded-full overflow-hidden border border-white/40">
                        <div
                          className={`h-full rounded-full ${row.color} opacity-40`}
                          style={{ width: "100%" }}
                        />
                        <div
                          className="absolute top-0 left-0 h-full flex items-center"
                          style={{ left: `${row.warnAt}%` }}
                        >
                          <div className="w-0.5 h-3 bg-amber-500" />
                        </div>
                      </div>
                      <div className="flex justify-between text-[8px] text-muted-foreground mt-0.5">
                        <span>0h</span>
                        <span className="text-amber-600 font-bold">
                          {Math.round((row.window * row.warnAt) / 100)}h
                        </span>
                        <span>{row.window}h</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SettingCard
          title="Business Hours"
          icon={Clock}
          iconColor="text-blue-600"
        >
          <ToggleRow
            label="Business Hours SLA Mode"
            sub="SLA timers pause outside defined business hours"
            on={bizHours.enabled}
            onChange={() => {
              setBizHours((p) => ({ ...p, enabled: !p.enabled }));
              sv.markDirty();
            }}
          />
          {bizHours.enabled && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={bizHours.start}
                    onChange={(e) => {
                      setBizHours((p) => ({ ...p, start: e.target.value }));
                      sv.markDirty();
                    }}
                    className="w-full px-3 py-2 text-[11px] bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={bizHours.end}
                    onChange={(e) => {
                      setBizHours((p) => ({ ...p, end: e.target.value }));
                      sv.markDirty();
                    }}
                    className="w-full px-3 py-2 text-[11px] bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                {[
                  ["sat", "Saturday"],
                  ["sun", "Sunday"],
                ].map(([k, l]) => (
                  <label
                    key={k}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={(bizHours as any)[k]}
                      onChange={() => {
                        setBizHours((p) => ({
                          ...p,
                          [k]: !p[k as "sat" | "sun"],
                        }));
                        sv.markDirty();
                      }}
                      className="accent-primary w-3.5 h-3.5"
                    />
                    <span className="text-[11px] text-foreground">
                      {l} active
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </SettingCard>

        <SettingCard
          title="Escalation Rules"
          icon={AlertTriangle}
          iconColor="text-orange-500"
        >
          <div className="space-y-2.5">
            {[
              {
                label: "Escalate to Supervisor",
                sub: "When chart exceeds escalation threshold",
                on: true,
              },
              {
                label: "Email Escalation Alert",
                sub: "Send email to supervisor on escalation",
                on: true,
              },
              {
                label: "Auto-Reassign on Breach",
                sub: "Reassign to available coder if SLA breached",
                on: false,
              },
              {
                label: "Pause SLA on Exception",
                sub: "SLA timer pauses when chart is in exception state",
                on: true,
              },
              {
                label: "SLA Breach Audit Log",
                sub: "Log every SLA breach event for reporting",
                on: true,
              },
            ].map((r) => (
              <ToggleRow
                key={r.label}
                label={r.label}
                sub={r.sub}
                on={r.on}
                onChange={sv.markDirty}
              />
            ))}
          </div>
        </SettingCard>
      </div>

      <SaveBar
        onSave={sv.save}
        onReset={sv.reset}
        saved={sv.saved}
        dirty={sv.dirty}
      />
    </div>
  );
}

/* ════════════════════════════════  SECTION: CODING STANDARDS  */
function CodingSection() {
  const sv = useSave();
  const [cs, setCs] = useState({
    icdVer: "ICD-10-CM FY2026",
    icsVer: "ICD-10-PCS FY2026",
    cptVer: "CPT 2026",
    drgGrouper: "MS-DRG v42.0",
    hccModel: "CMS-HCC v28",
    apcGrouper: "CMS-APC 2026",
  });
  const [rules, setRules] = useState({
    requirePrincipalDx: true,
    validatePOA: true,
    ccMccCapture: true,
    procDxRelation: true,
    requireDRG: true,
    emCodeValidation: true,
    sequencingRules: true,
    queryDoc: true,
    uhddsCompliance: true,
    exclusionDx: false,
    zCodes: true,
  });
  const setRule = (k: keyof typeof rules) => () => {
    setRules((p) => ({ ...p, [k]: !p[k] }));
    sv.markDirty();
  };

  return (
    <div className="space-y-4">
      <SettingCard
        title="Clinical Classification Systems"
        icon={BookOpen}
        iconColor="text-teal-600"
      >
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {[
            {
              label: "ICD-10-CM Version",
              key: "icdVer",
              opts: [
                "ICD-10-CM FY2026",
                "ICD-10-CM FY2025",
                "ICD-10-CM FY2024",
              ],
            },
            {
              label: "ICD-10-PCS Version",
              key: "icsVer",
              opts: ["ICD-10-PCS FY2026", "ICD-10-PCS FY2025"],
            },
            {
              label: "CPT® Edition",
              key: "cptVer",
              opts: ["CPT 2026", "CPT 2025"],
            },
            {
              label: "DRG Grouper",
              key: "drgGrouper",
              opts: ["MS-DRG v42.0", "MS-DRG v41.1", "APR-DRG 39.0"],
            },
            {
              label: "HCC Risk Adjustment",
              key: "hccModel",
              opts: ["CMS-HCC v28", "CMS-HCC v24", "CMS-HCC v23"],
            },
            {
              label: "APC Grouper",
              key: "apcGrouper",
              opts: ["CMS-APC 2026", "CMS-APC 2025"],
            },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                {f.label}
              </label>
              <div className="relative">
                <select
                  value={(cs as any)[f.key]}
                  onChange={(e) => {
                    setCs((p) => ({ ...p, [f.key]: e.target.value }));
                    sv.markDirty();
                  }}
                  className="w-full px-3 py-2 text-[11px] bg-muted/30 border border-border rounded-xl focus:outline-none appearance-none pr-7"
                >
                  {f.opts.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] text-emerald-600 font-bold">
                  Current — Active
                </span>
              </div>
            </div>
          ))}
        </div>
        <InfoTip text="Version changes affect code validation for all future submissions. Existing submitted charts retain the version that was active at time of submission." />
      </SettingCard>

      <SettingCard
        title="Coding Validation Rules"
        icon={ClipboardList}
        iconColor="text-blue-600"
        sub="Rules enforced during code submission and AI suggestion validation"
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
          {[
            {
              key: "requirePrincipalDx",
              label: "Require Principal Diagnosis",
              sub: "Block submission without a primary Dx code",
            },
            {
              key: "validatePOA",
              label: "Validate POA Indicators",
              sub: "Present-on-Admission indicators required for inpatient",
            },
            {
              key: "ccMccCapture",
              label: "CC/MCC Capture Check",
              sub: "Flag potential CC/MCC not captured in the code set",
            },
            {
              key: "procDxRelation",
              label: "Procedure-Diagnosis Validation",
              sub: "Validate that procedure codes match listed diagnoses",
            },
            {
              key: "requireDRG",
              label: "Require DRG Assignment",
              sub: "Chart cannot be submitted without a valid DRG",
            },
            {
              key: "emCodeValidation",
              label: "E/M Code Selection Validation",
              sub: "Validate E/M level against documentation score",
            },
            {
              key: "sequencingRules",
              label: "UHDDS Sequencing Rules",
              sub: "Enforce UHDDS principal Dx sequencing guidelines",
            },
            {
              key: "queryDoc",
              label: "Query Documentation Required",
              sub: "Flag charts requiring physician query before submit",
            },
            {
              key: "uhddsCompliance",
              label: "UHDDS Guidelines Enforcement",
              sub: "Uniform Hospital Discharge Data Set standards",
            },
            {
              key: "exclusionDx",
              label: "Exclusion Dx Warnings",
              sub: "Warn when mutually exclusive codes are both selected",
            },
            {
              key: "zCodes",
              label: "Z-Code (Supplemental) Capture",
              sub: "Flag missing Z-codes for social determinants of health",
            },
          ].map((r) => (
            <ToggleRow
              key={r.key}
              label={r.label}
              sub={r.sub}
              on={(rules as any)[r.key]}
              onChange={setRule(r.key as keyof typeof rules)}
            />
          ))}
        </div>
      </SettingCard>

      <SaveBar
        onSave={sv.save}
        onReset={sv.reset}
        saved={sv.saved}
        dirty={sv.dirty}
      />
    </div>
  );
}

/* ════════════════════════════════  SECTION: AI BEHAVIOR  */
function AISection() {
  const sv = useSave();
  const [ai, setAi] = useState({
    masterEnabled: true,
    icdThreshold: 70,
    cptThreshold: 72,
    autoAcceptThreshold: 92,
    maxSuggestions: "5",
    showConfidence: true,
    showExplanation: true,
    ocrEnhancement: true,
    memberMatching: true,
    queryTrigger: true,
    anomalyDetection: true,
    feedbackLearning: true,
    specialtyAware: true,
    emAI: true,
    procedureAI: true,
    drgOptimization: false,
    hccSuggestions: true,
  });
  const set = (key: keyof typeof ai, val: any) => {
    setAi((p) => ({ ...p, [key]: val }));
    sv.markDirty();
  };
  const toggle = (key: keyof typeof ai) =>
    set(key, !ai[key as keyof typeof ai]);

  return (
    <div className="space-y-4">
      {/* Master toggle card */}
      <div
        className={`rounded-2xl border-2 p-5 shadow-sm transition-all ${ai.masterEnabled ? "border-primary bg-primary/5" : "border-border bg-muted/20"}`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${ai.masterEnabled ? "bg-primary" : "bg-muted"}`}
          >
            <Brain
              className={`w-6 h-6 ${ai.masterEnabled ? "text-white" : "text-muted-foreground"}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-black text-foreground">
                AI-Assisted Medical Coding
              </h3>
              {ai.masterEnabled ? (
                <span className="flex items-center gap-1.5 text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ENABLED
                </span>
              ) : (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                  DISABLED
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Master switch for all AI-powered coding assistance. Disabling
              hides all AI suggestions — coders work entirely manually.
            </p>
          </div>
          <Toggle
            on={ai.masterEnabled}
            onChange={() => toggle("masterEnabled")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Confidence Thresholds */}
        <SettingCard
          title="Confidence Thresholds"
          icon={Gauge}
          iconColor="text-violet-600"
          sub="Minimum confidence score for AI to surface a suggestion"
        >
          <div className="space-y-5">
            {[
              {
                label: "ICD-10 Suggestion Threshold",
                key: "icdThreshold",
                val: ai.icdThreshold,
                color: "bg-blue-500",
              },
              {
                label: "CPT Suggestion Threshold",
                key: "cptThreshold",
                val: ai.cptThreshold,
                color: "bg-teal-500",
              },
              {
                label: "Auto-Accept Threshold",
                key: "autoAcceptThreshold",
                val: ai.autoAcceptThreshold,
                color: "bg-emerald-500",
              },
            ].map((f) => (
              <div key={f.key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-foreground">
                    {f.label}
                  </span>
                  <span className={`text-sm font-black text-foreground`}>
                    {(ai as any)[f.key]}%
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={99}
                  step={1}
                  value={(ai as any)[f.key]}
                  onChange={(e) =>
                    set(f.key as keyof typeof ai, Number(e.target.value))
                  }
                  className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                  <span>50% (permissive)</span>
                  {f.key === "autoAcceptThreshold" && (
                    <span className="text-emerald-600 font-bold">
                      ⚡ Auto-accept: codes bypass auditor review
                    </span>
                  )}
                  <span>99% (strict)</span>
                </div>
              </div>
            ))}
          </div>
          <InfoTip text="Auto-accept threshold applies only to charts flagged for AI fast-track. Set above 90% for HIPAA compliance. Current model precision at 92%+ threshold: 98.4%." />
        </SettingCard>

        {/* Suggestion Settings */}
        <SettingCard
          title="Suggestion Behavior"
          icon={Sparkles}
          iconColor="text-primary"
        >
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between py-1.5">
              <div>
                <p className="text-[11px] font-semibold text-foreground">
                  Max Suggestions per Code Type
                </p>
                <p className="text-[9px] text-muted-foreground">
                  ICD and CPT suggestions shown per encounter
                </p>
              </div>
              <div className="relative">
                <select
                  value={ai.maxSuggestions}
                  onChange={(e) => set("maxSuggestions", e.target.value)}
                  className="px-2.5 py-1.5 text-[11px] bg-muted/30 border border-border rounded-xl focus:outline-none appearance-none pr-6"
                >
                  {["3", "5", "8", "10", "All"].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
          <ToggleRow
            label="Show Confidence Scores"
            sub="Display % confidence next to each AI suggestion"
            on={ai.showConfidence}
            onChange={() => toggle("showConfidence")}
            disabled={!ai.masterEnabled}
          />
          <ToggleRow
            label="Show AI Explanation"
            sub="Show the clinical evidence supporting each code"
            on={ai.showExplanation}
            onChange={() => toggle("showExplanation")}
            disabled={!ai.masterEnabled}
          />
          <ToggleRow
            label="Specialty-Aware Coding"
            sub="Tailor suggestions to chart's clinical specialty"
            on={ai.specialtyAware}
            onChange={() => toggle("specialtyAware")}
            disabled={!ai.masterEnabled}
          />
          <ToggleRow
            label="E/M Level AI Suggestions"
            sub="AI recommends Evaluation & Management code levels"
            on={ai.emAI}
            onChange={() => toggle("emAI")}
            disabled={!ai.masterEnabled}
          />
          <ToggleRow
            label="Procedure Code AI"
            sub="AI suggests CPT procedure codes from op notes"
            on={ai.procedureAI}
            onChange={() => toggle("procedureAI")}
            disabled={!ai.masterEnabled}
          />
          <ToggleRow
            label="DRG Optimization"
            sub="AI flags potential DRG weight improvements"
            on={ai.drgOptimization}
            onChange={() => toggle("drgOptimization")}
            disabled={!ai.masterEnabled}
            badge={{
              text: "Beta",
              cls: "bg-amber-50 border-amber-200 text-amber-700",
            }}
          />
        </SettingCard>
      </div>

      {/* AI Module Toggles */}
      <SettingCard
        title="AI Sub-System Controls"
        icon={Cpu}
        iconColor="text-indigo-600"
        sub="Enable or disable individual AI processing modules"
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
          <ToggleRow
            label="OCR AI Enhancement"
            sub="AI-powered text extraction from scanned documents"
            on={ai.ocrEnhancement}
            onChange={() => toggle("ocrEnhancement")}
          />
          <ToggleRow
            label="Member Matching AI"
            sub="AI-assisted patient identity resolution"
            on={ai.memberMatching}
            onChange={() => toggle("memberMatching")}
          />
          <ToggleRow
            label="Clinical Query Triggers"
            sub="AI identifies charts requiring physician queries"
            on={ai.queryTrigger}
            onChange={() => toggle("queryTrigger")}
          />
          <ToggleRow
            label="Anomaly Detection"
            sub="Detect unusual coding patterns and flag for review"
            on={ai.anomalyDetection}
            onChange={() => toggle("anomalyDetection")}
          />
          <ToggleRow
            label="Feedback Learning"
            sub="AI improves from coder corrections and overrides"
            on={ai.feedbackLearning}
            onChange={() => toggle("feedbackLearning")}
            badge={{
              text: "Active Training",
              cls: "bg-violet-50 border-violet-200 text-violet-700",
            }}
          />
          <ToggleRow
            label="HCC Risk Adjustment AI"
            sub="AI suggests RAF-score-impacting diagnoses"
            on={ai.hccSuggestions}
            onChange={() => toggle("hccSuggestions")}
          />
        </div>
      </SettingCard>

      <SaveBar
        onSave={sv.save}
        onReset={sv.reset}
        saved={sv.saved}
        dirty={sv.dirty}
      />
    </div>
  );
}

/* ════════════════════════════════  SECTION: INTEGRATIONS  */
type IntStatus = "connected" | "pending" | "error" | "disconnected";
const INTEGRATIONS = [
  {
    id: "apollo",
    name: "Apollo Hospitals EMR",
    protocol: "HL7 FHIR R4",
    status: "connected" as IntStatus,
    lastSync: "2 min ago",
    facility: "Apollo Inpatient FY26",
  },
  {
    id: "max",
    name: "Max Healthcare HIS",
    protocol: "HL7 v2.7",
    status: "connected" as IntStatus,
    lastSync: "5 min ago",
    facility: "Max Healthcare Q1",
  },
  {
    id: "fortis",
    name: "Fortis Hospital HIS",
    protocol: "REST API",
    status: "connected" as IntStatus,
    lastSync: "1 hour ago",
    facility: "Fortis Cardiology FY26",
  },
  {
    id: "aiims",
    name: "AIIMS Patient Management",
    protocol: "HL7 FHIR R4",
    status: "pending" as IntStatus,
    lastSync: "Setup pending",
    facility: "AIIMS Oncology FY26",
  },
  {
    id: "manipal",
    name: "Manipal Hospital EMR",
    protocol: "HL7 v2.7",
    status: "error" as IntStatus,
    lastSync: "Auth expired",
    facility: "Manipal General FY26",
  },
];
const API_KEYS = [
  {
    id: "k1",
    name: "Audit Export API",
    prefix: "sk-***1a2b",
    created: "Jan 12, 2026",
    lastUsed: "2h ago",
    scopes: ["read:audit"],
    status: "active" as const,
  },
  {
    id: "k2",
    name: "Report Webhook",
    prefix: "sk-***9f8g",
    created: "Dec 5, 2025",
    lastUsed: "4d ago",
    scopes: ["write:reports"],
    status: "active" as const,
  },
  {
    id: "k3",
    name: "Analytics API",
    prefix: "sk-***4j5k",
    created: "Nov 20, 2025",
    lastUsed: "12d ago",
    scopes: ["read:analytics"],
    status: "active" as const,
  },
  {
    id: "k4",
    name: "Legacy Integration",
    prefix: "sk-***2x3y",
    created: "Aug 8, 2025",
    lastUsed: "3mo ago",
    scopes: ["all"],
    status: "revoked" as const,
  },
];

function IntegrationsSection() {
  const [reveal, setReveal] = useState<Set<string>>(new Set());
  const [storage, setStorage] = useState({
    provider: "aws-s3",
    bucket: "healthsys-phi-prod",
    region: "ap-south-1",
    encrypted: true,
  });

  const statusCfg: Record<
    IntStatus,
    {
      bg: string;
      border: string;
      text: string;
      dot: string;
      icon: React.ElementType;
      label: string;
    }
  > = {
    connected: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      icon: Wifi,
      label: "Connected",
    },
    pending: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      dot: "bg-amber-400",
      icon: RefreshCw,
      label: "Pending",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      dot: "bg-red-500",
      icon: WifiOff,
      label: "Error",
    },
    disconnected: {
      bg: "bg-muted",
      border: "border-border",
      text: "text-muted-foreground",
      dot: "bg-slate-400",
      icon: WifiOff,
      label: "Disconnected",
    },
  };

  return (
    <div className="space-y-4">
      {/* EHR Integrations */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-muted/5">
          <Plug className="w-4 h-4 text-teal-600" />
          <div>
            <p className="text-xs font-black text-foreground">
              EHR / HIS Integrations
            </p>
            <p className="text-[9px] text-muted-foreground">
              Connected hospital information systems and EMR platforms
            </p>
          </div>
          <button className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-primary text-white rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap">
            <Plus className="w-3 h-3" />
            Add Integration
          </button>
        </div>
        <div className="divide-y divide-border">
          {INTEGRATIONS.map((intg) => {
            const cfg = statusCfg[intg.status];
            const Icon = cfg.icon;
            return (
              <div
                key={intg.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/10 transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`w-4 h-4 ${cfg.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-black text-foreground">
                      {intg.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-mono">
                      {intg.protocol}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${intg.status === "connected" ? "animate-pulse" : ""}`}
                      />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    {intg.facility} · Last sync: {intg.lastSync}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {intg.status === "connected" && (
                    <button className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground whitespace-nowrap">
                      <RefreshCw className="w-2.5 h-2.5" />
                      Sync
                    </button>
                  )}
                  {intg.status === "error" && (
                    <button className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold border border-orange-200 bg-orange-50 rounded-lg text-orange-700 whitespace-nowrap">
                      <RefreshCw className="w-2.5 h-2.5" />
                      Reconnect
                    </button>
                  )}
                  {intg.status === "pending" && (
                    <button className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold border border-blue-200 bg-blue-50 rounded-lg text-blue-700 whitespace-nowrap">
                      <ChevronRight className="w-2.5 h-2.5" />
                      Continue Setup
                    </button>
                  )}
                  <button className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground whitespace-nowrap">
                    <Settings className="w-2.5 h-2.5" />
                    Configure
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* API Key Management */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-muted/5">
          <Key className="w-4 h-4 text-amber-600" />
          <p className="text-xs font-black text-foreground">
            API Key Management
          </p>
          <button className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-primary text-white rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap">
            <Plus className="w-3 h-3" />
            Generate Key
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/5">
                {[
                  "Key Name",
                  "API Key",
                  "Scope(s)",
                  "Created",
                  "Last Used",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {API_KEYS.map((k) => (
                <tr
                  key={k.id}
                  className={`hover:bg-muted/10 transition-colors ${k.status === "revoked" ? "opacity-50" : ""}`}
                >
                  <td className="px-4 py-3 text-[11px] font-bold text-foreground">
                    {k.name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-foreground">
                        {reveal.has(k.id)
                          ? "sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                          : k.prefix}
                      </span>
                      <button
                        onClick={() =>
                          setReveal((p) => {
                            const n = new Set(p);
                            n.has(k.id) ? n.delete(k.id) : n.add(k.id);
                            return n;
                          })
                        }
                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-muted transition-colors"
                      >
                        {reveal.has(k.id) ? (
                          <EyeOff className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <Eye className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                      <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-muted transition-colors">
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {k.scopes.map((s) => (
                        <span
                          key={s}
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-mono"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-muted-foreground">
                    {k.created}
                  </td>
                  <td className="px-4 py-3 text-[10px] text-muted-foreground">
                    {k.lastUsed}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${k.status === "active" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-100 border-slate-200 text-slate-500"}`}
                    >
                      {k.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {k.status === "active" && (
                      <button className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-bold border border-red-200 bg-red-50 rounded-lg text-red-600 hover:bg-red-100 transition-colors whitespace-nowrap">
                        <X className="w-2.5 h-2.5" />
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Storage */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SettingCard
          title="Document Storage"
          icon={HardDrive}
          iconColor="text-blue-600"
          sub="PHI document and scanned file storage backend"
        >
          <div className="space-y-3">
            <SelectField
              label="Storage Provider"
              value={storage.provider}
              onChange={(v) => setStorage((p) => ({ ...p, provider: v }))}
              options={[
                { value: "aws-s3", label: "AWS S3 (Amazon Simple Storage)" },
                { value: "azure", label: "Azure Blob Storage" },
                { value: "gcs", label: "Google Cloud Storage" },
                { value: "local", label: "On-Premises / Local NFS" },
              ]}
            />
            <InputField
              label="Bucket / Container Name"
              value={storage.bucket}
              onChange={(v) => setStorage((p) => ({ ...p, bucket: v }))}
              mono
            />
            <InputField
              label="Region"
              value={storage.region}
              onChange={(v) => setStorage((p) => ({ ...p, region: v }))}
            />
            <ToggleRow
              label="Server-Side Encryption"
              sub="AES-256 encryption at rest (required for PHI)"
              on={storage.encrypted}
              onChange={() =>
                setStorage((p) => ({ ...p, encrypted: !p.encrypted }))
              }
              badge={{
                text: "HIPAA Required",
                cls: "bg-blue-50 border-blue-200 text-blue-700",
              }}
            />
          </div>
        </SettingCard>

        <SettingCard
          title="Webhooks & Events"
          icon={Zap}
          iconColor="text-amber-600"
          sub="Receive real-time event notifications at a URL"
        >
          <div className="space-y-3">
            <InputField
              label="Webhook URL"
              value="https://api.healthsys.in/webhooks/hedis"
              onChange={() => {}}
              placeholder="https://your-endpoint.com/webhook"
            />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Events to Stream
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  "Coding Submitted",
                  "Audit Completed",
                  "Exception Raised",
                  "SLA Breach",
                  "User Login",
                  "Override Action",
                ].map((ev) => (
                  <label
                    key={ev}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={[
                        "Coding Submitted",
                        "Audit Completed",
                        "SLA Breach",
                      ].includes(ev)}
                      className="accent-primary w-3.5 h-3.5"
                    />
                    <span className="text-[10px] text-foreground">{ev}</span>
                  </label>
                ))}
              </div>
            </div>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground whitespace-nowrap">
              <Zap className="w-3 h-3" />
              Send Test Event
            </button>
          </div>
        </SettingCard>
      </div>
    </div>
  );
}

/* ════════════════════════════════  SECTION: EXPORT  */
function ExportSection() {
  const sv = useSave();
  const [fmt, setFmt] = useState<"pdf" | "excel" | "csv">("pdf");
  const [exp, setExp] = useState({
    pageSize: "A4",
    orientation: "portrait",
    includeLogo: true,
    includeSignature: true,
    watermark: true,
    dateFormat: "DD MMM YYYY",
    decimalPrecision: "2",
    excelSheets: "separate",
    csvDelimiter: "comma",
    csvEncoding: "UTF-8",
    scheduleEnabled: false,
    scheduleFreq: "weekly",
    scheduleTime: "08:00",
    scheduleRecipients: "reports@healthsys.in",
  });
  const set = (k: keyof typeof exp, v: any) => {
    setExp((p) => ({ ...p, [k]: v }));
    sv.markDirty();
  };

  return (
    <div className="space-y-4">
      {/* Format Selector */}
      <SettingCard
        title="Default Export Format"
        icon={FileOutput}
        iconColor="text-teal-600"
      >
        <div className="grid grid-cols-3 gap-3 mb-4">
          {(
            [
              {
                id: "pdf",
                label: "PDF",
                Icon: Printer,
                sub: "Formatted reports with charts",
                badge: "Most Used",
              },
              {
                id: "excel",
                label: "Excel",
                Icon: FileSpreadsheet,
                sub: "Editable workbook with multiple sheets",
                badge: null,
              },
              {
                id: "csv",
                label: "CSV",
                Icon: Hash,
                sub: "Raw data for external processing",
                badge: null,
              },
            ] as const
          ).map((f) => {
            const Icon = f.Icon;
            const active = fmt === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setFmt(f.id);
                  sv.markDirty();
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${active ? "border-primary bg-primary/5" : "border-border bg-muted/20 hover:border-primary/40"}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? "bg-primary" : "bg-muted"}`}
                >
                  <Icon
                    className={`w-5 h-5 ${active ? "text-white" : "text-muted-foreground"}`}
                  />
                </div>
                <div className="text-center">
                  <div
                    className={`text-sm font-black ${active ? "text-primary" : "text-foreground"}`}
                  >
                    {f.label}
                  </div>
                  <div className="text-[9px] text-muted-foreground leading-tight">
                    {f.sub}
                  </div>
                  {f.badge && (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {f.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Format-specific settings */}
        {fmt === "pdf" && (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 pt-3 border-t border-border">
            <SelectField
              label="Page Size"
              value={exp.pageSize}
              onChange={(v) => set("pageSize", v)}
              options={[
                { value: "A4", label: "A4 (210×297mm)" },
                { value: "Letter", label: "Letter (8.5×11in)" },
                { value: "Legal", label: "Legal (8.5×14in)" },
              ]}
            />
            <SelectField
              label="Orientation"
              value={exp.orientation}
              onChange={(v) => set("orientation", v)}
              options={[
                { value: "portrait", label: "Portrait" },
                { value: "landscape", label: "Landscape" },
              ]}
            />
            <SelectField
              label="Date Format"
              value={exp.dateFormat}
              onChange={(v) => set("dateFormat", v)}
              options={[
                { value: "DD MMM YYYY", label: "DD MMM YYYY" },
                { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                { value: "YYYY-MM-DD", label: "ISO 8601" },
              ]}
            />
          </div>
        )}
        {fmt === "excel" && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
            <SelectField
              label="Sheet Layout"
              value={exp.excelSheets}
              onChange={(v) => set("excelSheets", v)}
              options={[
                { value: "separate", label: "Separate sheet per section" },
                { value: "single", label: "Single sheet" },
              ]}
            />
            <SelectField
              label="Decimal Precision"
              value={exp.decimalPrecision}
              onChange={(v) => set("decimalPrecision", v)}
              options={[
                { value: "0", label: "0 decimal places" },
                { value: "1", label: "1 decimal place" },
                { value: "2", label: "2 decimal places" },
              ]}
            />
          </div>
        )}
        {fmt === "csv" && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
            <SelectField
              label="Delimiter"
              value={exp.csvDelimiter}
              onChange={(v) => set("csvDelimiter", v)}
              options={[
                { value: "comma", label: "Comma (,)" },
                { value: "tab", label: "Tab (\\t)" },
                { value: "pipe", label: "Pipe (|)" },
                { value: "semicolon", label: "Semicolon (;)" },
              ]}
            />
            <SelectField
              label="File Encoding"
              value={exp.csvEncoding}
              onChange={(v) => set("csvEncoding", v)}
              options={[
                { value: "UTF-8", label: "UTF-8" },
                { value: "UTF-8-BOM", label: "UTF-8 with BOM" },
                { value: "ASCII", label: "ASCII" },
              ]}
            />
          </div>
        )}
      </SettingCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SettingCard
          title="Report Content Options"
          icon={FileText}
          iconColor="text-blue-600"
        >
          <ToggleRow
            label="Organization Logo in Header"
            sub="Include org logo in exported report headers"
            on={exp.includeLogo}
            onChange={() => set("includeLogo", !exp.includeLogo)}
          />
          <ToggleRow
            label="Digital Signature Block"
            sub="Include authorized signatory block on reports"
            on={exp.includeSignature}
            onChange={() => set("includeSignature", !exp.includeSignature)}
          />
          <ToggleRow
            label="PHI Watermark"
            sub="Print 'CONFIDENTIAL — PHI' watermark on pages"
            on={exp.watermark}
            onChange={() => set("watermark", !exp.watermark)}
            badge={{
              text: "Recommended",
              cls: "bg-teal-50 border-teal-200 text-teal-700",
            }}
          />
          <div className="pt-2 mt-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Default Columns in Coding Reports
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Chart ID",
                "Patient Name",
                "Facility",
                "Coder",
                "ICD Codes",
                "CPT Codes",
                "DRG",
                "AI Confidence",
                "Submission Date",
                "Status",
              ].map((col) => (
                <span
                  key={col}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted border border-border text-[9px] font-bold text-foreground"
                >
                  <Check className="w-2.5 h-2.5 text-emerald-500" />
                  {col}
                </span>
              ))}
            </div>
          </div>
        </SettingCard>

        <SettingCard
          title="Scheduled Auto-Export"
          icon={CalendarClock}
          iconColor="text-violet-600"
        >
          <ToggleRow
            label="Enable Scheduled Exports"
            sub="Automatically generate and email reports on a schedule"
            on={exp.scheduleEnabled}
            onChange={() => set("scheduleEnabled", !exp.scheduleEnabled)}
          />
          {exp.scheduleEnabled && (
            <div className="mt-3 space-y-3">
              <SelectField
                label="Frequency"
                value={exp.scheduleFreq}
                onChange={(v) => set("scheduleFreq", v)}
                options={[
                  { value: "daily", label: "Daily" },
                  { value: "weekly", label: "Weekly (Monday)" },
                  { value: "monthly", label: "Monthly (1st of month)" },
                ]}
              />
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                  Send At (IST)
                </label>
                <input
                  type="time"
                  value={exp.scheduleTime}
                  onChange={(e) => set("scheduleTime", e.target.value)}
                  className="px-3 py-2 text-[11px] bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <InputField
                label="Recipients (comma-separated emails)"
                value={exp.scheduleRecipients}
                onChange={(v) => set("scheduleRecipients", v)}
                placeholder="email@domain.com, ..."
              />
            </div>
          )}
        </SettingCard>
      </div>

      <SaveBar
        onSave={sv.save}
        onReset={sv.reset}
        saved={sv.saved}
        dirty={sv.dirty}
      />
    </div>
  );
}

/* ════════════════════════════════  SECTION: SESSION  */
function SessionSection() {
  const sv = useSave();
  const [sess, setSess] = useState({
    autoLogout: "30",
    idleWarning: "10",
    concurrentSessions: "1",
    rememberDevice: "30",
    forceOnPasswordChange: true,
    forceOnRoleChange: true,
    forceOnPolicyUpdate: false,
    loginAudit: true,
    deviceTrust: true,
    singleSignOn: true,
    cookieSecure: true,
    csrfProtection: true,
  });
  const set = (k: keyof typeof sess, v: any) => {
    setSess((p) => ({ ...p, [k]: v }));
    sv.markDirty();
  };
  const toggle = (k: keyof typeof sess) =>
    set(k, !sess[k as keyof typeof sess]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SettingCard
          title="Auto-Logout & Timeout"
          icon={Clock}
          iconColor="text-blue-600"
          sub="Control how long inactive sessions remain valid"
        >
          <div className="space-y-3">
            <SelectField
              label="Auto-Logout After Inactivity"
              value={sess.autoLogout}
              onChange={(v) => set("autoLogout", v)}
              sub="Session ends after this period of user inactivity"
              options={[
                { value: "15", label: "15 minutes" },
                { value: "30", label: "30 minutes (recommended)" },
                { value: "60", label: "1 hour" },
                { value: "120", label: "2 hours" },
                { value: "never", label: "Never (not recommended for PHI)" },
              ]}
            />
            <SelectField
              label="Idle Warning At"
              value={sess.idleWarning}
              onChange={(v) => set("idleWarning", v)}
              sub="Show session expiry warning this many minutes before auto-logout"
              options={[
                { value: "3", label: "3 minutes before" },
                { value: "5", label: "5 minutes before" },
                { value: "10", label: "10 minutes before" },
                { value: "15", label: "15 minutes before" },
              ]}
            />
            <SelectField
              label="Max Concurrent Sessions"
              value={sess.concurrentSessions}
              onChange={(v) => set("concurrentSessions", v)}
              sub="Limit simultaneous logins from the same account"
              options={[
                { value: "1", label: "1 session (strict)" },
                { value: "2", label: "2 sessions" },
                { value: "5", label: "5 sessions" },
                { value: "0", label: "Unlimited" },
              ]}
            />
            <SelectField
              label="Remember This Device For"
              value={sess.rememberDevice}
              onChange={(v) => set("rememberDevice", v)}
              sub="Trusted devices skip full 2FA challenge within this period"
              options={[
                { value: "7", label: "7 days" },
                { value: "14", label: "14 days" },
                { value: "30", label: "30 days" },
                { value: "90", label: "90 days" },
                { value: "0", label: "Never" },
              ]}
            />
          </div>
        </SettingCard>

        <SettingCard
          title="Force Logout Triggers"
          icon={Lock}
          iconColor="text-orange-600"
          sub="Automatically terminate all sessions when these events occur"
        >
          <ToggleRow
            label="Password Change"
            sub="Invalidate all sessions when user changes password"
            on={sess.forceOnPasswordChange}
            onChange={() => toggle("forceOnPasswordChange")}
            badge={{
              text: "Recommended",
              cls: "bg-teal-50 border-teal-200 text-teal-700",
            }}
          />
          <ToggleRow
            label="Role / Permission Change"
            sub="Force re-login when user role is updated by admin"
            on={sess.forceOnRoleChange}
            onChange={() => toggle("forceOnRoleChange")}
          />
          <ToggleRow
            label="Security Policy Update"
            sub="Expire sessions when global security policy changes"
            on={sess.forceOnPolicyUpdate}
            onChange={() => toggle("forceOnPolicyUpdate")}
          />

          <div className="mt-4 border-t border-border pt-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Security Hardening
            </p>
            <ToggleRow
              label="Full Login Audit Trail"
              sub="Log every login, logout and session event"
              on={sess.loginAudit}
              onChange={() => toggle("loginAudit")}
            />
            <ToggleRow
              label="Trusted Device Registry"
              sub="Track and manage approved user devices"
              on={sess.deviceTrust}
              onChange={() => toggle("deviceTrust")}
            />
            <ToggleRow
              label="SSO Session Sync"
              sub="Sync session state with Azure AD / SAML IdP"
              on={sess.singleSignOn}
              onChange={() => toggle("singleSignOn")}
            />
            <ToggleRow
              label="Secure Cookie (HTTPS only)"
              sub="Session cookies sent only over HTTPS"
              on={sess.cookieSecure}
              onChange={() => toggle("cookieSecure")}
              badge={{
                text: "HIPAA",
                cls: "bg-violet-50 border-violet-200 text-violet-700",
              }}
            />
            <ToggleRow
              label="CSRF Protection"
              sub="Cross-site request forgery token validation"
              on={sess.csrfProtection}
              onChange={() => toggle("csrfProtection")}
            />
          </div>
        </SettingCard>
      </div>

      {/* Active session summary */}
      <SettingCard
        title="Current Active Sessions"
        icon={Monitor}
        iconColor="text-teal-600"
        sub="Overview of sessions active right now across all users"
      >
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            {
              label: "Active Sessions",
              value: "8",
              sub: "right now",
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Avg Duration",
              value: "2.4h",
              sub: "per session today",
              color: "text-teal-600",
              bg: "bg-teal-50",
            },
            {
              label: "New Devices",
              value: "1",
              sub: "awaiting trust",
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Timeout Events",
              value: "3",
              sub: "in last 24 hours",
              color: "text-slate-600",
              bg: "bg-slate-100",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`px-4 py-3 rounded-xl border border-border ${s.bg}`}
            >
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-[11px] font-semibold text-foreground">
                {s.label}
              </div>
              <div className="text-[9px] text-muted-foreground">{s.sub}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border border-red-200 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors whitespace-nowrap">
            <X className="w-3 h-3" />
            Terminate All Sessions
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground whitespace-nowrap">
            <ExternalLink className="w-3 h-3" />
            View Session Details
          </button>
        </div>
      </SettingCard>

      <SaveBar
        onSave={sv.save}
        onReset={sv.reset}
        saved={sv.saved}
        dirty={sv.dirty}
      />
    </div>
  );
}

/* ════════════════════════════════  SECTION: RETENTION  */
const RETENTION_ITEMS = [
  {
    key: "phi",
    label: "PHI / Patient Records",
    desc: "Clinical encounter data, demographics, diagnoses",
    min: 6,
    rec: 7,
    unit: "years",
    hipaa: true,
  },
  {
    key: "audit",
    label: "Audit Log Records",
    desc: "All system access and user action audit trails",
    min: 6,
    rec: 6,
    unit: "years",
    hipaa: true,
  },
  {
    key: "coding",
    label: "Coding Submissions",
    desc: "ICD/CPT code submissions and override history",
    min: 6,
    rec: 10,
    unit: "years",
    hipaa: false,
  },
  {
    key: "activity",
    label: "User Activity Logs",
    desc: "Login history, session data, user behavior",
    min: 1,
    rec: 2,
    unit: "years",
    hipaa: false,
  },
  {
    key: "export",
    label: "Export Audit Logs",
    desc: "Record of all data exports and report downloads",
    min: 1,
    rec: 2,
    unit: "years",
    hipaa: false,
  },
  {
    key: "syslog",
    label: "System / Error Logs",
    desc: "Application errors, performance and debug logs",
    min: 0,
    rec: 0.25,
    unit: "years",
    hipaa: false,
  },
  {
    key: "backup",
    label: "Database Backups",
    desc: "Full and incremental database backup snapshots",
    min: 0,
    rec: 0.25,
    unit: "years",
    hipaa: false,
  },
  {
    key: "softdelete",
    label: "Soft-Deleted Records",
    desc: "Deleted records held before permanent purge",
    min: 0,
    rec: 30 / 365,
    unit: "years",
    hipaa: false,
  },
];

function RetentionSection() {
  const sv = useSave();
  const [retention, setRetention] = useState<Record<string, number>>({
    phi: 7,
    audit: 6,
    coding: 10,
    activity: 2,
    export: 2,
    syslog: 0.25,
    backup: 0.25,
    softdelete: 30 / 365,
  });
  const [autoArchive, setAutoArchive] = useState(true);
  const [autoDelete, setAutoDelete] = useState(false);
  const [notifyBefore, setNotifyBefore] = useState("30");
  const MAX_YEARS = 10;

  const fmtYears = (y: number) =>
    y >= 1 ? `${y} yr${y > 1 ? "s" : ""}` : `${Math.round(y * 365)} days`;

  return (
    <div className="space-y-4">
      {/* Compliance badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          {
            label: "HIPAA §164.530(j) — 6yr min",
            color: "bg-blue-50 border-blue-200 text-blue-700",
            icon: ShieldCheck,
          },
          {
            label: "SOC 2 Type II — Audit trail required",
            color: "bg-violet-50 border-violet-200 text-violet-700",
            icon: Shield,
          },
          {
            label: "ISO 27001 — Retention documented",
            color: "bg-teal-50 border-teal-200 text-teal-700",
            icon: FileLock2,
          },
        ].map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold ${b.color}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {b.label}
            </div>
          );
        })}
      </div>

      {/* Retention table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-muted/5">
          <Database className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-xs font-black text-foreground">
              Data Retention Policies
            </p>
            <p className="text-[9px] text-muted-foreground">
              Configure how long each data category is retained before archival
              or purge
            </p>
          </div>
        </div>
        <div className="divide-y divide-border">
          {RETENTION_ITEMS.map((item) => {
            const val = retention[item.key];
            const pct = Math.min((val / MAX_YEARS) * 100, 100);
            const belowMin = val < item.min;
            return (
              <div
                key={item.key}
                className={`px-5 py-4 ${belowMin ? "bg-red-50/30" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-foreground">
                        {item.label}
                      </span>
                      {item.hipaa && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
                          HIPAA Required
                        </span>
                      )}
                      {belowMin && (
                        <span className="flex items-center gap-1 text-[8px] font-bold text-red-600">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Below minimum ({item.min}yr)
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      {item.desc}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${belowMin ? "bg-red-400" : pct >= 80 ? "bg-emerald-500" : "bg-blue-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {item.min > 0 && (
                        <div
                          className="relative"
                          style={{
                            left: `${(item.min / MAX_YEARS) * 100}%`,
                            position: "relative",
                            width: 0,
                          }}
                        >
                          {/* min marker visual is implicit from row color */}
                        </div>
                      )}
                      <span className="text-[10px] font-mono text-muted-foreground w-12 text-right">
                        {fmtYears(val)}
                      </span>
                    </div>
                    {item.rec > 0 && (
                      <p className="text-[8px] text-muted-foreground mt-0.5">
                        Min: {fmtYears(item.min)} · Recommended:{" "}
                        {fmtYears(item.rec)} · Max tracked:{" "}
                        {fmtYears(MAX_YEARS)}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 text-center">
                      Retain For
                    </label>
                    {item.unit === "years" && item.rec >= 1 ? (
                      <div className="relative">
                        <select
                          value={val}
                          onChange={(e) => {
                            setRetention((p) => ({
                              ...p,
                              [item.key]: Number(e.target.value),
                            }));
                            sv.markDirty();
                          }}
                          className={`px-2.5 py-1.5 text-[11px] border rounded-lg focus:outline-none appearance-none pr-6 font-bold ${belowMin ? "bg-red-50 border-red-300 text-red-700" : "bg-muted/30 border-border"}`}
                        >
                          {[0.25, 0.5, 1, 2, 3, 5, 6, 7, 10]
                            .filter((y) => y >= item.min || item.min === 0)
                            .map((y) => (
                              <option key={y} value={y}>
                                {fmtYears(y)}
                              </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          value={
                            val === 30 / 365
                              ? "30days"
                              : val === 60 / 365
                                ? "60days"
                                : "90days"
                          }
                          onChange={(e) => {
                            const v =
                              e.target.value === "30days"
                                ? 30 / 365
                                : e.target.value === "60days"
                                  ? 60 / 365
                                  : 90 / 365;
                            setRetention((p) => ({ ...p, [item.key]: v }));
                            sv.markDirty();
                          }}
                          className="px-2.5 py-1.5 text-[11px] bg-muted/30 border border-border rounded-lg focus:outline-none appearance-none pr-6 font-bold"
                        >
                          <option value="30days">30 days</option>
                          <option value="60days">60 days</option>
                          <option value="90days">90 days</option>
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SettingCard
          title="Archival & Purge Settings"
          icon={Archive}
          iconColor="text-amber-600"
        >
          <ToggleRow
            label="Auto-Archive on Expiry"
            sub="Move expired data to cold storage instead of deletion"
            on={autoArchive}
            onChange={() => {
              setAutoArchive((p) => !p);
              sv.markDirty();
            }}
            badge={{
              text: "Recommended",
              cls: "bg-teal-50 border-teal-200 text-teal-700",
            }}
          />
          <ToggleRow
            label="Auto-Delete on Expiry"
            sub="Permanently purge data after retention period ends"
            on={autoDelete}
            onChange={() => {
              setAutoDelete((p) => !p);
              sv.markDirty();
            }}
            badge={{
              text: "Use with caution",
              cls: "bg-orange-50 border-orange-200 text-orange-700",
            }}
          />
          <div className="mt-3">
            <SelectField
              label="Notify Admin Before Purge"
              value={notifyBefore}
              onChange={(v) => {
                setNotifyBefore(v);
                sv.markDirty();
              }}
              sub="Send email alert this many days before data is permanently deleted"
              options={[
                { value: "7", label: "7 days" },
                { value: "14", label: "14 days" },
                { value: "30", label: "30 days (recommended)" },
                { value: "60", label: "60 days" },
              ]}
            />
          </div>
          <InfoTip text="Auto-delete is irreversible and requires CISO approval to enable. Archive mode stores data in WORM-compliant cold storage for regulated retention." />
        </SettingCard>

        <SettingCard
          title="Data Subject Rights (DSAR)"
          icon={UserX}
          iconColor="text-red-500"
          sub="Right to Access and Right to Erasure controls"
        >
          <div className="space-y-3">
            {[
              {
                label: "Handle DSAR requests",
                sub: "Enable workflow for patient data access requests",
                on: true,
              },
              {
                label: "Right to Erasure (PHI)",
                sub: "Allow compliant deletion of non-required PHI records",
                on: false,
                badge: {
                  text: "Legal Review Required",
                  cls: "bg-red-50 border-red-200 text-red-700",
                },
              },
              {
                label: "DSAR Audit Trail",
                sub: "Log all data subject access and erasure requests",
                on: true,
              },
            ].map((r) => (
              <ToggleRow
                key={r.label}
                label={r.label}
                sub={r.sub}
                on={r.on}
                onChange={sv.markDirty}
                badge={r.badge}
              />
            ))}
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-[9px] text-muted-foreground leading-relaxed">
                HIPAA grants patients the right to access their PHI within 30
                days of request. The Right to Erasure applies only to
                non-legally-required data. Consult your compliance officer
                before enabling erasure.
              </p>
            </div>
          </div>
        </SettingCard>
      </div>

      <SaveBar
        onSave={sv.save}
        onReset={sv.reset}
        saved={sv.saved}
        dirty={sv.dirty}
      />
    </div>
  );
}

/* ════════════════════════════════  MAIN EXPORT  */
type SettingsNav =
  | "general"
  | "notifications"
  | "sla"
  | "coding"
  | "ai"
  | "integrations"
  | "export"
  | "session"
  | "retention";

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      {
        id: "general" as SettingsNav,
        label: "General Organization",
        icon: Building2,
      },
      {
        id: "notifications" as SettingsNav,
        label: "Notification Preferences",
        icon: Bell,
      },
    ],
  },
  {
    label: "Clinical Operations",
    items: [
      {
        id: "sla" as SettingsNav,
        label: "SLA Configuration",
        icon: AlarmClock,
      },
      {
        id: "coding" as SettingsNav,
        label: "Coding Standards",
        icon: BookOpen,
      },
    ],
  },
  {
    label: "AI Configuration",
    items: [
      {
        id: "ai" as SettingsNav,
        label: "AI Behavior",
        icon: Brain,
        badge: "v2.4.1",
      },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      {
        id: "integrations" as SettingsNav,
        label: "Integrations & API",
        icon: Plug,
        badge: "3 connected",
      },
      { id: "export" as SettingsNav, label: "Export Settings", icon: Download },
      { id: "session" as SettingsNav, label: "Session Control", icon: Lock },
      {
        id: "retention" as SettingsNav,
        label: "Data Retention",
        icon: Database,
        badge: "HIPAA",
      },
    ],
  },
];

export function SystemSettings() {
  const [nav, setNav] = useState<SettingsNav>("general");

  const currentItem = NAV_GROUPS.flatMap((g) => g.items).find(
    (i) => i.id === nav,
  );

  return (
    <div className="flex gap-5 min-h-full">
      {/* Sidebar Nav */}
      <aside className="w-56 flex-shrink-0">
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm sticky top-0">
          <div className="px-4 py-3.5 border-b border-border bg-muted/5">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              <span className="text-xs font-black text-foreground">
                System Settings
              </span>
            </div>
          </div>
          <nav className="p-2 space-y-3">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-2 py-1">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = nav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setNav(item.id)}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all ${active ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-[11px] font-semibold flex-1 leading-tight">
                        {item.label}
                      </span>
                      {(item as any).badge && (
                        <span
                          className={`text-[8px] font-bold px-1 py-0.5 rounded-full flex-shrink-0 ${active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}
                        >
                          {(item as any).badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="px-4 py-3 border-t border-border bg-muted/5">
            <p className="text-[9px] text-muted-foreground leading-relaxed">
              Changes are saved per section. Unsaved changes show a warning
              indicator.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-5">
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight">
              {currentItem?.label}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Settings className="w-3 h-3" />
              System Settings
              <ChevronRight className="w-3 h-3" />
              {currentItem?.label}
            </p>
          </div>
        </div>

        {nav === "general" && <GeneralSection />}
        {nav === "notifications" && <NotificationsSection />}
        {nav === "sla" && <SLASection />}
        {nav === "coding" && <CodingSection />}
        {nav === "ai" && <AISection />}
        {nav === "integrations" && <IntegrationsSection />}
        {nav === "export" && <ExportSection />}
        {nav === "session" && <SessionSection />}
        {nav === "retention" && <RetentionSection />}
      </div>
    </div>
  );
}
