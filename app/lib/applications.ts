import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { withTimeout } from "./firestoreTimeout";
import {
  applicationId,
  DEFAULT_PUBLIC_STAGE,
  DEFAULT_STAGE,
  type PipelineStage,
  type PublicStage,
} from "./recruitment";

// Reads can fail fast and be retried. Writes cannot: aborting a submit would
// silently discard a finished application, which is the one outcome worth
// avoiding at any cost on a long-polled connection.
const READ_TIMEOUT_MS = 15000;
const WRITE_TIMEOUT_MS = 45000;

// ── Types ──────────────────────────────────────────────────────────────

export type ApplicationStatus = "draft" | "submitted";

export interface RecruitmentConfig {
  cycle: string;
  isOpen: boolean;
  closesAt: Timestamp;
  positions: string[];
  /** Optional blurb rendered above the form. */
  intro?: string;
}

export interface Application {
  id: string;
  cycle: string;
  email: string;
  name: string;
  pronouns: string;
  phone: string;
  school: string;
  gradYear: string;
  major: string;
  linkedIn: string;
  resumeLink: string;
  positions: string[];
  responses: Record<string, string>;
  status: ApplicationStatus;
  /** Board-written. Absent until the board promotes it — see publicStageOf(). */
  publicStage?: PublicStage;
  updatedAt?: Timestamp;
  submittedAt?: Timestamp;
}

/**
 * The applicant-editable subset. Mirrors the `hasOnly()` allowlist in
 * firestore.rules — changing one without the other will surface as a
 * permission-denied on save.
 */
export type ApplicationDraft = Pick<
  Application,
  | "name"
  | "pronouns"
  | "phone"
  | "school"
  | "gradYear"
  | "major"
  | "linkedIn"
  | "resumeLink"
  | "positions"
  | "responses"
>;

/** Board-only. Lives in a subcollection the applicant cannot read. */
export interface ApplicationPipeline {
  appId: string;
  cycle: string;
  stage: PipelineStage;
  reviewCount: number;
  averageScore: number | null;
  updatedAt?: Timestamp;
  updatedBy?: string;
}

/** Board-only, one per reviewer. Never readable by the applicant. */
export interface ApplicationReview {
  reviewerEmail: string;
  reviewerName: string;
  score: number;
  recommendation: "yes" | "no" | "maybe";
  notes: string;
  updatedAt?: Timestamp;
}

export const EMPTY_DRAFT: ApplicationDraft = {
  name: "",
  pronouns: "",
  phone: "",
  school: "",
  gradYear: "",
  major: "",
  linkedIn: "",
  resumeLink: "",
  positions: [],
  responses: {},
};

// ── Paths ──────────────────────────────────────────────────────────────

const applicationRef = (appId: string) => doc(db, "applications", appId);
const pipelineRef = (appId: string) => doc(db, "applications", appId, "pipeline", "state");
const reviewRef = (appId: string, reviewerEmail: string) =>
  doc(db, "applications", appId, "reviews", reviewerEmail.toLowerCase().trim());

// ── Config ─────────────────────────────────────────────────────────────

export async function getRecruitmentConfig(): Promise<RecruitmentConfig | null> {
  const snap = await withTimeout(getDoc(doc(db, "config", "recruitment")), READ_TIMEOUT_MS);
  if (!snap.exists()) return null;
  const data = snap.data() as DocumentData;
  return {
    cycle: data.cycle,
    isOpen: Boolean(data.isOpen),
    closesAt: data.closesAt,
    positions: Array.isArray(data.positions) ? data.positions : [],
    intro: data.intro,
  };
}

/**
 * The client clock is untrusted, so this only decides what to render — the same
 * window is enforced in firestore.rules against `request.time`.
 */
export function isAcceptingApplications(config: RecruitmentConfig | null): boolean {
  if (!config || !config.isOpen || !config.closesAt) return false;
  return config.closesAt.toMillis() > Date.now();
}

// ── Applicant side ─────────────────────────────────────────────────────

function toApplication(id: string, data: DocumentData): Application {
  return {
    id,
    cycle: data.cycle ?? "",
    email: data.email ?? "",
    name: data.name ?? "",
    pronouns: data.pronouns ?? "",
    phone: data.phone ?? "",
    school: data.school ?? "",
    gradYear: data.gradYear ?? "",
    major: data.major ?? "",
    linkedIn: data.linkedIn ?? "",
    resumeLink: data.resumeLink ?? "",
    positions: Array.isArray(data.positions) ? data.positions : [],
    responses: data.responses ?? {},
    status: data.status === "submitted" ? "submitted" : "draft",
    publicStage: data.publicStage,
    updatedAt: data.updatedAt,
    submittedAt: data.submittedAt,
  };
}

export async function getApplication(appId: string): Promise<Application | null> {
  const snap = await withTimeout(getDoc(applicationRef(appId)), READ_TIMEOUT_MS);
  return snap.exists() ? toApplication(snap.id, snap.data()) : null;
}

export function getMyApplication(cycle: string, email: string): Promise<Application | null> {
  return getApplication(applicationId(cycle, email));
}

/**
 * Writes the whole applicant-owned shape every time rather than a partial patch,
 * so the create and update rules see the same field set on the first save as on
 * every later one.
 */
export async function saveDraft(
  cycle: string,
  email: string,
  draft: ApplicationDraft
): Promise<string> {
  const normalisedEmail = email.toLowerCase().trim();
  const appId = applicationId(cycle, normalisedEmail);
  await withTimeout(
    setDoc(
      applicationRef(appId),
      {
        ...draft,
        cycle,
        email: normalisedEmail,
        status: "draft" satisfies ApplicationStatus,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    ),
    WRITE_TIMEOUT_MS
  );
  return appId;
}

/**
 * One-way. The rules refuse any further applicant write once status is
 * `submitted`, so there is no un-submit path by design.
 */
export async function submitApplication(
  cycle: string,
  email: string,
  draft: ApplicationDraft
): Promise<string> {
  const normalisedEmail = email.toLowerCase().trim();
  const appId = applicationId(cycle, normalisedEmail);
  await withTimeout(
    setDoc(
      applicationRef(appId),
      {
        ...draft,
        cycle,
        email: normalisedEmail,
        status: "submitted" satisfies ApplicationStatus,
        updatedAt: serverTimestamp(),
        submittedAt: serverTimestamp(),
      },
      { merge: true }
    ),
    WRITE_TIMEOUT_MS
  );
  return appId;
}

/** Absent means the board hasn't promoted anything yet, which reads as "received". */
export function publicStageOf(application: Application): PublicStage {
  return application.publicStage ?? DEFAULT_PUBLIC_STAGE;
}

// ── Board side ─────────────────────────────────────────────────────────

/**
 * Submitted applications only. The status filter is explicit rather than relying
 * on the fact that drafts have no `submittedAt` and would be dropped by the
 * orderBy anyway — the board should not be reading half-finished applications,
 * and that should be a stated rule, not a side effect of the sort.
 */
export async function listApplications(cycle: string): Promise<Application[]> {
  const snap = await withTimeout(
    getDocs(
      query(
        collection(db, "applications"),
        where("cycle", "==", cycle),
        where("status", "==", "submitted"),
        orderBy("submittedAt", "desc")
      )
    ),
    READ_TIMEOUT_MS
  );
  return snap.docs.map((d) => toApplication(d.id, d.data()));
}

/**
 * One collection-group query for the whole cycle instead of a per-application
 * read. Applications with no pipeline doc yet simply aren't in the map, and the
 * caller falls back to DEFAULT_STAGE.
 */
export async function listPipelines(cycle: string): Promise<Map<string, ApplicationPipeline>> {
  const snap = await withTimeout(
    getDocs(query(collectionGroup(db, "pipeline"), where("cycle", "==", cycle))),
    READ_TIMEOUT_MS
  );
  const byAppId = new Map<string, ApplicationPipeline>();
  for (const d of snap.docs) {
    const appId = d.ref.parent.parent?.id;
    if (!appId) continue;
    const data = d.data();
    byAppId.set(appId, {
      appId,
      cycle: data.cycle,
      stage: data.stage ?? DEFAULT_STAGE,
      reviewCount: data.reviewCount ?? 0,
      averageScore: data.averageScore ?? null,
      updatedAt: data.updatedAt,
      updatedBy: data.updatedBy,
    });
  }
  return byAppId;
}

export async function setPipelineStage(
  appId: string,
  cycle: string,
  stage: PipelineStage,
  actorEmail: string
): Promise<void> {
  await withTimeout(
    setDoc(
      pipelineRef(appId),
      { cycle, stage, updatedAt: serverTimestamp(), updatedBy: actorEmail.toLowerCase().trim() },
      { merge: true }
    ),
    WRITE_TIMEOUT_MS
  );
}

/**
 * Separate call from setPipelineStage on purpose: telling the applicant is a
 * deliberate act, not a side effect of moving a card in the tracker.
 */
export async function setPublicStage(appId: string, stage: PublicStage): Promise<void> {
  await withTimeout(
    setDoc(
      applicationRef(appId),
      { publicStage: stage, publicStageAt: serverTimestamp() },
      { merge: true }
    ),
    WRITE_TIMEOUT_MS
  );
}

export async function listReviews(appId: string): Promise<ApplicationReview[]> {
  const snap = await withTimeout(
    getDocs(collection(db, "applications", appId, "reviews")),
    READ_TIMEOUT_MS
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      reviewerEmail: d.id,
      reviewerName: data.reviewerName ?? d.id,
      score: data.score ?? 0,
      recommendation: data.recommendation ?? "maybe",
      notes: data.notes ?? "",
      updatedAt: data.updatedAt,
    };
  });
}

export async function saveReview(
  appId: string,
  review: Omit<ApplicationReview, "updatedAt">
): Promise<void> {
  await withTimeout(
    setDoc(
      reviewRef(appId, review.reviewerEmail),
      {
        reviewerName: review.reviewerName,
        score: review.score,
        recommendation: review.recommendation,
        notes: review.notes,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    ),
    WRITE_TIMEOUT_MS
  );
}

/**
 * Denormalised onto the pipeline doc so the tracker table can show review
 * coverage without reading every reviewer's notes for every row.
 */
export async function updateReviewSummary(
  appId: string,
  cycle: string,
  reviews: ApplicationReview[]
): Promise<void> {
  const scored = reviews.filter((r) => r.score > 0);
  const averageScore = scored.length
    ? Math.round((scored.reduce((sum, r) => sum + r.score, 0) / scored.length) * 10) / 10
    : null;
  await withTimeout(
    setDoc(
      pipelineRef(appId),
      { cycle, reviewCount: reviews.length, averageScore, updatedAt: serverTimestamp() },
      { merge: true }
    ),
    WRITE_TIMEOUT_MS
  );
}
