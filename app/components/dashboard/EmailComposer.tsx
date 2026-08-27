"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Copy, Mail, Send, TriangleAlert } from "lucide-react";
import {
  AUDIENCE_LABELS,
  AUDIENCE_ROLES,
  DEFAULT_AUDIENCE,
  LARGE_SEND_THRESHOLD,
  buildGmailUrl,
  buildMailtoUrl,
  collectRecipients,
  countByRole,
  mailtoIsSafe,
  toAddressList,
  type AudienceRole,
  type DirectoryEntry,
} from "../../lib/emailList";

interface EmailComposerProps {
  members: DirectoryEntry[];
  /** Goes in To, so the sender keeps a copy and the message has a real addressee. */
  senderEmail: string;
}

const FIELD_CLASS =
  "w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-3 " +
  "focus:outline-none focus:border-[var(--columbia-blue-light)] text-black dark:text-white text-sm " +
  "placeholder:text-black/30 dark:placeholder:text-white/20 rounded-xl transition-all shadow-inner";

/**
 * Composes the weekly note to the society and hands it to the sender's own mail
 * client with every member in Bcc. Nothing is sent from here — the last step is
 * always a human pressing send in Gmail or Mail, which is both the only option
 * on a static site and a useful place to catch a mistake.
 */
export default function EmailComposer({ members, senderEmail }: EmailComposerProps) {
  const [audience, setAudience] = useState<AudienceRole[]>(DEFAULT_AUDIENCE);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);
  const [showList, setShowList] = useState(false);

  const counts = useMemo(() => countByRole(members), [members]);
  // The sender is on the To line already, so they are dropped from Bcc rather
  // than receiving the same note twice.
  const recipients = useMemo(
    () => collectRecipients(members, audience, [senderEmail]),
    [members, audience, senderEmail]
  );

  const draft = { from: senderEmail, bcc: recipients, subject, body };
  const canSend = recipients.length > 0 && subject.trim().length > 0;
  const mailtoFits = mailtoIsSafe(draft);
  const isLargeSend = recipients.length > LARGE_SEND_THRESHOLD;

  const toggleRole = (role: AudienceRole) => {
    setAudience((current) =>
      current.includes(role) ? current.filter((r) => r !== role) : [...current, role]
    );
  };

  const openGmail = () => {
    window.open(buildGmailUrl(draft), "_blank", "noopener,noreferrer");
  };

  const openMailApp = () => {
    window.location.href = buildMailtoUrl(draft);
  };

  const copyAddresses = async () => {
    const list = toAddressList(recipients);
    try {
      await navigator.clipboard.writeText(list);
    } catch {
      // Clipboard access needs a secure context and can be refused outright.
      // Selecting the text by hand still beats losing the list.
      window.prompt("Copy the Bcc list:", list);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="glass-panel p-6 rounded-xl">
      <div className="flex items-center gap-3 mb-2">
        <Mail className="text-[var(--columbia-blue)] dark:text-[var(--columbia-blue-light)]" size={18} />
        <h3 className="font-semibold text-lg text-black dark:text-white">Email the Society</h3>
      </div>
      <p className="text-[14px] text-[var(--accent-grey)] mb-6 font-light">
        Write the note here, then open it in your mail client with everyone already in Bcc —
        members never see each other&apos;s addresses. You are on the To line, so a copy lands in
        your own inbox. Nothing sends until you press send yourself.
      </p>

      {/* Audience */}
      <div className="mb-5">
        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
          Who gets it
        </label>
        <div className="flex flex-wrap gap-2">
          {AUDIENCE_ROLES.map((role) => {
            const selected = audience.includes(role);
            const count = counts[role] ?? 0;
            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                disabled={count === 0}
                aria-pressed={selected}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  selected
                    ? "bg-[var(--columbia-blue-light)]/20 border-[var(--columbia-blue-light)]/50 text-[var(--foreground)]"
                    : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-[var(--accent-grey)] hover:bg-black/10 dark:hover:bg-white/10"
                }`}
              >
                {selected && <Check size={13} />}
                {AUDIENCE_LABELS[role]}
                <span className="opacity-60 font-normal">{count}</span>
              </button>
            );
          })}
        </div>
        {audience.includes("recruiter") && (
          <p className="text-[12px] text-amber-600 dark:text-amber-400 mt-2">
            Recruiters are external hiring partners — check that this note is meant for them.
          </p>
        )}
      </div>

      {/* Draft */}
      <div className="space-y-4">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject — e.g. GSBS Weekly: events, deadlines, one ask"
          className={FIELD_CLASS}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={9}
          placeholder={"Hi all,\n\nThree things this week:\n\n1. \n2. \n3. \n\nBest,\nGSBS"}
          className={`${FIELD_CLASS} resize-y font-light leading-relaxed`}
        />
      </div>

      {/* Summary */}
      <div className="mt-5 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm">
        <p className="text-[var(--accent-grey)]">
          <span className="text-black dark:text-white font-medium">To</span> {senderEmail || "you"}
          <span className="opacity-50"> — your copy</span>
        </p>
        <p className="text-[var(--accent-grey)] mt-1">
          <span className="text-black dark:text-white font-medium">Bcc</span>{" "}
          {recipients.length === 0 ? (
            <span className="text-amber-600 dark:text-amber-400">
              nobody selected — pick at least one group above
            </span>
          ) : (
            <>
              {recipients.length} {recipients.length === 1 ? "recipient" : "recipients"}, hidden from
              each other
              <button
                type="button"
                onClick={() => setShowList((s) => !s)}
                className="ml-2 inline-flex items-center gap-1 text-[var(--columbia-blue)] dark:text-[var(--columbia-blue-light)] hover:underline"
              >
                {showList ? "hide" : "review"}
                <ChevronDown size={12} className={showList ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>
            </>
          )}
        </p>
        {showList && recipients.length > 0 && (
          <div className="mt-3 max-h-40 overflow-y-auto rounded-lg bg-black/5 dark:bg-black/20 p-3 text-[12px] text-[var(--accent-grey)] leading-relaxed break-all">
            {toAddressList(recipients)}
          </div>
        )}
      </div>

      {/* Warnings */}
      {isLargeSend && (
        <p className="flex items-start gap-2 mt-3 text-[12px] text-amber-600 dark:text-amber-400">
          <TriangleAlert size={14} className="shrink-0 mt-0.5" />
          <span>
            {recipients.length} recipients on one message. Mail providers cap how many a single
            send may carry, and the cap depends on the account — worth confirming yours before you
            rely on this going out in one go.
          </span>
        </p>
      )}
      {!mailtoFits && recipients.length > 0 && (
        <p className="flex items-start gap-2 mt-3 text-[12px] text-amber-600 dark:text-amber-400">
          <TriangleAlert size={14} className="shrink-0 mt-0.5" />
          <span>
            This list is too long for the desktop <span className="font-mono">Mail app</span> handoff,
            which would truncate it without saying so. Use Gmail, or copy the addresses and paste
            them into Bcc yourself.
          </span>
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-5">
        <button
          type="button"
          onClick={openGmail}
          disabled={!canSend}
          className="flex items-center gap-2 bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-semibold text-sm px-5 py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <Send size={15} /> Open in Gmail
        </button>
        <button
          type="button"
          onClick={openMailApp}
          disabled={!canSend || !mailtoFits}
          className="flex items-center gap-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-black dark:text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Mail size={15} /> Open in Mail app
        </button>
        <button
          type="button"
          onClick={copyAddresses}
          disabled={recipients.length === 0}
          className="flex items-center gap-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-[var(--accent-grey)] hover:text-black dark:hover:text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "Copied" : "Copy addresses"}
        </button>
      </div>
      {!canSend && recipients.length > 0 && (
        <p className="text-[12px] text-[var(--accent-grey)] mt-3">Add a subject to continue.</p>
      )}
    </div>
  );
}
