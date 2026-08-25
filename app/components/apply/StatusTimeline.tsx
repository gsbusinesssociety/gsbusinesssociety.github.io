"use client";

import { Check } from "lucide-react";
import { PUBLIC_STAGES, type PublicStage } from "../../lib/recruitment";

/**
 * Shows only what the board has chosen to reveal. The internal pipeline stage
 * lives in a subcollection the applicant cannot read, so nothing here can leak a
 * decision before it has actually been sent.
 */
export default function StatusTimeline({ current }: { current: PublicStage }) {
  const currentIndex = PUBLIC_STAGES.findIndex((s) => s.id === current);

  return (
    <ol className="space-y-0">
      {PUBLIC_STAGES.map((stage, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isFuture = i > currentIndex;
        const isLast = i === PUBLIC_STAGES.length - 1;

        return (
          <li key={stage.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                aria-hidden="true"
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
                  isDone
                    ? "bg-[var(--columbia-blue-light)] border-[var(--columbia-blue-light)] text-black"
                    : isCurrent
                      ? "border-[var(--columbia-blue-light)] text-[var(--columbia-blue-light)]"
                      : "border-black/10 dark:border-white/10 text-[var(--accent-grey)]"
                }`}
              >
                {isDone ? <Check size={14} strokeWidth={3} /> : <span className="text-xs">{i + 1}</span>}
              </div>
              {!isLast && (
                <div
                  aria-hidden="true"
                  className={`w-px flex-1 min-h-[2.5rem] ${
                    isDone ? "bg-[var(--columbia-blue-light)]" : "bg-black/10 dark:bg-white/10"
                  }`}
                />
              )}
            </div>

            <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
              <p
                className={`text-[15px] font-medium ${
                  isFuture ? "text-[var(--accent-grey)]" : "text-[var(--foreground)]"
                }`}
              >
                {stage.label}
                {isCurrent && (
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--columbia-blue-light)]">
                    Now
                  </span>
                )}
              </p>
              <p className="text-[var(--accent-grey)] text-[13px] leading-relaxed mt-1">
                {stage.hint}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
