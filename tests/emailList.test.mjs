/**
 * Unit tests for the weekly-email recipient list.
 *
 * The failure this guards against is silent: a Bcc list that looks right in the
 * UI but arrives at the mail client mangled, truncated, or — worst — with a
 * member's address exposed in To. There is no send confirmation to catch it.
 *
 *   npm run test:unit
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildGmailUrl,
  buildMailtoUrl,
  collectRecipients,
  countByRole,
  mailtoIsSafe,
  roleOf,
  toAddressList,
  MAILTO_SAFE_LENGTH,
} from "../app/lib/emailList.ts";

const DIRECTORY = [
  { id: "ada@columbia.edu", email: "ada@columbia.edu", role: "member" },
  { id: "grace@columbia.edu", email: "grace@columbia.edu", role: "board" },
  { id: "alan@columbia.edu", email: "alan@columbia.edu", role: "admin" },
  { id: "scout@bigbank.com", email: "scout@bigbank.com", role: "recruiter" },
  // Predates the role field.
  { id: "katherine@columbia.edu", email: "katherine@columbia.edu" },
];

describe("collectRecipients", () => {
  it("returns only the roles asked for", () => {
    assert.deepEqual(collectRecipients(DIRECTORY, ["board"]), ["grace@columbia.edu"]);
  });

  it("treats a record with no role as a member", () => {
    assert.deepEqual(collectRecipients(DIRECTORY, ["member"]), [
      "ada@columbia.edu",
      "katherine@columbia.edu",
    ]);
  });

  it("keeps external recruiters out unless they are explicitly chosen", () => {
    const internal = collectRecipients(DIRECTORY, ["member", "board", "admin"]);
    assert.ok(!internal.includes("scout@bigbank.com"));
    assert.equal(internal.length, 4);
  });

  it("falls back to the doc ID when the email field is missing", () => {
    assert.deepEqual(collectRecipients([{ id: "Dorothy@Columbia.edu" }], ["member"]), [
      "dorothy@columbia.edu",
    ]);
  });

  it("de-duplicates addresses that differ only by case or whitespace", () => {
    const dupes = [
      { email: "ada@columbia.edu", role: "member" },
      { email: "  ADA@columbia.edu ", role: "member" },
      { id: "ada@columbia.edu", email: "Ada@Columbia.Edu", role: "member" },
    ];
    assert.deepEqual(collectRecipients(dupes, ["member"]), ["ada@columbia.edu"]);
  });

  it("drops rows that would poison an address header", () => {
    const junk = [
      { email: "", role: "member" },
      { email: "not-an-email", role: "member" },
      { email: "no@tld", role: "member" },
      { email: "two@a.com, sneaky@b.com", role: "member" },
      { email: "Name <real@columbia.edu>", role: "member" },
      { role: "member" },
    ];
    assert.deepEqual(collectRecipients(junk, ["member"]), []);
  });

  it("is stable — the same audience always yields the same order", () => {
    const shuffled = [...DIRECTORY].reverse();
    assert.deepEqual(
      collectRecipients(DIRECTORY, ["member", "admin"]),
      collectRecipients(shuffled, ["member", "admin"])
    );
  });

  it("returns nothing for an empty audience", () => {
    assert.deepEqual(collectRecipients(DIRECTORY, []), []);
  });

  it("keeps the sender out of their own Bcc — they are already on To", () => {
    const bcc = collectRecipients(DIRECTORY, ["member", "board", "admin"], ["ALAN@columbia.edu "]);
    assert.ok(!bcc.includes("alan@columbia.edu"));
    assert.equal(bcc.length, 3);
  });

  it("ignores an exclusion that is not in the audience anyway", () => {
    assert.deepEqual(
      collectRecipients(DIRECTORY, ["board"], ["nobody@columbia.edu"]),
      ["grace@columbia.edu"]
    );
  });
});

describe("roleOf / countByRole", () => {
  it("normalises case and whitespace", () => {
    assert.equal(roleOf({ role: " Board " }), "board");
  });

  it("counts each role independently", () => {
    assert.deepEqual(countByRole(DIRECTORY), {
      member: 2,
      board: 1,
      admin: 1,
      recruiter: 1,
    });
  });
});

describe("buildMailtoUrl", () => {
  const draft = {
    from: "Chair@Columbia.edu",
    bcc: ["ada@columbia.edu", "grace@columbia.edu"],
    subject: "GSBS Weekly — Week of Aug 31",
    body: "Hi all,\n\nTwo things this week.",
  };

  it("puts the sender in To and everyone else in Bcc", () => {
    const url = buildMailtoUrl(draft);
    assert.ok(url.startsWith("mailto:chair%40columbia.edu?"));
    assert.ok(url.includes("bcc=ada%40columbia.edu,grace%40columbia.edu"));
  });

  it("never leaks a recipient into the To field", () => {
    const [head] = buildMailtoUrl(draft).split("?");
    for (const recipient of draft.bcc) {
      assert.ok(!head.includes(encodeURIComponent(recipient)));
    }
  });

  it("leaves the address separators bare so the list stays a list", () => {
    // Encoding the separator as %2C would make the whole run read as one
    // malformed address. Commas inside the body are a different matter and do
    // have to be encoded, so this looks only at the bcc parameter.
    const bcc = buildMailtoUrl(draft).match(/[?&]bcc=([^&]*)/)[1];
    assert.ok(!bcc.includes("%2C"));
    assert.equal(bcc.split(",").length, draft.bcc.length);
  });

  it("encodes spaces as %20, not + — mail clients do not undo form encoding", () => {
    const url = buildMailtoUrl(draft);
    assert.ok(url.includes("subject=GSBS%20Weekly"));
    assert.ok(!/subject=[^&]*\+/.test(url));
  });

  it("preserves newlines in the body", () => {
    assert.ok(buildMailtoUrl(draft).includes("Hi%20all%2C%0A%0ATwo"));
  });

  it("omits empty fields rather than sending blank parameters", () => {
    const url = buildMailtoUrl({ from: "chair@columbia.edu", bcc: [], subject: "", body: "" });
    assert.equal(url, "mailto:chair%40columbia.edu");
  });

  it("flags a draft too long to survive the handoff to a mail client", () => {
    const many = Array.from({ length: 200 }, (_, i) => `member${i}@columbia.edu`);
    assert.ok(mailtoIsSafe({ ...draft, bcc: ["one@columbia.edu"] }));
    assert.ok(!mailtoIsSafe({ ...draft, bcc: many }));
    assert.ok(buildMailtoUrl({ ...draft, bcc: many }).length > MAILTO_SAFE_LENGTH);
  });
});

describe("buildGmailUrl", () => {
  const draft = {
    from: "chair@columbia.edu",
    bcc: ["ada@columbia.edu", "grace@columbia.edu"],
    subject: "GSBS Weekly",
    body: "Hi all",
  };

  it("opens a compose window addressed to the sender", () => {
    const url = buildGmailUrl(draft);
    assert.ok(url.startsWith("https://mail.google.com/mail/?"));
    assert.ok(url.includes("view=cm"));
    assert.ok(url.includes("to=chair%40columbia.edu"));
  });

  it("carries the same Bcc list as the mailto link", () => {
    assert.ok(buildGmailUrl(draft).includes("bcc=ada%40columbia.edu,grace%40columbia.edu"));
  });

  it("uses Gmail's own subject parameter", () => {
    assert.ok(buildGmailUrl(draft).includes("su=GSBS%20Weekly"));
  });
});

describe("toAddressList", () => {
  it("joins addresses the way a mail client's Bcc field expects", () => {
    assert.equal(toAddressList(["a@columbia.edu", "b@columbia.edu"]), "a@columbia.edu, b@columbia.edu");
  });
});
