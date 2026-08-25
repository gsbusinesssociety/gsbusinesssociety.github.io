"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import ApplicationForm, { type SaveState } from "../components/apply/ApplicationForm";
import StatusTimeline from "../components/apply/StatusTimeline";
import { FirestoreTimeoutError } from "../lib/firestoreTimeout";
import { DEFAULT_POSITIONS } from "../lib/recruitment";
import {
  EMPTY_DRAFT,
  getMyApplication,
  getRecruitmentConfig,
  isAcceptingApplications,
  publicStageOf,
  saveDraft,
  submitApplication,
  type Application,
  type ApplicationDraft,
  type RecruitmentConfig,
} from "../lib/applications";

type LoadState = "loading" | "ready" | "error";

function describeWriteFailure(err: unknown): string {
  if (err instanceof FirestoreTimeoutError) {
    return "That took longer than expected — your connection may be slow. Nothing was lost; please try again.";
  }
  if ((err as { code?: string })?.code === "permission-denied") {
    return "We couldn't accept this. Applications may have just closed — reload the page to check.";
  }
  return "Something went wrong. Please try again, or email us if it keeps happening.";
}

const Spinner = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="animate-pulse flex space-x-2">
      <div className="w-3 h-3 bg-[var(--columbia-blue)] rounded-full"></div>
      <div className="w-3 h-3 bg-[var(--columbia-blue)] rounded-full animation-delay-200"></div>
      <div className="w-3 h-3 bg-[var(--columbia-blue)] rounded-full animation-delay-400"></div>
    </div>
  </div>
);

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass-panel p-10 md:p-14 rounded-3xl"
    >
      {children}
    </motion.div>
  );
}

export default function ApplyPage() {
  const { user, userRole, authError, loading: authLoading, retry: retryAuth, signOut } = useAuth();
  const router = useRouter();

  const [config, setConfig] = useState<RecruitmentConfig | null>(null);
  const [configState, setConfigState] = useState<LoadState>("loading");

  const [application, setApplication] = useState<Application | null>(null);
  const [appState, setAppState] = useState<LoadState>("loading");

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [reloadCount, setReloadCount] = useState(0);
  // Resetting here rather than inside the load effects keeps the state change in
  // an event handler, where it doesn't cascade a re-render.
  const reload = () => {
    setConfigState("loading");
    setAppState("loading");
    setReloadCount((n) => n + 1);
  };

  // The config doc is world-readable so a signed-out visitor can still be told
  // whether we're open and when we close.
  useEffect(() => {
    let cancelled = false;
    getRecruitmentConfig()
      .then((loaded) => {
        if (cancelled) return;
        setConfig(loaded);
        setConfigState("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Could not load recruitment config", err);
        setConfigState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadCount]);

  const email = user?.email ?? null;
  const cycle = config?.cycle ?? null;

  useEffect(() => {
    if (!email || !cycle) return;
    let cancelled = false;
    getMyApplication(cycle, email)
      .then((loaded) => {
        if (cancelled) return;
        setApplication(loaded);
        setAppState("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Could not load application", err);
        setAppState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [email, cycle, reloadCount]);

  const handleSaveDraft = useCallback(
    async (draft: ApplicationDraft) => {
      if (!email || !cycle) return;
      setSaveState("saving");
      try {
        await saveDraft(cycle, email, draft);
        setSaveState("saved");
        setLastSavedAt(new Date());
      } catch (err) {
        console.error("Draft save failed", err);
        setSaveState("error");
      }
    },
    [email, cycle]
  );

  const handleSubmit = useCallback(
    async (draft: ApplicationDraft) => {
      if (!email || !cycle) return;
      setSubmitting(true);
      setSubmitError(null);
      try {
        await submitApplication(cycle, email, draft);
        const fresh = await getMyApplication(cycle, email);
        setApplication(fresh);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        console.error("Submit failed", err);
        setSubmitError(describeWriteFailure(err));
      } finally {
        setSubmitting(false);
      }
    },
    [email, cycle]
  );

  const positions = config?.positions?.length ? config.positions : DEFAULT_POSITIONS;
  const isOpen = isAcceptingApplications(config);
  const closesLabel = config?.closesAt
    ? config.closesAt.toDate().toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const body = () => {
    if (authLoading || configState === "loading") return <Spinner />;

    if (authError) {
      return (
        <Panel>
          <h1 className="font-serif text-3xl text-[var(--foreground)] mb-4">
            {authError.retryable ? "We couldn't load your account" : "Access unavailable"}
          </h1>
          <p className="text-[var(--accent-grey)] text-[15px] leading-relaxed mb-8">
            {authError.message}
          </p>
          {authError.retryable && (
            <button
              onClick={retryAuth}
              className="bg-[var(--foreground)] text-[var(--background)] font-semibold text-sm px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Try again
            </button>
          )}
        </Panel>
      );
    }

    if (configState === "error") {
      return (
        <Panel>
          <h1 className="font-serif text-3xl text-[var(--foreground)] mb-4">
            We couldn&apos;t load the application
          </h1>
          <p className="text-[var(--accent-grey)] text-[15px] leading-relaxed mb-8">
            This is usually a slow connection rather than a problem on your end.
          </p>
          <button
            onClick={reload}
            className="bg-[var(--foreground)] text-[var(--background)] font-semibold text-sm px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
        </Panel>
      );
    }

    // Recruiters are external hiring partners, not candidates for the board.
    if (userRole === "recruiter") {
      return (
        <Panel>
          <h1 className="font-serif text-3xl text-[var(--foreground)] mb-4">
            This one&apos;s for students
          </h1>
          <p className="text-[var(--accent-grey)] text-[15px] leading-relaxed mb-8">
            You&apos;re signed in to a partner account. Head to the recruiter portal for
            the resume book.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-[var(--foreground)] text-[var(--background)] font-semibold text-sm px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Go to recruiter portal
          </button>
        </Panel>
      );
    }

    if (!user) {
      return (
        <Panel>
          <h1 className="font-serif text-3xl md:text-4xl text-[var(--foreground)] mb-5">
            Apply to join GSBS
          </h1>
          {config?.intro ? (
            <p className="text-[var(--accent-grey)] text-[16px] leading-[1.8] mb-6">{config.intro}</p>
          ) : (
            <p className="text-[var(--accent-grey)] text-[16px] leading-[1.8] mb-6">
              We open applications each semester for general membership and junior
              board positions. Non-traditional paths are welcome — most of us took one.
            </p>
          )}

          {isOpen ? (
            <>
              <p className="text-[var(--accent-grey)] text-sm mb-8">
                Sign in with your Columbia email to start. You can save a draft and
                come back to it{closesLabel ? ` any time before ${closesLabel}` : ""}.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="bg-[var(--foreground)] text-[var(--background)] font-semibold text-sm px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
              >
                Sign in to apply
              </button>
            </>
          ) : (
            <div className="inline-block px-6 py-3 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[13px] text-[var(--accent-grey)] italic">
              Applications are closed right now — check back next semester.
            </div>
          )}
        </Panel>
      );
    }

    if (appState === "loading") return <Spinner />;

    if (appState === "error") {
      return (
        <Panel>
          <h1 className="font-serif text-3xl text-[var(--foreground)] mb-4">
            We couldn&apos;t load your application
          </h1>
          <p className="text-[var(--accent-grey)] text-[15px] leading-relaxed mb-8">
            Nothing has been lost. This is usually a slow connection.
          </p>
          <button
            onClick={reload}
            className="bg-[var(--foreground)] text-[var(--background)] font-semibold text-sm px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
        </Panel>
      );
    }

    // Submitted applications are read-only for good: the rules refuse any further
    // applicant write, so there is nothing to edit even if we offered it.
    if (application?.status === "submitted") {
      return (
        <Panel>
          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[var(--columbia-blue-light)] mb-4">
            Application received
          </p>
          <h1 className="font-serif text-3xl text-[var(--foreground)] mb-4">
            Thanks, {application.name.split(" ")[0] || "and welcome"}.
          </h1>
          <p className="text-[var(--accent-grey)] text-[15px] leading-relaxed mb-10">
            We have your application
            {application.submittedAt
              ? ` from ${application.submittedAt.toDate().toLocaleDateString()}`
              : ""}
            . Every application is read by the board — we&apos;ll be in touch by email at{" "}
            <span className="text-[var(--foreground)]">{application.email}</span>.
          </p>

          <StatusTimeline current={publicStageOf(application)} />

          <div className="mt-10 pt-8 border-t border-black/5 dark:border-white/5 flex flex-wrap gap-x-6 gap-y-2 items-center">
            <button
              onClick={signOut}
              className="text-[var(--accent-grey)] hover:text-[var(--foreground)] text-sm underline underline-offset-4 transition-colors"
            >
              Sign out
            </button>
            <a
              href="/contact"
              className="text-[var(--accent-grey)] hover:text-[var(--foreground)] text-sm underline underline-offset-4 transition-colors"
            >
              Something wrong with your application?
            </a>
          </div>
        </Panel>
      );
    }

    if (!isOpen) {
      return (
        <Panel>
          <h1 className="font-serif text-3xl text-[var(--foreground)] mb-4">
            Applications are closed
          </h1>
          <p className="text-[var(--accent-grey)] text-[15px] leading-relaxed">
            {application
              ? "You have an unsubmitted draft, but the deadline has passed so it can no longer be submitted. We'd love to see it next semester."
              : "We open applications at the start of each semester. Follow us on Instagram to hear when the next cycle opens."}
          </p>
        </Panel>
      );
    }

    return (
      <>
        <div className="mb-12">
          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[var(--columbia-blue-light)] mb-4">
            {config?.cycle?.replace("-", " ") ?? "Recruiting"}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-[var(--foreground)] mb-5">
            Apply to join GSBS
          </h1>
          <p className="text-[var(--accent-grey)] text-[16px] leading-[1.8] max-w-2xl">
            {config?.intro ??
              "Tell us who you are and what you'd want to build with us. Your answers save automatically, so you can leave and come back."}
          </p>
          {closesLabel && (
            <p className="text-[var(--accent-grey)] text-sm mt-4">
              Applications close <span className="text-[var(--foreground)]">{closesLabel}</span>.
            </p>
          )}
        </div>

        <div className="glass-panel p-8 md:p-12 rounded-3xl">
          <ApplicationForm
            email={application?.email ?? email ?? ""}
            positions={positions}
            initial={
              application
                ? {
                    name: application.name,
                    pronouns: application.pronouns,
                    phone: application.phone,
                    school: application.school,
                    gradYear: application.gradYear,
                    major: application.major,
                    linkedIn: application.linkedIn,
                    resumeLink: application.resumeLink,
                    positions: application.positions,
                    responses: application.responses,
                  }
                : EMPTY_DRAFT
            }
            saveState={saveState}
            lastSavedAt={lastSavedAt}
            submitting={submitting}
            submitError={submitError}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
          />
        </div>
      </>
    );
  };

  return (
    <main className="min-h-screen relative overflow-hidden pb-32">
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[var(--columbia-blue)] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none"></div>
      <section className="max-w-3xl mx-auto px-6 pt-28 relative z-10">{body()}</section>
    </main>
  );
}
