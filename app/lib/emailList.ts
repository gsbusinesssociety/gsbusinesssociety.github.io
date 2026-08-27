/**
 * Assembling the weekly all-members email.
 *
 * The site is a static export on GitHub Pages, so there is no server to send
 * from and no place to keep an API key. Instead the dashboard builds the
 * recipient list and hands a prefilled draft to whatever mail client the sender
 * already uses. Members go in Bcc so they never see each other's addresses; the
 * sender goes in To, so the send is addressed to a real mailbox and they keep a
 * copy in their own inbox.
 *
 * Everything here is a pure function so it can be tested without a browser —
 * see `tests/emailList.test.mjs`.
 */

export interface DirectoryEntry {
  /** Firestore doc ID, which is the lowercased email. */
  id?: string;
  email?: string;
  name?: string;
  role?: string;
}

/** Roles that can be picked as an audience, in the order the UI shows them. */
export const AUDIENCE_ROLES = ["member", "board", "admin", "recruiter"] as const;
export type AudienceRole = (typeof AUDIENCE_ROLES)[number];

export const AUDIENCE_LABELS: Record<AudienceRole, string> = {
  member: "Members",
  board: "Board",
  admin: "Admins",
  recruiter: "Recruiters",
};

/**
 * Recruiters are external hiring partners, not people in the society, so the
 * weekly note does not go to them unless someone deliberately ticks the box.
 */
export const DEFAULT_AUDIENCE: AudienceRole[] = ["member", "board", "admin"];

/**
 * A record with no `role` predates the field and is a plain member — the same
 * assumption the directory listing makes.
 */
export function roleOf(entry: DirectoryEntry): string {
  return (entry.role || "member").toLowerCase().trim();
}

function emailOf(entry: DirectoryEntry): string {
  return (entry.email || entry.id || "").toLowerCase().trim();
}

/**
 * Deliberately loose. This is here to drop blanks, placeholder rows and stray
 * display names that would otherwise poison an address header — not to
 * adjudicate RFC 5322. The mail client is the real judge.
 */
const EMAIL_SHAPE = /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[^\s@,;<>"]+$/;

export function isSendableAddress(value: string): boolean {
  return EMAIL_SHAPE.test(value);
}

/**
 * The Bcc list: every directory entry in one of the chosen roles, lowercased,
 * de-duplicated and sorted so the same audience always produces the same list.
 *
 * `exclude` keeps the sender out of their own Bcc — they are already on the To
 * line, and nobody wants the weekly note twice.
 */
export function collectRecipients(
  entries: DirectoryEntry[],
  audience: readonly string[],
  exclude: readonly string[] = []
): string[] {
  const wanted = new Set(audience);
  const skip = new Set(exclude.map((e) => e.toLowerCase().trim()));
  const found = new Set<string>();

  for (const entry of entries) {
    if (!wanted.has(roleOf(entry))) continue;
    const email = emailOf(entry);
    if (!isSendableAddress(email)) continue;
    if (skip.has(email)) continue;
    found.add(email);
  }

  return [...found].sort();
}

/** How many sendable addresses sit behind each role, for the audience toggles. */
export function countByRole(entries: DirectoryEntry[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const role of AUDIENCE_ROLES) {
    counts[role] = collectRecipients(entries, [role]).length;
  }
  return counts;
}

export interface Draft {
  /** The sender. Goes in To, so they keep their own copy of what went out. */
  from: string;
  bcc: string[];
  subject: string;
  body: string;
}

/**
 * RFC 6068: the commas that separate addresses are mailto syntax, so each
 * address is percent-encoded on its own and the separators are left bare.
 * Encoding the comma itself would make the whole list read as one address.
 * A bare comma is also legal in an https query string (RFC 3986 sub-delim),
 * so the same encoding serves the Gmail link.
 */
function encodeAddressList(addresses: string[]): string {
  return addresses.map(encodeURIComponent).join(",");
}

/**
 * `encodeURIComponent`, not `URLSearchParams` — the latter encodes a space as
 * `+`, which is a form-encoding convention. Mail clients do not undo it, so the
 * subject line arrives full of plus signs.
 */
function query(fields: Array<[string, string]>): string {
  return fields
    .filter(([, value]) => value !== "")
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

/** Opens the machine's default mail client (Apple Mail, Outlook, Thunderbird). */
export function buildMailtoUrl(draft: Draft): string {
  const params = query([
    ["bcc", encodeAddressList(draft.bcc)],
    ["subject", encodeURIComponent(draft.subject)],
    ["body", encodeURIComponent(draft.body)],
  ]);
  const to = encodeURIComponent(draft.from.toLowerCase().trim());
  return params ? `mailto:${to}?${params}` : `mailto:${to}`;
}

/**
 * Gmail's compose deep link. Worth offering alongside mailto because LionMail
 * is Gmail, and because a plain https URL survives a far longer Bcc list than
 * the handoff to a desktop mail client does.
 */
export function buildGmailUrl(draft: Draft): string {
  const params = query([
    ["view", "cm"],
    ["fs", "1"],
    ["to", encodeAddressList([draft.from.toLowerCase().trim()])],
    ["bcc", encodeAddressList(draft.bcc)],
    ["su", encodeURIComponent(draft.subject)],
    ["body", encodeURIComponent(draft.body)],
  ]);
  return `https://mail.google.com/mail/?${params}`;
}

/**
 * A `mailto:` handoff goes through the OS — on Windows that is a command line
 * capped near 2048 characters, and Safari has a limit of its own. Past this the
 * Bcc list is what gets cut, silently, which is exactly the failure nobody
 * notices until a week of members hear nothing.
 */
export const MAILTO_SAFE_LENGTH = 1900;

export function mailtoIsSafe(draft: Draft): boolean {
  return buildMailtoUrl(draft).length <= MAILTO_SAFE_LENGTH;
}

/**
 * Advisory only. Mail providers cap how many recipients one message may carry,
 * and the cap varies by account type, so this is a "go check before you rely on
 * it" threshold rather than a limit this code can enforce.
 */
export const LARGE_SEND_THRESHOLD = 100;

/** The plain list, for pasting into a mail client or a mailing-list tool. */
export function toAddressList(recipients: string[]): string {
  return recipients.join(", ");
}
