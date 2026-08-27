"use client";

import { useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Inbox, Mail, ShieldCheck, Users } from "lucide-react";
import { db } from "../../../firebase/config";
import { withTimeout } from "../../lib/firestoreTimeout";
import EmailComposer from "./EmailComposer";
import { AUDIENCE_LABELS, AUDIENCE_ROLES, roleOf, type DirectoryEntry } from "../../lib/emailList";

export interface ContactMessage {
  id?: string;
  name?: string;
  email?: string;
  organization?: string;
  message?: string;
  createdAt?: { seconds: number };
}

interface AdminPanelProps {
  members: DirectoryEntry[];
  messages: ContactMessage[];
  currentUserEmail: string;
  /** Lets the page show a new member immediately, without a round trip. */
  onMemberAdded: (member: DirectoryEntry) => void;
}

type Tab = "email" | "directory" | "inbox";

const WRITE_TIMEOUT_MS = 10000;

const FIELD_CLASS =
  "w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-3 " +
  "focus:outline-none focus:border-[var(--columbia-blue-light)] text-black dark:text-white text-sm " +
  "placeholder:text-black/30 dark:placeholder:text-white/20 rounded-xl transition-all shadow-inner";

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-[var(--columbia-blue-light)]/20 text-[var(--columbia-blue)] dark:text-[var(--columbia-blue-light)]",
  board: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  recruiter: "bg-purple-500/20 text-purple-500 dark:text-purple-400",
  member: "bg-black/10 dark:bg-white/10 text-gray-600 dark:text-gray-400",
};

export default function AdminPanel({
  members,
  messages,
  currentUserEmail,
  onMemberAdded,
}: AdminPanelProps) {
  // The weekly email is the recurring job, so it is what opens.
  const [tab, setTab] = useState<Tab>("email");

  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [roleInput, setRoleInput] = useState("member");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.toLowerCase().trim();
    if (!email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    try {
      await withTimeout(
        setDoc(doc(db, "members", email), {
          email,
          name: nameInput.trim(),
          role: roleInput,
          addedAt: serverTimestamp(),
          addedBy: currentUserEmail,
        }),
        WRITE_TIMEOUT_MS
      );
      onMemberAdded({ id: email, email, name: nameInput.trim(), role: roleInput });
      setStatus("success");
      setMessage(`${email} now has access.`);
      setEmailInput("");
      setNameInput("");
    } catch (err) {
      // A failed write means they are not on the list, so say so plainly rather
      // than showing them in the directory as if it had worked.
      console.error("Error adding member:", err);
      setStatus("error");
      setMessage("Could not save. Check your connection and try again.");
      return;
    }
    setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 5000);
  };

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: "email", label: "Email", icon: <Mail size={15} /> },
    { id: "directory", label: "Directory", icon: <Users size={15} />, badge: members.length },
    { id: "inbox", label: "Inbox", icon: <Inbox size={15} />, badge: messages.length },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
          <ShieldCheck size={20} />
        </div>
        <h2 className="text-2xl font-serif">Admin</h2>
      </div>

      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.id
                ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--accent-grey)] hover:text-black dark:hover:text-white"
            }`}
          >
            {t.icon}
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="text-[10px] opacity-60 font-normal">{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "email" && <EmailComposer members={members} senderEmail={currentUserEmail} />}

      {tab === "directory" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="font-semibold text-lg mb-2 text-black dark:text-white">Grant access</h3>
            <p className="text-[14px] text-[var(--accent-grey)] mb-6 font-light">
              Enter the exact Columbia address. Nobody can sign in until they appear here.
            </p>
            <form onSubmit={handleAddMember} className="space-y-4">
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Full name"
                className={FIELD_CLASS}
              />
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="student@columbia.edu"
                className={FIELD_CLASS}
              />
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                // Options are drawn by the OS and inherit the (translucent) field
                // background, which leaves white-on-white in one theme or the
                // other. Paint them from the theme tokens instead.
                className={`${FIELD_CLASS} [&>option]:bg-[var(--background)] [&>option]:text-[var(--foreground)]`}
              >
                <option value="member">Member</option>
                <option value="board">Board — reviews applications</option>
                <option value="admin">Admin</option>
                <option value="recruiter">Recruiter — external partner</option>
              </select>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-semibold text-sm px-6 py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {status === "loading" ? "Saving…" : "Add to directory"}
              </button>
              {message && (
                <p
                  className={`text-sm text-center ${
                    status === "error"
                      ? "text-red-600 dark:text-red-400"
                      : "text-[var(--columbia-blue)] dark:text-[var(--columbia-blue-light)]"
                  }`}
                >
                  {message}
                </p>
              )}
            </form>
          </div>

          <div className="glass-panel p-6 rounded-xl flex flex-col max-h-[520px]">
            <h3 className="font-semibold text-lg mb-4 text-black dark:text-white">
              Approved directory
            </h3>
            <div className="overflow-y-auto pr-2 flex-1 space-y-6">
              {members.length === 0 ? (
                <p className="text-sm text-[var(--accent-grey)] text-center mt-10">
                  Nobody in the directory yet.
                </p>
              ) : (
                AUDIENCE_ROLES.map((role) => {
                  const inRole = members.filter((m) => roleOf(m) === role);
                  if (inRole.length === 0) return null;
                  return (
                    <div key={role}>
                      <h4 className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2 border-b border-black/10 dark:border-white/10 pb-1">
                        {AUDIENCE_LABELS[role]}
                      </h4>
                      <div className="space-y-2">
                        {inRole.map((m) => (
                          <div
                            key={m.id || m.email}
                            className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors overflow-hidden"
                          >
                            <span className="min-w-0 flex-1">
                              {m.name && (
                                <span className="block text-sm text-black dark:text-white truncate">
                                  {m.name}
                                </span>
                              )}
                              <span className="block text-[12px] text-[var(--accent-grey)] truncate">
                                {m.email || m.id}
                              </span>
                            </span>
                            <span
                              className={`shrink-0 text-[10px] px-2 py-1 rounded-md uppercase font-semibold tracking-wider ${ROLE_BADGE[role]}`}
                            >
                              {role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "inbox" && (
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="font-semibold text-lg mb-4 text-black dark:text-white">
            Contact messages
          </h3>
          <div className="overflow-y-auto max-h-[520px] pr-2 space-y-4">
            {messages.length === 0 ? (
              <p className="text-sm text-[var(--accent-grey)] text-center py-6">No messages yet.</p>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className="p-4 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
                >
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="min-w-0">
                      <p className="text-black dark:text-white font-medium truncate">
                        {msg.name}{" "}
                        <span className="text-sm text-[var(--accent-grey)] font-normal">
                          ({msg.email})
                        </span>
                      </p>
                      {msg.organization && (
                        <p className="text-[12px] text-[var(--columbia-blue)] dark:text-[var(--columbia-blue-light)]">
                          {msg.organization}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-[10px] text-gray-500">
                      {msg.createdAt?.seconds
                        ? new Date(msg.createdAt.seconds * 1000).toLocaleDateString()
                        : "Just now"}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--accent-grey)] whitespace-pre-wrap">
                    {msg.message}
                  </p>
                  {msg.email && (
                    <a
                      href={`mailto:${encodeURIComponent(msg.email)}`}
                      className="inline-block mt-3 text-[12px] font-semibold text-[var(--columbia-blue)] dark:text-[var(--columbia-blue-light)] hover:underline"
                    >
                      Reply
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
