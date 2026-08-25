"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  APPLICATION_QUESTIONS,
  SCHOOLS,
  gradYearOptions,
} from "../../lib/recruitment";
import type { ApplicationDraft } from "../../lib/applications";

const AUTOSAVE_DELAY_MS = 2000;

export type SaveState = "idle" | "saving" | "saved" | "error";

interface Props {
  email: string;
  positions: string[];
  initial: ApplicationDraft;
  saveState: SaveState;
  lastSavedAt: Date | null;
  submitting: boolean;
  submitError: string | null;
  onSaveDraft: (draft: ApplicationDraft) => void;
  onSubmit: (draft: ApplicationDraft) => void;
}

type FieldErrors = Record<string, string>;

function isUsableUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validate(draft: ApplicationDraft): FieldErrors {
  const errors: FieldErrors = {};

  if (!draft.name.trim()) errors.name = "Please tell us your name.";
  if (!draft.school) errors.school = "Please select your school.";
  if (!draft.gradYear) errors.gradYear = "Please select your graduation year.";
  if (!draft.major.trim()) errors.major = "Please tell us your major or intended major.";
  if (draft.positions.length === 0) errors.positions = "Select at least one position.";

  if (!draft.resumeLink.trim()) {
    errors.resumeLink = "A resume link is required.";
  } else if (!isUsableUrl(draft.resumeLink.trim())) {
    errors.resumeLink = "Enter a full link starting with https://";
  }

  if (draft.linkedIn.trim() && !isUsableUrl(draft.linkedIn.trim())) {
    errors.linkedIn = "Enter a full link starting with https://";
  }

  for (const question of APPLICATION_QUESTIONS) {
    const answer = (draft.responses[question.id] ?? "").trim();
    if (question.required && !answer) {
      errors[`responses.${question.id}`] = "This question is required.";
    } else if (answer.length > question.maxLength) {
      errors[`responses.${question.id}`] =
        `Please keep this under ${question.maxLength} characters.`;
    }
  }

  return errors;
}

const labelClass =
  "block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-grey)]";
const inputClass =
  "w-full bg-transparent border-b border-black/10 dark:border-white/10 py-2 focus:outline-none focus:border-[var(--columbia-blue-light)] text-[var(--foreground)] text-sm placeholder:text-[var(--accent-grey)]/50 transition-colors disabled:opacity-60";
// Essay boxes get a real edge. An underline works for a one-line field, but on a
// five-row textarea it reads as empty page with nothing to click.
const textareaClass =
  "w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-[var(--foreground)] text-sm leading-relaxed placeholder:text-[var(--accent-grey)]/50 transition-colors resize-y";

export default function ApplicationForm({
  email,
  positions,
  initial,
  saveState,
  lastSavedAt,
  submitting,
  submitError,
  onSaveDraft,
  onSubmit,
}: Props) {
  const [draft, setDraft] = useState<ApplicationDraft>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [confirming, setConfirming] = useState(false);

  // Autosave should react to the user's edits, not to the initial hydration.
  const dirty = useRef(false);

  const update = useCallback(<K extends keyof ApplicationDraft>(
    key: K,
    value: ApplicationDraft[K]
  ) => {
    dirty.current = true;
    setConfirming(false);
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateResponse = useCallback((questionId: string, value: string) => {
    dirty.current = true;
    setConfirming(false);
    setDraft((prev) => ({
      ...prev,
      responses: { ...prev.responses, [questionId]: value },
    }));
  }, []);

  const togglePosition = useCallback((position: string) => {
    dirty.current = true;
    setConfirming(false);
    setDraft((prev) => ({
      ...prev,
      positions: prev.positions.includes(position)
        ? prev.positions.filter((p) => p !== position)
        : [...prev.positions, position],
    }));
  }, []);

  useEffect(() => {
    if (!dirty.current) return;
    const timer = setTimeout(() => onSaveDraft(draft), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [draft, onSaveDraft]);

  const gradYears = useMemo(() => gradYearOptions(), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(draft);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setConfirming(false);
      document
        .querySelector("[data-field-error]")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Submission is one-way, so it takes a second, deliberate confirmation.
    if (!confirming) {
      setConfirming(true);
      return;
    }
    onSubmit(draft);
  };

  const fieldError = (key: string) =>
    errors[key] ? (
      <p data-field-error className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs mt-2">
        <AlertCircle size={12} /> {errors[key]}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-14">
      {/* ── About you ─────────────────────────────────────────────── */}
      <section className="space-y-8">
        <h2 className="font-serif text-2xl text-[var(--foreground)]">About you</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label htmlFor="name" className={labelClass}>Full name*</label>
            <input
              id="name"
              value={draft.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Jane Doe"
              className={inputClass}
            />
            {fieldError("name")}
          </div>

          <div className="space-y-3">
            <label htmlFor="pronouns" className={labelClass}>Pronouns</label>
            <input
              id="pronouns"
              value={draft.pronouns}
              onChange={(e) => update("pronouns", e.target.value)}
              placeholder="they/them"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <span className={labelClass}>Columbia email</span>
            <p className="py-2 text-sm text-[var(--foreground)] border-b border-black/10 dark:border-white/10">
              {email}
            </p>
            <p className="text-[var(--accent-grey)] text-xs">
              Taken from the account you signed in with.
            </p>
          </div>

          <div className="space-y-3">
            <label htmlFor="phone" className={labelClass}>Phone</label>
            <input
              id="phone"
              type="tel"
              value={draft.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="(555) 123-4567"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <label htmlFor="school" className={labelClass}>School*</label>
            <select
              id="school"
              value={draft.school}
              onChange={(e) => update("school", e.target.value)}
              className={inputClass}
            >
              <option value="">Select…</option>
              {SCHOOLS.map((school) => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>
            {fieldError("school")}
          </div>

          <div className="space-y-3">
            <label htmlFor="gradYear" className={labelClass}>Graduation year*</label>
            <select
              id="gradYear"
              value={draft.gradYear}
              onChange={(e) => update("gradYear", e.target.value)}
              className={inputClass}
            >
              <option value="">Select…</option>
              {gradYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {fieldError("gradYear")}
          </div>

          <div className="space-y-3">
            <label htmlFor="major" className={labelClass}>Major*</label>
            <input
              id="major"
              value={draft.major}
              onChange={(e) => update("major", e.target.value)}
              placeholder="Economics"
              className={inputClass}
            />
            {fieldError("major")}
          </div>
        </div>
      </section>

      {/* ── Links ─────────────────────────────────────────────────── */}
      <section className="space-y-8">
        <h2 className="font-serif text-2xl text-[var(--foreground)]">Links</h2>

        <div className="space-y-3">
          <label htmlFor="resumeLink" className={labelClass}>Resume link*</label>
          <input
            id="resumeLink"
            type="url"
            value={draft.resumeLink}
            onChange={(e) => update("resumeLink", e.target.value)}
            placeholder="https://drive.google.com/file/d/..."
            className={inputClass}
          />
          <p className="text-[var(--accent-grey)] text-xs leading-relaxed">
            Google Drive, Dropbox or a personal site is fine — but please set sharing
            to <span className="text-[var(--foreground)]">anyone with the link can view</span>.
            We can&apos;t review a resume we can&apos;t open, and we may not be able to chase you for access.
          </p>
          {fieldError("resumeLink")}
        </div>

        <div className="space-y-3">
          <label htmlFor="linkedIn" className={labelClass}>LinkedIn</label>
          <input
            id="linkedIn"
            type="url"
            value={draft.linkedIn}
            onChange={(e) => update("linkedIn", e.target.value)}
            placeholder="https://linkedin.com/in/..."
            className={inputClass}
          />
          {fieldError("linkedIn")}
        </div>
      </section>

      {/* ── Positions ─────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl text-[var(--foreground)]">What are you applying for?</h2>
          <p className="text-[var(--accent-grey)] text-sm mt-2">Select all that interest you.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {positions.map((position) => {
            const selected = draft.positions.includes(position);
            return (
              <label
                key={position}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all text-sm ${
                  selected
                    ? "border-[var(--columbia-blue-light)] bg-[var(--columbia-blue-light)]/10 text-[var(--foreground)]"
                    : "border-black/10 dark:border-white/10 text-[var(--accent-grey)] hover:border-black/20 dark:hover:border-white/20"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => togglePosition(position)}
                  className="accent-[var(--columbia-blue)] w-4 h-4"
                />
                {position}
              </label>
            );
          })}
        </div>
        {fieldError("positions")}
      </section>

      {/* ── Questions ─────────────────────────────────────────────── */}
      <section className="space-y-10">
        <h2 className="font-serif text-2xl text-[var(--foreground)]">A few questions</h2>

        {APPLICATION_QUESTIONS.map((question) => {
          const value = draft.responses[question.id] ?? "";
          const over = value.length > question.maxLength;
          return (
            <div key={question.id} className="space-y-3">
              <label htmlFor={question.id} className={labelClass}>
                {question.label}
                {question.required ? "*" : ""}
              </label>
              {question.helper && (
                <p className="text-[var(--accent-grey)] text-xs leading-relaxed">{question.helper}</p>
              )}
              <textarea
                id={question.id}
                rows={5}
                value={value}
                onChange={(e) => updateResponse(question.id, e.target.value)}
                placeholder="Take as much space as you need."
                className={textareaClass}
              />
              <p
                className={`text-right text-xs ${
                  over ? "text-red-600 dark:text-red-400" : "text-[var(--accent-grey)]"
                }`}
              >
                {value.length} / {question.maxLength}
              </p>
              {fieldError(`responses.${question.id}`)}
            </div>
          );
        })}
      </section>

      {/* ── Submit ────────────────────────────────────────────────── */}
      <section className="space-y-5 pt-4 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between text-xs min-h-[1.25rem]">
          <span className="text-[var(--accent-grey)]">
            {saveState === "saving" && "Saving draft…"}
            {saveState === "saved" && lastSavedAt &&
              `Draft saved at ${lastSavedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`}
            {saveState === "idle" && "Your work saves automatically as a draft."}
          </span>
          {saveState === "error" && (
            <span className="text-red-600 dark:text-red-400">
              Couldn&apos;t save your draft — check your connection.
            </span>
          )}
        </div>

        {confirming && (
          <div className="rounded-xl border border-[var(--columbia-blue-light)]/40 bg-[var(--columbia-blue-light)]/10 p-5 text-sm">
            <p className="text-[var(--foreground)] font-medium mb-1">Submit for review?</p>
            <p className="text-[var(--accent-grey)] leading-relaxed">
              You won&apos;t be able to edit your application after this. Press submit
              again to confirm, or change anything above to go back.
            </p>
          </div>
        )}

        {submitError && (
          <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[var(--foreground)] text-[var(--background)] font-semibold text-sm px-8 py-4 rounded-xl transition-all duration-300 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
        >
          {submitting
            ? "Submitting…"
            : confirming
              ? "Yes — submit my application"
              : "Submit application"}
        </button>
      </section>
    </form>
  );
}
