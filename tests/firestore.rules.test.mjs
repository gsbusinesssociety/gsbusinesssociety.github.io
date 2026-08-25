/**
 * Security rules tests, run against the Firestore emulator.
 *
 *   npm run test:rules
 *
 * These exist because the rules are the only thing standing between a recruiting
 * cycle and either a lockout or a leak of student PII. Every case below is a
 * property we actually depend on, not a smoke test.
 */
import { readFileSync } from "node:fs";
import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  collectionGroup,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

let testEnv;

const ADMIN = "admin@columbia.edu";
const BOARD = "board@columbia.edu";
const MEMBER = "member@columbia.edu";
const RECRUITER = "partner@bigbank.com";
const APPLICANT = "applicant@columbia.edu";
const OTHER_APPLICANT = "someone.else@columbia.edu";

const CYCLE = "fall-2026";
const APP_ID = `${CYCLE}_${APPLICANT}`;
const OTHER_APP_ID = `${CYCLE}_${OTHER_APPLICANT}`;

/** A caller whose provider handed us a mixed-case email, which really happens. */
const MIXED_CASE_MEMBER = "Member@Columbia.edu";

const as = (email) => testEnv.authenticatedContext(email, { email }).firestore();
const anon = () => testEnv.unauthenticatedContext().firestore();

const futureDeadline = () => Timestamp.fromMillis(Date.now() + 7 * 24 * 3600 * 1000);
const pastDeadline = () => Timestamp.fromMillis(Date.now() - 24 * 3600 * 1000);

/** Exactly the fields an applicant is allowed to write, and nothing else. */
const applicantPayload = (overrides = {}) => ({
  cycle: CYCLE,
  email: APPLICANT,
  name: "Alex Applicant",
  pronouns: "they/them",
  phone: "555",
  school: "General Studies",
  gradYear: "2027",
  major: "Economics",
  linkedIn: "",
  resumeLink: "https://example.com/cv.pdf",
  positions: ["General Member"],
  responses: { whyGsbs: "Because." },
  status: "draft",
  updatedAt: Timestamp.now(),
  ...overrides,
});

async function seed(fn) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await fn(ctx.firestore());
  });
}

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "gsbs-rules-test",
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

after(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await seed(async (db) => {
    await setDoc(doc(db, "members", ADMIN), { email: ADMIN, role: "admin" });
    await setDoc(doc(db, "members", BOARD), { email: BOARD, role: "board" });
    await setDoc(doc(db, "members", MEMBER), { email: MEMBER, role: "member" });
    await setDoc(doc(db, "members", RECRUITER), { email: RECRUITER, role: "recruiter" });
    await setDoc(doc(db, "config", "recruitment"), {
      cycle: CYCLE,
      isOpen: true,
      closesAt: futureDeadline(),
      positions: ["General Member"],
    });
  });
});

// ── Roles and the member directory ───────────────────────────────────

describe("members", () => {
  it("lets an applicant read their own (absent) record so the client can resolve a role", async () => {
    await assertSucceeds(getDoc(doc(as(APPLICANT), "members", APPLICANT)));
  });

  it("resolves a role even when the provider returns a mixed-case email", async () => {
    const db = testEnv
      .authenticatedContext(MIXED_CASE_MEMBER, { email: MIXED_CASE_MEMBER })
      .firestore();
    // Member content is readable, which is only possible if the rules lowercased
    // the token email before looking up the members doc.
    await assertSucceeds(getDocs(collection(db, "tips")));
  });

  it("hides the member directory from applicants", async () => {
    await assertFails(getDoc(doc(as(APPLICANT), "members", MEMBER)));
    await assertFails(getDocs(collection(as(APPLICANT), "members")));
  });

  it("lets members read the directory", async () => {
    await assertSucceeds(getDocs(collection(as(MEMBER), "members")));
  });

  it("refuses to let anyone mint themselves a membership", async () => {
    await assertFails(
      setDoc(doc(as(APPLICANT), "members", APPLICANT), { email: APPLICANT, role: "admin" })
    );
    await assertFails(
      setDoc(doc(as(APPLICANT), "members", APPLICANT), { email: APPLICANT, role: "member" })
    );
  });

  it("refuses to let a member promote themselves", async () => {
    await assertFails(updateDoc(doc(as(MEMBER), "members", MEMBER), { role: "admin" }));
  });

  it("lets a member edit their own profile fields", async () => {
    await assertSucceeds(
      updateDoc(doc(as(MEMBER), "members", MEMBER), {
        major: "History",
        gradYear: "2027",
        linkedIn: "https://example.com",
        resumeLink: "https://example.com/cv.pdf",
      })
    );
  });

  it("stops a member from editing someone else's profile", async () => {
    await assertFails(updateDoc(doc(as(MEMBER), "members", ADMIN), { major: "History" }));
  });

  it("lets an admin admit and remove people", async () => {
    await assertSucceeds(
      setDoc(doc(as(ADMIN), "members", "new@columbia.edu"), {
        email: "new@columbia.edu",
        role: "member",
      })
    );
    await assertSucceeds(deleteDoc(doc(as(ADMIN), "members", MEMBER)));
  });
});

// ── Member-only content ──────────────────────────────────────────────

describe("member content", () => {
  beforeEach(async () => {
    await seed(async (db) => {
      await setDoc(doc(db, "tips", "t1"), { title: "Tip" });
      await setDoc(doc(db, "newsletters", "n1"), { title: "News" });
      await setDoc(doc(db, "internships", "i1"), { title: "Job" });
    });
  });

  for (const name of ["tips", "newsletters", "internships"]) {
    it(`keeps ${name} away from applicants`, async () => {
      await assertFails(getDoc(doc(as(APPLICANT), name, name === "tips" ? "t1" : name === "newsletters" ? "n1" : "i1")));
    });

    it(`lets members read ${name}`, async () => {
      await assertSucceeds(getDocs(collection(as(MEMBER), name)));
    });

    it(`only lets admins write ${name}`, async () => {
      await assertFails(setDoc(doc(as(MEMBER), name, "x"), { title: "no" }));
      await assertSucceeds(setDoc(doc(as(ADMIN), name, "x"), { title: "yes" }));
    });
  }
});

// ── Recruitment config ───────────────────────────────────────────────

describe("config/recruitment", () => {
  it("is world-readable so a signed-out visitor can see whether we're open", async () => {
    await assertSucceeds(getDoc(doc(anon(), "config", "recruitment")));
  });

  it("is admin-only to change", async () => {
    await assertFails(updateDoc(doc(as(BOARD), "config", "recruitment"), { isOpen: false }));
    await assertSucceeds(updateDoc(doc(as(ADMIN), "config", "recruitment"), { isOpen: false }));
  });
});

// ── Applications: the applicant's side ───────────────────────────────

describe("applications — applicant", () => {
  it("can start a draft while the cycle is open", async () => {
    await assertSucceeds(setDoc(doc(as(APPLICANT), "applications", APP_ID), applicantPayload()));
  });

  it("cannot apply as someone else", async () => {
    await assertFails(
      setDoc(doc(as(APPLICANT), "applications", OTHER_APP_ID), {
        ...applicantPayload(),
        email: OTHER_APPLICANT,
      })
    );
  });

  it("cannot use a doc ID that doesn't match their email and cycle", async () => {
    await assertFails(
      setDoc(doc(as(APPLICANT), "applications", "some-other-id"), applicantPayload())
    );
  });

  it("cannot pin their application to a different cycle", async () => {
    await assertFails(
      setDoc(doc(as(APPLICANT), "applications", `spring-2027_${APPLICANT}`), {
        ...applicantPayload(),
        cycle: "spring-2027",
      })
    );
  });

  it("cannot smuggle in board-owned fields at creation", async () => {
    await assertFails(
      setDoc(doc(as(APPLICANT), "applications", APP_ID), {
        ...applicantPayload(),
        publicStage: "decided",
      })
    );
    await assertFails(
      setDoc(doc(as(APPLICANT), "applications", APP_ID), {
        ...applicantPayload(),
        stage: "accepted",
      })
    );
  });

  it("is refused once the board closes the cycle", async () => {
    await seed(async (db) => {
      await updateDoc(doc(db, "config", "recruitment"), { isOpen: false });
    });
    await assertFails(setDoc(doc(as(APPLICANT), "applications", APP_ID), applicantPayload()));
  });

  it("is refused after the deadline passes", async () => {
    await seed(async (db) => {
      await updateDoc(doc(db, "config", "recruitment"), { closesAt: pastDeadline() });
    });
    await assertFails(setDoc(doc(as(APPLICANT), "applications", APP_ID), applicantPayload()));
  });

  it("fails closed when no cycle is configured at all", async () => {
    await seed(async (db) => {
      await deleteDoc(doc(db, "config", "recruitment"));
    });
    await assertFails(setDoc(doc(as(APPLICANT), "applications", APP_ID), applicantPayload()));
  });

  it("can edit its own draft and then submit it", async () => {
    const db = as(APPLICANT);
    await assertSucceeds(setDoc(doc(db, "applications", APP_ID), applicantPayload()));
    await assertSucceeds(
      updateDoc(doc(db, "applications", APP_ID), { major: "Statistics", updatedAt: Timestamp.now() })
    );
    await assertSucceeds(
      updateDoc(doc(db, "applications", APP_ID), {
        status: "submitted",
        submittedAt: Timestamp.now(),
      })
    );
  });

  it("is locked out of its own application once submitted", async () => {
    await seed(async (db) => {
      await setDoc(doc(db, "applications", APP_ID), applicantPayload({ status: "submitted" }));
    });
    await assertFails(
      updateDoc(doc(as(APPLICANT), "applications", APP_ID), { major: "Changed my mind" })
    );
  });

  it("cannot promote its own visible status", async () => {
    await seed(async (db) => {
      await setDoc(doc(db, "applications", APP_ID), applicantPayload());
    });
    await assertFails(
      updateDoc(doc(as(APPLICANT), "applications", APP_ID), { publicStage: "interview" })
    );
  });

  it("can read its own application but not anyone else's", async () => {
    await seed(async (db) => {
      await setDoc(doc(db, "applications", APP_ID), applicantPayload());
      await setDoc(doc(db, "applications", OTHER_APP_ID), {
        ...applicantPayload(),
        email: OTHER_APPLICANT,
      });
    });
    await assertSucceeds(getDoc(doc(as(APPLICANT), "applications", APP_ID)));
    await assertFails(getDoc(doc(as(APPLICANT), "applications", OTHER_APP_ID)));
  });
});

// ── Applications: the board's side ───────────────────────────────────

describe("applications — board and recruiters", () => {
  beforeEach(async () => {
    await seed(async (db) => {
      await setDoc(doc(db, "applications", APP_ID), applicantPayload({ status: "submitted" }));
      await setDoc(doc(db, "applications", APP_ID, "pipeline", "state"), {
        cycle: CYCLE,
        stage: "reviewing",
      });
      await setDoc(doc(db, "applications", APP_ID, "reviews", BOARD), {
        reviewerName: "Board",
        score: 4,
        recommendation: "yes",
        notes: "Candid.",
      });
    });
  });

  it("lets the board list applications for a cycle", async () => {
    await assertSucceeds(
      getDocs(
        query(
          collection(as(BOARD), "applications"),
          where("cycle", "==", CYCLE),
          where("status", "==", "submitted")
        )
      )
    );
  });

  it("keeps applications away from recruiters", async () => {
    await assertFails(getDoc(doc(as(RECRUITER), "applications", APP_ID)));
    await assertFails(getDocs(collection(as(RECRUITER), "applications")));
  });

  it("keeps applications away from ordinary members", async () => {
    await assertFails(getDoc(doc(as(MEMBER), "applications", APP_ID)));
  });

  it("lets the board set the applicant-visible status", async () => {
    await assertSucceeds(
      updateDoc(doc(as(BOARD), "applications", APP_ID), {
        publicStage: "interview",
        publicStageAt: Timestamp.now(),
      })
    );
  });

  it("stops the board from editing what the applicant wrote", async () => {
    await assertFails(
      updateDoc(doc(as(BOARD), "applications", APP_ID), { responses: { whyGsbs: "rewritten" } })
    );
  });

  it("lets an admin correct an application outright", async () => {
    await assertSucceeds(
      updateDoc(doc(as(ADMIN), "applications", APP_ID), { major: "Corrected" })
    );
  });
});

// ── Pipeline: the confidentiality property ───────────────────────────

describe("pipeline state", () => {
  beforeEach(async () => {
    await seed(async (db) => {
      await setDoc(doc(db, "applications", APP_ID), applicantPayload({ status: "submitted" }));
      await setDoc(doc(db, "applications", APP_ID, "pipeline", "state"), {
        cycle: CYCLE,
        stage: "rejected",
      });
    });
  });

  it("never reveals an internal decision to the applicant", async () => {
    await assertFails(getDoc(doc(as(APPLICANT), "applications", APP_ID, "pipeline", "state")));
  });

  it("stays hidden from recruiters", async () => {
    await assertFails(getDoc(doc(as(RECRUITER), "applications", APP_ID, "pipeline", "state")));
  });

  it("lets the board read and move it", async () => {
    await assertSucceeds(getDoc(doc(as(BOARD), "applications", APP_ID, "pipeline", "state")));
    await assertSucceeds(
      setDoc(
        doc(as(BOARD), "applications", APP_ID, "pipeline", "state"),
        { cycle: CYCLE, stage: "interview" },
        { merge: true }
      )
    );
  });

  it("supports the collection-group query the tracker loads with", async () => {
    await assertSucceeds(
      getDocs(query(collectionGroup(as(BOARD), "pipeline"), where("cycle", "==", CYCLE)))
    );
    await assertFails(
      getDocs(query(collectionGroup(as(APPLICANT), "pipeline"), where("cycle", "==", CYCLE)))
    );
  });
});

// ── Reviews: candour depends on these ────────────────────────────────

describe("reviews", () => {
  beforeEach(async () => {
    await seed(async (db) => {
      await setDoc(doc(db, "applications", APP_ID), applicantPayload({ status: "submitted" }));
      await setDoc(doc(db, "applications", APP_ID, "reviews", ADMIN), {
        reviewerName: "Admin",
        score: 2,
        recommendation: "no",
        notes: "Blunt.",
      });
    });
  });

  it("is never readable by the applicant", async () => {
    await assertFails(getDoc(doc(as(APPLICANT), "applications", APP_ID, "reviews", ADMIN)));
    await assertFails(getDocs(collection(as(APPLICANT), "applications", APP_ID, "reviews")));
  });

  it("is never readable by recruiters", async () => {
    await assertFails(getDocs(collection(as(RECRUITER), "applications", APP_ID, "reviews")));
  });

  it("lets a reviewer write their own review", async () => {
    await assertSucceeds(
      setDoc(doc(as(BOARD), "applications", APP_ID, "reviews", BOARD), {
        reviewerName: "Board",
        score: 5,
        recommendation: "yes",
        notes: "Strong.",
      })
    );
  });

  it("stops a reviewer from writing in someone else's name", async () => {
    await assertFails(
      setDoc(doc(as(BOARD), "applications", APP_ID, "reviews", ADMIN), {
        reviewerName: "Board pretending to be Admin",
        score: 5,
        recommendation: "yes",
        notes: "",
      })
    );
  });

  it("lets the board read each other's reviews", async () => {
    await assertSucceeds(getDocs(collection(as(BOARD), "applications", APP_ID, "reviews")));
  });
});

// ── Who is allowed to apply at all ───────────────────────────────────

describe("who can apply", () => {
  // The rules gate on identity and ownership, not on membership. Anyone signed
  // in may file their own application for the open cycle. These tests pin that
  // down so a future change to it is a deliberate one.
  const payloadFor = (email) => ({
    ...applicantPayload(),
    email,
    cycle: CYCLE,
  });

  it("lets an existing member apply", async () => {
    await assertSucceeds(
      setDoc(doc(as(MEMBER), "applications", `${CYCLE}_${MEMBER}`), payloadFor(MEMBER))
    );
  });

  it("lets a board reviewer apply", async () => {
    await assertSucceeds(
      setDoc(doc(as(BOARD), "applications", `${CYCLE}_${BOARD}`), payloadFor(BOARD))
    );
  });

  // External hiring partners are not candidates. Enforced in the rules rather
  // than only in /apply, so skipping the UI doesn't skip the check.
  it("stops a recruiter applying", async () => {
    await assertFails(
      setDoc(doc(as(RECRUITER), "applications", `${CYCLE}_${RECRUITER}`), payloadFor(RECRUITER))
    );
  });

  it("still stops any of them reading someone else's application", async () => {
    await seed(async (db) => {
      await setDoc(doc(db, "applications", APP_ID), applicantPayload({ status: "submitted" }));
    });
    await assertFails(getDoc(doc(as(MEMBER), "applications", APP_ID)));
    await assertFails(getDoc(doc(as(RECRUITER), "applications", APP_ID)));
  });
});

// ── What a non-member can reach ──────────────────────────────────────

describe("a signed-in non-member", () => {
  beforeEach(async () => {
    await seed(async (db) => {
      await setDoc(doc(db, "tips", "t1"), { title: "Tip" });
      await setDoc(doc(db, "newsletters", "n1"), { title: "News" });
      await setDoc(doc(db, "internships", "i1"), { title: "Job" });
    });
  });

  it("reaches nothing the member dashboard is built from", async () => {
    const db = as(APPLICANT);
    await assertFails(getDocs(collection(db, "tips")));
    await assertFails(getDocs(collection(db, "newsletters")));
    await assertFails(getDocs(collection(db, "internships")));
    await assertFails(getDocs(collection(db, "members")));
    await assertFails(getDocs(collection(db, "contact_messages")));
  });

  it("can still read the public surfaces", async () => {
    await assertSucceeds(getDoc(doc(as(APPLICANT), "config", "recruitment")));
    await assertSucceeds(getDocs(collection(as(APPLICANT), "events")));
  });
});

// ── Contact form ─────────────────────────────────────────────────────

describe("contact_messages", () => {
  it("accepts a message from anyone but only shows it to admins", async () => {
    await assertSucceeds(
      setDoc(doc(anon(), "contact_messages", "m1"), { name: "A", message: "Hi" })
    );
    await assertFails(getDoc(doc(as(MEMBER), "contact_messages", "m1")));
    await assertSucceeds(getDoc(doc(as(ADMIN), "contact_messages", "m1")));
  });
});

it("sanity: the suite actually ran against the emulator", () => {
  assert.ok(testEnv, "test environment initialised");
});
