"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink, AlertTriangle, Loader2 } from "lucide-react";
import {
  listReviews,
  saveReview,
  updateReviewSummary,
  publicStageOf,
  type Application,
  type ApplicationPipeline,
  type ApplicationReview,
} from "../../lib/applications";
import {
  APPLICATION_QUESTIONS,
  PIPELINE_STAGES,
  PUBLIC_STAGES,
  DEFAULT_STAGE,
  isTerminalStage,
  type PipelineStage,
  type PublicStage,
} from "../../lib/recruitment";

interface Props {
  application: Application;
  pipeline: ApplicationPipeline | null;
  reviewerEmail: string;
  reviewerName: string;
  onClose: () => void;
  onStageChange: (stage: PipelineStage) => void;
  onPublicStageChange: (stage: PublicStage) => void;
  onSummaryChange: (reviewCount: number, averageScore: number | null) => void;
}

const SCORES = [1, 2, 3, 4, 5];
const RECOMMENDATIONS: { id: ApplicationReview["recommendation"]; label: string }[] = [
  { id: "yes", label: "Yes" },
  { id: "maybe", label: "Maybe" },
  { id: "no", label: "No" },
];

const selectClass =
  "bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--columbia-blue-light)]";

export default function ApplicantDrawer({
  application,
  pipeline,
  reviewerEmail,
  reviewerName,
  onClose,
  onStageChange,
  onPublicStageChange,
  onSummaryChange,
}: Props) {
  const [reviews, setReviews] = useState<ApplicationReview[]>([]);
  const [reviewsState, setReviewsState] = useState<"loading" | "ready" | "error">("loading");

  const [score, setScore] = useState(0);
  const [recommendation, setRecommendation] =
    useState<ApplicationReview["recommendation"]>("maybe");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Mounted fresh per applicant (keyed by id upstream), so the initial state is
  // already correct and nothing needs resetting on the way in.
  useEffect(() => {
    let cancelled = false;
    listReviews(application.id)
      .then((loaded) => {
        if (cancelled) return;
        setReviews(loaded);
        setReviewsState("ready");
        const mine = loaded.find((r) => r.reviewerEmail === reviewerEmail);
        if (mine) {
          setScore(mine.score);
          setRecommendation(mine.recommendation);
          setNotes(mine.notes);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Could not load reviews", err);
        setReviewsState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [application.id, reviewerEmail]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSaveReview = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await saveReview(application.id, {
        reviewerEmail,
        reviewerName,
        score,
        recommendation,
        notes,
      });
      const fresh = await listReviews(application.id);
      setReviews(fresh);
      await updateReviewSummary(application.id, application.cycle, fresh);
      const scored = fresh.filter((r) => r.score > 0);
      onSummaryChange(
        fresh.length,
        scored.length
          ? Math.round((scored.reduce((s, r) => s + r.score, 0) / scored.length) * 10) / 10
          : null
      );
    } catch (err) {
      console.error("Could not save review", err);
      setSaveError("Couldn't save your review. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const stage = pipeline?.stage ?? DEFAULT_STAGE;
  const publicStage = publicStageOf(application);
  // Someone marked done internally but still showing "under review" to the
  // applicant is the thing most likely to go wrong while running a cycle.
  const undisclosedDecision = isTerminalStage(stage) && publicStage !== "decided";

  // Portalled to <body> on purpose. Any transformed ancestor becomes the
  // containing block for position:fixed — which would pin this panel inside the
  // card instead of over the viewport. Rendering outside the tracker's subtree
  // keeps that from depending on how the page above it is styled.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Application from ${application.name}`}
        className="relative w-full max-w-2xl h-full overflow-y-auto bg-[var(--background)] border-l border-black/10 dark:border-white/10 shadow-2xl"
      >
        <header className="sticky top-0 z-10 bg-[var(--background)]/95 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-8 py-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl text-[var(--foreground)]">{application.name}</h2>
            <p className="text-[var(--accent-grey)] text-sm mt-1">
              {application.email}
              {application.pronouns ? ` · ${application.pronouns}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg text-[var(--accent-grey)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </header>

        <div className="px-8 py-8 space-y-10">
          {/* ── Decision controls ─────────────────────────────────── */}
          <section className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-grey)]">
                  Pipeline stage
                </label>
                <select
                  value={stage}
                  onChange={(e) => onStageChange(e.target.value as PipelineStage)}
                  className={`${selectClass} w-full`}
                >
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                <p className="text-[var(--accent-grey)] text-xs">Internal. The applicant never sees this.</p>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-grey)]">
                  What the applicant sees
                </label>
                <select
                  value={publicStage}
                  onChange={(e) => onPublicStageChange(e.target.value as PublicStage)}
                  className={`${selectClass} w-full`}
                >
                  {PUBLIC_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                <p className="text-[var(--accent-grey)] text-xs">Changes their status page immediately.</p>
              </div>
            </div>

            {undisclosedDecision && (
              <p className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                Decided internally, but this applicant hasn&apos;t been told. Send your email,
                then set their visible status to &ldquo;Decision sent&rdquo;.
              </p>
            )}
          </section>

          {/* ── Details ───────────────────────────────────────────── */}
          <section className="space-y-4">
            <h3 className="font-serif text-lg text-[var(--foreground)]">Details</h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-[var(--accent-grey)] text-xs mb-1">School</dt>
                <dd className="text-[var(--foreground)]">{application.school || "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--accent-grey)] text-xs mb-1">Graduation</dt>
                <dd className="text-[var(--foreground)]">{application.gradYear || "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--accent-grey)] text-xs mb-1">Major</dt>
                <dd className="text-[var(--foreground)]">{application.major || "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--accent-grey)] text-xs mb-1">Phone</dt>
                <dd className="text-[var(--foreground)]">{application.phone || "—"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[var(--accent-grey)] text-xs mb-1">Applying for</dt>
                <dd className="flex flex-wrap gap-2 mt-1">
                  {application.positions.length ? (
                    application.positions.map((p) => (
                      <span
                        key={p}
                        className="px-2.5 py-1 rounded-full text-xs bg-[var(--columbia-blue-light)]/15 text-[var(--foreground)] border border-[var(--columbia-blue-light)]/30"
                      >
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-[var(--foreground)]">—</span>
                  )}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-3 pt-2">
              {application.resumeLink && (
                <a
                  href={application.resumeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-[var(--foreground)] transition-colors"
                >
                  Resume <ExternalLink size={13} />
                </a>
              )}
              {application.linkedIn && (
                <a
                  href={application.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-[var(--foreground)] transition-colors"
                >
                  LinkedIn <ExternalLink size={13} />
                </a>
              )}
            </div>
          </section>

          {/* ── Answers ───────────────────────────────────────────── */}
          <section className="space-y-6">
            <h3 className="font-serif text-lg text-[var(--foreground)]">Answers</h3>
            {APPLICATION_QUESTIONS.map((q) => (
              <div key={q.id} className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-grey)]">
                  {q.label}
                </p>
                <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                  {application.responses[q.id]?.trim() || (
                    <span className="text-[var(--accent-grey)] italic">No answer</span>
                  )}
                </p>
              </div>
            ))}
          </section>

          {/* ── Your review ───────────────────────────────────────── */}
          <section className="space-y-5 pt-6 border-t border-black/5 dark:border-white/5">
            <div>
              <h3 className="font-serif text-lg text-[var(--foreground)]">Your review</h3>
              <p className="text-[var(--accent-grey)] text-xs mt-1">
                Visible to the board only — never to the applicant.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-2">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-grey)]">Score</span>
                <div className="flex gap-1.5">
                  {SCORES.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setScore(n)}
                      aria-pressed={score === n}
                      className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                        score === n
                          ? "bg-[var(--columbia-blue-light)] border-[var(--columbia-blue-light)] text-black"
                          : "border-black/10 dark:border-white/10 text-[var(--accent-grey)] hover:border-black/25 dark:hover:border-white/25"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-grey)]">Advance?</span>
                <div className="flex gap-1.5">
                  {RECOMMENDATIONS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRecommendation(r.id)}
                      aria-pressed={recommendation === r.id}
                      className={`px-4 h-9 rounded-lg text-sm font-medium border transition-colors ${
                        recommendation === r.id
                          ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)]"
                          : "border-black/10 dark:border-white/10 text-[var(--accent-grey)] hover:border-black/25 dark:hover:border-white/25"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What stood out? What would you want to ask them?"
              className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--accent-grey)]/50 focus:outline-none focus:border-[var(--columbia-blue-light)] resize-y"
            />

            {saveError && (
              <p role="alert" className="text-red-600 dark:text-red-400 text-sm">{saveError}</p>
            )}

            <button
              onClick={handleSaveReview}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[var(--foreground)] text-[var(--background)] font-semibold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Saving…" : "Save review"}
            </button>
          </section>

          {/* ── Other reviews ─────────────────────────────────────── */}
          <section className="space-y-4 pt-6 border-t border-black/5 dark:border-white/5">
            <h3 className="font-serif text-lg text-[var(--foreground)]">Board reviews</h3>

            {reviewsState === "loading" && (
              <p className="text-[var(--accent-grey)] text-sm">Loading reviews…</p>
            )}
            {reviewsState === "error" && (
              <p className="text-red-600 dark:text-red-400 text-sm">Couldn&apos;t load reviews.</p>
            )}
            {reviewsState === "ready" && reviews.length === 0 && (
              <p className="text-[var(--accent-grey)] text-sm">No reviews yet.</p>
            )}

            {reviews.map((r) => (
              <div
                key={r.reviewerEmail}
                className="rounded-xl border border-black/10 dark:border-white/10 p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-[var(--foreground)]">
                    {r.reviewerName}
                    {r.reviewerEmail === reviewerEmail && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-[var(--columbia-blue-light)]">You</span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--accent-grey)]">
                    {r.score > 0 ? `${r.score}/5` : "no score"} · {r.recommendation}
                  </p>
                </div>
                {r.notes && (
                  <p className="text-sm text-[var(--accent-grey)] leading-relaxed whitespace-pre-wrap">
                    {r.notes}
                  </p>
                )}
              </div>
            ))}
          </section>
        </div>
      </aside>
    </div>,
    document.body
  );
}
