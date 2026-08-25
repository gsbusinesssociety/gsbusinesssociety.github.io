/**
 * Shape of a recruiting cycle.
 *
 * Split deliberately across two homes:
 *  - Anything that changes per cycle (dates, whether we're open, which roles we
 *    are hiring for) lives in the Firestore doc `config/recruitment`, so the
 *    board can open and close applications without a redeploy. The site is a
 *    static export, so a code change means a full CI build.
 *  - Anything that shapes the form or the pipeline lives here in code, because
 *    it is what the components and the types are built against.
 */

/** The board's internal pipeline. Applicants never see these labels. */
export const PIPELINE_STAGES = [
  { id: "new", label: "New", hint: "Submitted, not yet picked up" },
  { id: "reviewing", label: "In review", hint: "Being read by the board" },
  { id: "interview", label: "Interview", hint: "Invited to interview" },
  { id: "offer", label: "Offer", hint: "Offer extended" },
  { id: "accepted", label: "Accepted", hint: "Joined", terminal: true },
  { id: "rejected", label: "Not moving forward", terminal: true },
  { id: "withdrawn", label: "Withdrew", terminal: true },
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number]["id"];

export const DEFAULT_STAGE: PipelineStage = "new";

export function stageLabel(stage: PipelineStage): string {
  return PIPELINE_STAGES.find((s) => s.id === stage)?.label ?? stage;
}

export function isTerminalStage(stage: PipelineStage): boolean {
  const found = PIPELINE_STAGES.find((s) => s.id === stage);
  return Boolean(found && "terminal" in found && found.terminal);
}

/**
 * What the applicant is allowed to see. Kept separate from the pipeline stage on
 * purpose: moving someone to `rejected` in the tracker must not tell them before
 * the board has actually sent the message. The board promotes this explicitly.
 */
export const PUBLIC_STAGES = [
  { id: "submitted", label: "Application received", hint: "We have your application." },
  { id: "under_review", label: "Under review", hint: "The board is reading applications." },
  { id: "interview", label: "Interview", hint: "You've been invited to interview." },
  { id: "decided", label: "Decision sent", hint: "We've been in touch by email." },
] as const;

export type PublicStage = (typeof PUBLIC_STAGES)[number]["id"];

export const DEFAULT_PUBLIC_STAGE: PublicStage = "submitted";

export function publicStageLabel(stage: PublicStage): string {
  return PUBLIC_STAGES.find((s) => s.id === stage)?.label ?? stage;
}

/** Free-text questions. Order here is the order they render in. */
export interface ApplicationQuestion {
  id: string;
  label: string;
  helper?: string;
  maxLength: number;
  required: boolean;
}

export const APPLICATION_QUESTIONS: readonly ApplicationQuestion[] = [
  {
    id: "whyGsbs",
    label: "Why do you want to join the GS Business Society?",
    helper: "What drew you to us specifically, rather than to business clubs in general.",
    maxLength: 1500,
    required: true,
  },
  {
    id: "contribution",
    label: "What would you contribute to the society?",
    helper: "Skills, ideas, connections, or work you'd want to take on.",
    maxLength: 1500,
    required: true,
  },
  {
    id: "experience",
    label: "Tell us about relevant experience.",
    helper:
      "Optional. Non-traditional paths are welcome here — coursework, jobs, military service, running something of your own.",
    maxLength: 1500,
    required: false,
  },
] as const;

export const SCHOOLS = [
  "General Studies",
  "Columbia College",
  "SEAS",
  "Barnard",
  "GSAS",
  "Other",
] as const;

/** Seed value for `config/recruitment.positions`; the config doc is authoritative. */
export const DEFAULT_POSITIONS = [
  "General Member",
  "Junior Board — Events",
  "Junior Board — Marketing",
  "Junior Board — Communications",
  "Junior Board — Education",
  "Junior Board — Development",
  "Junior Board — Technology",
  "Junior Board — Finance",
];

/**
 * Computed at call time rather than module scope: a static export would bake the
 * build year into the bundle and quietly go stale.
 */
export function gradYearOptions(span = 6): string[] {
  const year = new Date().getFullYear();
  return Array.from({ length: span }, (_, i) => String(year + i));
}

/** Doc ID for an application. One per person per cycle, so re-applying next season is a new doc. */
export function applicationId(cycle: string, email: string): string {
  return `${cycle}_${email.toLowerCase().trim()}`;
}
