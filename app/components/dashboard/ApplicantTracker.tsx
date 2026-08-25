"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, RefreshCw, Users, Download, Copy, Check } from "lucide-react";
import ApplicantDrawer from "./ApplicantDrawer";
import {
  listApplications,
  listPipelines,
  setPipelineStage,
  setPublicStage,
  type Application,
  type ApplicationPipeline,
} from "../../lib/applications";
import {
  APPLICATION_QUESTIONS,
  PIPELINE_STAGES,
  DEFAULT_STAGE,
  stageLabel,
  type PipelineStage,
  type PublicStage,
} from "../../lib/recruitment";
import { downloadCsv, downloadXlsx, type ExportRow } from "../../lib/exportRows";

interface Props {
  cycle: string;
  reviewerEmail: string;
  reviewerName: string;
}

type LoadState = "loading" | "ready" | "error";
type StageFilter = PipelineStage | "all" | "unreviewed";

const selectClass =
  "bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--columbia-blue-light)]";

function formatDate(value: Application["submittedAt"]): string {
  if (!value) return "—";
  return value.toDate().toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ApplicantTracker({ cycle, reviewerEmail, reviewerName }: Props) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [pipelines, setPipelines] = useState<Map<string, ApplicationPipeline>>(new Map());
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [reloadCount, setReloadCount] = useState(0);

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const reload = () => {
    setLoadState("loading");
    setReloadCount((n) => n + 1);
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([listApplications(cycle), listPipelines(cycle)])
      .then(([apps, pipes]) => {
        if (cancelled) return;
        setApplications(apps);
        setPipelines(pipes);
        setLoadState("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Could not load applications", err);
        setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [cycle, reloadCount]);

  const stageOf = useCallback(
    (appId: string): PipelineStage => pipelines.get(appId)?.stage ?? DEFAULT_STAGE,
    [pipelines]
  );

  const handleStageChange = useCallback(
    async (app: Application, stage: PipelineStage) => {
      // Optimistic: the tracker is used in fast triage passes, and waiting on a
      // long-polled round trip per row would make it feel broken.
      setPipelines((prev) => {
        const next = new Map(prev);
        const current = next.get(app.id);
        next.set(app.id, {
          appId: app.id,
          cycle: app.cycle,
          stage,
          reviewCount: current?.reviewCount ?? 0,
          averageScore: current?.averageScore ?? null,
        });
        return next;
      });
      try {
        await setPipelineStage(app.id, app.cycle, stage, reviewerEmail);
      } catch (err) {
        console.error("Could not update stage", err);
        reload();
      }
    },
    [reviewerEmail]
  );

  const handlePublicStageChange = useCallback(async (app: Application, stage: PublicStage) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, publicStage: stage } : a))
    );
    try {
      await setPublicStage(app.id, stage);
    } catch (err) {
      console.error("Could not update visible status", err);
      reload();
    }
  }, []);

  const handleSummaryChange = useCallback(
    (appId: string, reviewCount: number, averageScore: number | null) => {
      setPipelines((prev) => {
        const next = new Map(prev);
        const current = next.get(appId);
        if (!current) return prev;
        next.set(appId, { ...current, reviewCount, averageScore });
        return next;
      });
    },
    []
  );

  const [copied, setCopied] = useState(false);

  const buildExportRows = useCallback(
    (rows: Application[]): ExportRow[] =>
      rows.map((app) => {
        const pipeline = pipelines.get(app.id);
        const base: ExportRow = {
          Name: app.name,
          Email: app.email,
          Pronouns: app.pronouns,
          Phone: app.phone,
          School: app.school,
          "Grad Year": app.gradYear,
          Major: app.major,
          "Applying For": app.positions.join("; "),
          LinkedIn: app.linkedIn,
          Resume: app.resumeLink,
          Stage: stageLabel(pipeline?.stage ?? DEFAULT_STAGE),
          Reviews: pipeline?.reviewCount ?? 0,
          "Avg Score": pipeline?.averageScore ?? "",
          Submitted: app.submittedAt ? app.submittedAt.toDate().toISOString().slice(0, 10) : "",
        };
        // Full answers included: the point of exporting is usually to read them
        // side by side during a deliberation meeting.
        for (const q of APPLICATION_QUESTIONS) {
          base[q.label] = app.responses[q.id] ?? "";
        }
        return base;
      }),
    [pipelines]
  );

  const allPositions = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => a.positions.forEach((p) => set.add(p)));
    return Array.from(set).sort();
  }, [applications]);

  const counts = useMemo(() => {
    const byStage = new Map<string, number>();
    let unreviewed = 0;
    for (const app of applications) {
      const stage = stageOf(app.id);
      byStage.set(stage, (byStage.get(stage) ?? 0) + 1);
      if ((pipelines.get(app.id)?.reviewCount ?? 0) === 0) unreviewed += 1;
    }
    return { byStage, unreviewed };
  }, [applications, pipelines, stageOf]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return applications.filter((app) => {
      if (stageFilter === "unreviewed") {
        if ((pipelines.get(app.id)?.reviewCount ?? 0) > 0) return false;
      } else if (stageFilter !== "all" && stageOf(app.id) !== stageFilter) {
        return false;
      }
      if (positionFilter !== "all" && !app.positions.includes(positionFilter)) return false;
      if (term) {
        const haystack = `${app.name} ${app.email} ${app.major} ${app.school}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [applications, pipelines, search, stageFilter, positionFilter, stageOf]);

  // Exports and the mail list follow the current filters rather than the whole
  // cycle: the board almost always wants "the people I'm looking at right now".
  const exportName = `gsbs-applications-${cycle}`;

  const handleCopyEmails = async () => {
    try {
      await navigator.clipboard.writeText(visible.map((a) => a.email).join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard write failed", err);
    }
  };

  const selected = applications.find((a) => a.id === selectedId) ?? null;

  if (loadState === "loading") {
    return (
      <div className="glass-panel p-6 rounded-xl">
        <p className="text-[var(--accent-grey)] text-sm">Loading applications…</p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="glass-panel p-6 rounded-xl">
        <p className="text-[var(--foreground)] text-sm mb-1">Couldn&apos;t load applications.</p>
        <p className="text-[var(--accent-grey)] text-sm mb-4">
          This is usually a slow connection. If it keeps failing, the cycle&apos;s indexes may
          not be deployed yet.
        </p>
        <button
          onClick={reload}
          className="text-sm px-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-[var(--foreground)] transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="glass-panel p-6 rounded-xl">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="font-serif text-2xl text-[var(--foreground)]">Applications</h3>
            <p className="text-[var(--accent-grey)] text-sm mt-1">
              {applications.length} submitted · {counts.unreviewed} not yet reviewed
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopyEmails}
              disabled={visible.length === 0}
              title="Copy the filtered applicants' emails for a BCC line"
              className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-[var(--accent-grey)] hover:text-[var(--foreground)] transition-colors disabled:opacity-40"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : `Copy ${visible.length} email${visible.length === 1 ? "" : "s"}`}
            </button>
            <button
              onClick={() => downloadCsv(buildExportRows(visible), `${exportName}.csv`)}
              disabled={visible.length === 0}
              className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-[var(--accent-grey)] hover:text-[var(--foreground)] transition-colors disabled:opacity-40"
            >
              <Download size={13} /> CSV
            </button>
            <button
              onClick={() => downloadXlsx(buildExportRows(visible), "Applications", `${exportName}.xlsx`)}
              disabled={visible.length === 0}
              className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-[var(--accent-grey)] hover:text-[var(--foreground)] transition-colors disabled:opacity-40"
            >
              <Download size={13} /> Excel
            </button>
            <button
              onClick={reload}
              className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-[var(--accent-grey)] hover:text-[var(--foreground)] transition-colors"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        {/* ── Filters ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <button
            onClick={() => setStageFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              stageFilter === "all"
                ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)]"
                : "border-black/10 dark:border-white/10 text-[var(--accent-grey)] hover:text-[var(--foreground)]"
            }`}
          >
            All {applications.length}
          </button>

          {PIPELINE_STAGES.map((s) => {
            const count = counts.byStage.get(s.id) ?? 0;
            if (count === 0 && stageFilter !== s.id) return null;
            return (
              <button
                key={s.id}
                onClick={() => setStageFilter(s.id)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  stageFilter === s.id
                    ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)]"
                    : "border-black/10 dark:border-white/10 text-[var(--accent-grey)] hover:text-[var(--foreground)]"
                }`}
              >
                {s.label} {count}
              </button>
            );
          })}

          <button
            onClick={() => setStageFilter("unreviewed")}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              stageFilter === "unreviewed"
                ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)]"
                : "border-black/10 dark:border-white/10 text-[var(--accent-grey)] hover:text-[var(--foreground)]"
            }`}
          >
            Needs review {counts.unreviewed}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-grey)]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, major…"
              aria-label="Search applications"
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--accent-grey)]/60 focus:outline-none focus:border-[var(--columbia-blue-light)]"
            />
          </div>
          {allPositions.length > 0 && (
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              aria-label="Filter by position"
              className={selectClass}
            >
              <option value="all">All positions</option>
              {allPositions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          )}
        </div>

        {/* ── Table ───────────────────────────────────────────────── */}
        {applications.length === 0 ? (
          <div className="text-center py-16">
            <Users size={28} className="mx-auto text-[var(--accent-grey)] mb-3" />
            <p className="text-[var(--foreground)] text-sm mb-1">No applications yet.</p>
            <p className="text-[var(--accent-grey)] text-sm">
              They&apos;ll appear here as students submit for {cycle.replace("-", " ")}.
            </p>
          </div>
        ) : visible.length === 0 ? (
          <p className="text-[var(--accent-grey)] text-sm py-10 text-center">
            No applications match these filters.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.15em] text-[var(--accent-grey)]">
                  <th className="font-semibold pb-3 pr-4">Applicant</th>
                  <th className="font-semibold pb-3 pr-4 hidden md:table-cell">School</th>
                  <th className="font-semibold pb-3 pr-4 hidden lg:table-cell">Applying for</th>
                  <th className="font-semibold pb-3 pr-4">Stage</th>
                  <th className="font-semibold pb-3 pr-4 whitespace-nowrap">Reviews</th>
                  <th className="font-semibold pb-3 whitespace-nowrap hidden sm:table-cell">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((app) => {
                  const pipeline = pipelines.get(app.id);
                  return (
                    <tr
                      key={app.id}
                      className="border-t border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => setSelectedId(app.id)}
                          className="text-left group"
                        >
                          <span className="block text-[var(--foreground)] group-hover:text-[var(--columbia-blue-light)] transition-colors">
                            {app.name || app.email}
                          </span>
                          <span className="block text-[var(--accent-grey)] text-xs">{app.email}</span>
                        </button>
                      </td>
                      <td className="py-3 pr-4 text-[var(--accent-grey)] hidden md:table-cell whitespace-nowrap">
                        {app.school || "—"}
                        {app.gradYear ? ` ’${app.gradYear.slice(2)}` : ""}
                      </td>
                      <td className="py-3 pr-4 text-[var(--accent-grey)] hidden lg:table-cell">
                        {app.positions.join(", ") || "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <select
                          value={stageOf(app.id)}
                          onChange={(e) => handleStageChange(app, e.target.value as PipelineStage)}
                          aria-label={`Stage for ${app.name || app.email}`}
                          className={selectClass}
                        >
                          {PIPELINE_STAGES.map((s) => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 pr-4 text-[var(--accent-grey)] whitespace-nowrap">
                        {pipeline?.reviewCount
                          ? `${pipeline.reviewCount}${pipeline.averageScore ? ` · ${pipeline.averageScore}/5` : ""}`
                          : "—"}
                      </td>
                      <td className="py-3 text-[var(--accent-grey)] whitespace-nowrap hidden sm:table-cell">
                        {formatDate(app.submittedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <ApplicantDrawer
          key={selected.id}
          application={selected}
          pipeline={pipelines.get(selected.id) ?? null}
          reviewerEmail={reviewerEmail}
          reviewerName={reviewerName}
          onClose={() => setSelectedId(null)}
          onStageChange={(stage) => handleStageChange(selected, stage)}
          onPublicStageChange={(stage) => handlePublicStageChange(selected, stage)}
          onSummaryChange={(count, avg) => handleSummaryChange(selected.id, count, avg)}
        />
      )}
    </>
  );
}
