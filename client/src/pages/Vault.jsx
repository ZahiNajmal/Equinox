// client/src/pages/Vault.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../utils/api";

/**
 * Vault: user progress hub.
 * This file is intentionally organized as:
 * 1) Constants
 * 2) Pure helpers
 * 3) Small presentational components
 * 4) Page component
 */

// -----------------------------
// Constants
// -----------------------------

const ROUTE_LABELS = {
  "/": "Dashboard",
  "/atlas": "Atlas Page",
  "/mentor": "Mentor Page",
  "/prisma": "Prisma Page",
  "/insight": "Insight Page",
  "/codex": "Codex Page",
  "/sdg": "SDG Page",
  "/quiz": "Quiz Page",
  "/vault": "Vault Page",
};

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const PAGE_SHELL_CLASSNAME =
  "min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 sm:py-16 px-4 sm:px-6";

const CARD_CLASSNAME = "bg-white rounded-3xl shadow-2xl p-6 sm:p-10";

// Vibrant SDG color map for visual enhancement in the PDF visualization & reflections
const SDG_COLORS = [
  "#E5243B", // 1
  "#DDA63A", // 2
  "#4C9F38", // 3
  "#C5192D", // 4
  "#FF3A21", // 5
  "#26BDE2", // 6
  "#FCC30B", // 7
  "#A21942", // 8
  "#FD6925", // 9
  "#DD1367", // 10
  "#FD9D24", // 11
  "#BF8B2E", // 12
  "#3F7E44", // 13
  "#0A97D9", // 14
  "#56C02B", // 15
  "#00689D", // 16
  "#19486A", // 17
];

// -----------------------------
// Pure helpers
// -----------------------------

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizePathname(pathname) {
  if (!pathname) return "";

  // Remove query/hash + trailing slash
  const raw = pathname.split("?")[0].split("#")[0];
  return raw.length > 1 ? raw.replace(/\/$/, "") : raw;
}

function prettyRoute(pathname) {
  const normalized = normalizePathname(pathname);
  if (!normalized) return "";

  // Exact match first
  if (ROUTE_LABELS[normalized]) return ROUTE_LABELS[normalized];

  // Fallback: turn "/some-page" into "Some Page"
  const asWords = normalized
    .replace(/^\//, "")
    .split("/")
    .filter(Boolean)
    .map((seg) => seg.replace(/[-_]+/g, " "))
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
    .join(" / ");

  return asWords ? `${asWords} Page` : "Page";
}

function formatDate(value) {
  if (!value) return "";

  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : DATE_FORMATTER.format(d);
}

function formatActivityRow(activity) {
  const type = (activity?.type || "").toString();

  if (type.startsWith("interaction.pageview:")) {
    const pathname = type.replace("interaction.pageview:", "");
    return { title: `Visited ${prettyRoute(pathname)}`, detail: pathname };
  }

  // Backwards compatible: old descriptions like "Visited /prisma"
  const desc = (activity?.description || "").toString();
  if (desc.toLowerCase().startsWith("visited /")) {
    const pathname = desc.slice("Visited ".length);
    return { title: `Visited ${prettyRoute(pathname)}`, detail: pathname };
  }

  return {
    title: desc || "Completed activity",
    detail: type || "",
  };
}

function downloadBlobAsFile(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// --- Helper for improved SDG reflection block for visual/PDF ---
function getSDGColor(sdgId) {
  return SDG_COLORS[(Number(sdgId) - 1) % SDG_COLORS.length] || "#888";
}

// -----------------------------
// Presentational components
// -----------------------------

function Card({ className, children }) {
  return (
    <section className={cx(CARD_CLASSNAME, "relative overflow-hidden", className)}>
      {children}
    </section>
  );
}

function SectionHeader({ title, right }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight flex-1 min-w-[10rem]">
        {title}
      </h2>
      <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto sm:justify-end">
        {right}
      </div>
    </div>
  );
}

function GradientButton({ className, disabled, children, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cx(
        "shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 sm:px-6 py-3 rounded-xl text-sm sm:text-base font-bold transition",
        disabled ? "opacity-60 cursor-not-allowed" : "hover:scale-105",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function EmptyState({ children }) {
  return <p className="text-xl text-gray-600">{children}</p>;
}

function ActivityItem({ activity }) {
  const row = useMemo(() => formatActivityRow(activity), [activity]);

  return (
    <li
      className="bg-gray-50 border border-gray-100 p-4 sm:p-5 rounded-2xl"
      key={activity.id || `${activity.type}:${activity.date}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 text-base sm:text-lg break-words">
            {row.title}
          </div>
          <div className="mt-1 text-xs sm:text-sm text-gray-500">{formatDate(activity.date)}</div>
        </div>

        <div className="shrink-0">
          <span className="inline-flex items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold px-3 py-1 text-xs sm:text-sm">
            +{activity.xp || 0} XP
          </span>
        </div>
      </div>
    </li>
  );
}

const ACTIVITY_FILTERS = [
  { id: "all", label: "All" },
  { id: "pages", label: "Pages only" },
  { id: "quizzes", label: "Quizzes" },
  { id: "reflections", label: "SDG Reflections" },
];

// VISUAL UPGRADE: Modern, visually-aligned SDG Reflection Item
function ReflectionItem({ reflection }) {
  const color = getSDGColor(reflection.sdg_id);
  return (
    <li
      className="bg-gradient-to-br from-white to-purple-50 border border-gray-100 p-5 sm:p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-center gap-5 transition-all"
      key={reflection.id}
    >
      {/* Colored SDG circle badge and label */}
      <div
        className="flex flex-col items-center min-w-[60px]"
        style={{ flexShrink: 0 }}
      >
        <span
          className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg text-white shadow-lg mb-2 border-4"
          style={{
            background: color,
            borderColor: color,
            boxShadow: `0 4px 20px 0 ${color}33`,
            letterSpacing: 1,
          }}
        >
          {reflection.sdg_id}
        </span>
        <span
          className="uppercase text-xs font-bold tracking-wide"
          style={{
            color: color,
            textShadow: "0 1px 8px #ddd",
          }}
        >
          SDG
        </span>
      </div>

      {/* Main reflection content area */}
      <div className="flex-1 min-w-0 w-full">
        <div className="flex items-center mb-1 gap-3">
          <span
            className="font-bold text-base sm:text-lg text-purple-700"
            style={{ letterSpacing: ".03em" }}
          >
            Goal {reflection.sdg_id}
          </span>
          <span className="text-xs sm:text-sm text-gray-500">{formatDate(reflection.date)}</span>
        </div>
        <blockquote
          className="italic text-slate-700 text-[1.07rem] sm:text-lg leading-relaxed font-medium whitespace-pre-wrap border-l-4 pl-4 border-purple-200 bg-purple-50/30 rounded"
          style={{
            borderLeftColor: color,
          }}
        >
          {reflection.reflection}
        </blockquote>
      </div>
    </li>
  );
}

// -----------------------------
// Page
// -----------------------------

const INITIAL_DATA = { activity: [], badges: [], reflections: [] };

export default function Vault() {
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const downloadingRef = useRef(false);
  const [activityFilter, setActivityFilter] = useState("all");

  // ------- PDF Styling Patch for Modern SDG Reflection Layout -------
  // If user downloads, request custom format for SDG reflections
  const downloadProgressPdf = useCallback(async () => {
    // Avoid duplicate downloads even if the user double-clicks before state updates flush.
    if (downloadingRef.current) return;

    downloadingRef.current = true;
    setDownloading(true);

    try {
      // PATCH: Pass a query param for 'modern' SDG format in PDF
      // The backend can use this for better alignment/visual styling like the UI version.
      const res = await api.get(
        "/vault/export?sdgFormat=visual", // Backend can use this flag
        { responseType: "blob" }
      );
      const blob = new Blob([res.data], { type: "application/pdf" });
      const filename = `equinox-progress-${new Date().toISOString().slice(0, 10)}.pdf`;
      downloadBlobAsFile(blob, filename);
    } catch {
      // Non-fatal; API interceptor will handle auth failures.
    } finally {
      downloadingRef.current = false;
      setDownloading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await api.get("/user/progress");
        if (mounted) setData(res.data);
      } catch {
        // Non-fatal; empty UI will render.
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const rawActivity = data.activity || [];
  const activity = useMemo(() => {
    if (!rawActivity.length) return [];

    return rawActivity.filter((row) => {
      const type = (row?.type || "").toString();
      const desc = (row?.description || "").toString().toLowerCase();

      // Hide "Visited Dashboard" and generic "Stayed active in the app" rows.
      if (type === "interaction.activeMinute") return false;
      if (desc.includes("stayed active in the app")) return false;
      if (desc.includes("visited /") && desc.includes("/dashboard")) return false;

      if (activityFilter === "all") return true;
      if (activityFilter === "pages") {
        return type.startsWith("interaction.pageview:");
      }
      if (activityFilter === "quizzes") {
        return type.startsWith("interaction.quiz");
      }
      if (activityFilter === "reflections") {
        return type.startsWith("sdg.reflection:");
      }

      return true;
    });
  }, [rawActivity, activityFilter]);
  const reflections = data.reflections || [];

  return (
    <div className={PAGE_SHELL_CLASSNAME}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-10 sm:mb-12 break-words">
          Your Vault
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-12 items-start">
          <Card>
            <SectionHeader
              title="Activity History"
              right={
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
                  <select
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[7rem]"
                  >
                    {ACTIVITY_FILTERS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <GradientButton
                    onClick={downloadProgressPdf}
                    disabled={downloading}
                    aria-busy={downloading}
                    aria-label="Download progress PDF"
                  >
                    {downloading ? "Preparing PDF…" : "Download Progress PDF"}
                  </GradientButton>
                </div>
              }
            />

            {loading ? (
              <EmptyState>Loading…</EmptyState>
            ) : activity.length > 0 ? (
              <ul className="space-y-3">
                {activity.map((a) => (
                  <ActivityItem key={a.id || `${a.type}:${a.date}`} activity={a} />
                ))}
              </ul>
            ) : (
              <EmptyState>No activity yet. Start exploring!</EmptyState>
            )}
          </Card>

          <Card>
            <SectionHeader title="SDG Reflections" />

            {loading ? (
              <EmptyState>Loading…</EmptyState>
            ) : reflections.length > 0 ? (
              <ul className="space-y-4">
                {reflections.map((r) => (
                  <ReflectionItem key={r.id} reflection={r} />
                ))}
              </ul>
            ) : (
              <EmptyState>No reflections yet. Save one from the SDG page!</EmptyState>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
