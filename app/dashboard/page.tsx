"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { ClipboardList, Download, LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import ApplicantTracker from "../components/dashboard/ApplicantTracker";
import AdminPanel, { type ContactMessage } from "../components/dashboard/AdminPanel";
import { downloadCsv, downloadXlsx } from "../lib/exportRows";
import { getRecruitmentConfig } from "../lib/applications";
import { withTimeout } from "../lib/firestoreTimeout";
import { roleOf, type DirectoryEntry } from "../lib/emailList";

// Columbia's network forces Firestore onto long-polling, so reads are slow
// rather than broken far more often than not. See app/lib/firestoreTimeout.ts.
const READ_TIMEOUT_MS = 10000;

const FIELD_CLASS =
  "w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-3 " +
  "focus:outline-none focus:border-[var(--columbia-blue-light)] text-black dark:text-white text-sm " +
  "placeholder:text-black/30 dark:placeholder:text-white/20 rounded-xl transition-all shadow-inner";

export default function DashboardPage() {
  const { user, loading, isAdmin, isBoard, userRole, authError, retry, signOut } = useAuth();
  const router = useRouter();

  const [members, setMembers] = useState<DirectoryEntry[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [fetching, setFetching] = useState(true);

  // Which recruiting cycle the tracker shows. Lives in Firestore so the board can
  // roll to a new season without a redeploy.
  const [cycle, setCycle] = useState<string | null>(null);

  const [profileMajor, setProfileMajor] = useState("");
  const [profileGradYear, setProfileGradYear] = useState("");
  const [profileLinkedIn, setProfileLinkedIn] = useState("");
  const [profileResume, setProfileResume] = useState("");
  const [profileStatus, setProfileStatus] = useState<"idle" | "loading" | "success">("idle");

  const email = (user?.email ?? "").toLowerCase().trim();
  // Recruiters read the directory for the resume book; admins for the email list
  // and the whitelist. Plain members have no use for it.
  const needsDirectory = isAdmin || userRole === "recruiter";

  useEffect(() => {
    if (loading) return;
    // An unresolved role is not the same as being signed out — it gets an
    // explanation and a retry below rather than a bounce to the login screen.
    if (authError) return;
    if (!user) {
      router.push("/login");
      return;
    }
    // Applicants are signed in but have no membership record and no dashboard.
    if (userRole === "applicant") {
      router.push("/apply");
    }
  }, [user, userRole, authError, loading, router]);

  useEffect(() => {
    if (!isBoard) return;
    let cancelled = false;
    getRecruitmentConfig()
      .then((config) => {
        if (!cancelled) setCycle(config?.cycle ?? null);
      })
      .catch((err) => console.error("Could not load recruitment config", err));
    return () => {
      cancelled = true;
    };
  }, [isBoard]);

  useEffect(() => {
    if (!email) return;
    let cancelled = false;

    const load = async () => {
      // Each read gets its own deadline; one slow collection should not eat the
      // budget of the next.
      try {
        const own = await withTimeout(getDoc(doc(db, "members", email)), READ_TIMEOUT_MS);
        if (!cancelled && own.exists()) {
          const data = own.data();
          setProfileMajor(data.major || "");
          setProfileGradYear(data.gradYear || "");
          setProfileLinkedIn(data.linkedIn || "");
          setProfileResume(data.resumeLink || "");
        }
      } catch (err) {
        console.error("Could not load your profile", err);
      }

      if (needsDirectory) {
        try {
          const snap = await withTimeout(getDocs(collection(db, "members")), READ_TIMEOUT_MS);
          if (!cancelled) {
            setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DirectoryEntry));
          }
        } catch (err) {
          console.error("Could not load the directory", err);
        }
      }

      if (isAdmin) {
        try {
          const snap = await withTimeout(
            getDocs(collection(db, "contact_messages")),
            READ_TIMEOUT_MS
          );
          if (!cancelled) {
            setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ContactMessage));
          }
        } catch (err) {
          console.error("Could not load contact messages", err);
        }
      }

      if (!cancelled) setFetching(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [email, isAdmin, needsDirectory]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setProfileStatus("loading");
    try {
      await setDoc(
        doc(db, "members", email),
        {
          major: profileMajor,
          gradYear: profileGradYear,
          linkedIn: profileLinkedIn,
          resumeLink: profileResume,
        },
        { merge: true }
      );
      setProfileStatus("success");
      setTimeout(() => setProfileStatus("idle"), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setProfileStatus("idle");
    }
  };

  const resumeBook = members.filter((m) => roleOf(m) === "member");

  const formatDataForExport = () =>
    resumeBook.map((m) => ({
      Name: m.name || "N/A",
      Email: m.email || m.id || "",
      Major: (m as { major?: string }).major || "-",
      "Grad Year": (m as { gradYear?: string }).gradYear || "-",
      LinkedIn: (m as { linkedIn?: string }).linkedIn || "",
      "Resume Link": (m as { resumeLink?: string }).resumeLink || "",
    }));

  const handleExportCSV = () => {
    const data = formatDataForExport();
    if (data.length === 0) return alert("No data to export");
    downloadCsv(data, "gsbs_resume_book.csv");
  };

  const handleExportExcel = () => {
    const data = formatDataForExport();
    if (data.length === 0) return alert("No data to export");
    downloadXlsx(data, "Resume Book", "gsbs_resume_book.xlsx");
  };

  if (!loading && authError) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="glass-panel p-10 rounded-2xl w-full max-w-md text-center">
          <h1 className="font-serif text-2xl mb-3 text-[var(--foreground)]">
            {authError.retryable ? "We couldn't load your access" : "Access unavailable"}
          </h1>
          <p className="text-[var(--accent-grey)] text-sm mb-8">{authError.message}</p>
          <div className="flex flex-col gap-3">
            {authError.retryable && (
              <button
                onClick={retry}
                className="w-full bg-[var(--foreground)] text-[var(--background)] font-semibold text-sm py-3 rounded-xl transition-opacity hover:opacity-90"
              >
                Try again
              </button>
            )}
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-[var(--accent-grey)] hover:text-black dark:hover:text-white font-medium text-sm py-3 rounded-xl transition-all"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || fetching || !user || userRole === "applicant") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex space-x-2">
          <div className="w-3 h-3 bg-[var(--columbia-blue)] rounded-full"></div>
          <div className="w-3 h-3 bg-[var(--columbia-blue)] rounded-full animation-delay-200"></div>
          <div className="w-3 h-3 bg-[var(--columbia-blue)] rounded-full animation-delay-400"></div>
        </div>
      </div>
    );
  }

  const header = (title: string) => (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-6">
      <div>
        <h1 className="font-serif text-4xl text-[var(--foreground)] mb-2">{title}</h1>
        <p className="text-[var(--accent-grey)]">Welcome back, {user.displayName || user.email}</p>
      </div>
      <button
        onClick={signOut}
        className="flex items-center gap-2 text-sm text-[var(--accent-grey)] hover:text-black dark:hover:text-white transition-colors glass-panel px-4 py-2 rounded-lg"
      >
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );

  if (userRole === "recruiter") {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 min-h-screen">
        {header("Recruiter Portal")}

        <div className="glass-panel p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-serif text-black dark:text-white">GSBS Resume Book</h2>
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white border border-black/10 dark:border-white/10 transition-colors"
              >
                <Download size={14} /> Export CSV
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
              >
                <Download size={14} /> Export Excel
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 text-[var(--columbia-blue)] dark:text-[var(--columbia-blue-light)] uppercase tracking-wider text-xs">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 px-4">Email</th>
                  <th className="pb-3 px-4">Major</th>
                  <th className="pb-3 px-4">Grad Year</th>
                  <th className="pb-3 px-4 text-right">Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm">
                {resumeBook.map((m) => {
                  const profile = m as DirectoryEntry & {
                    major?: string;
                    gradYear?: string;
                    linkedIn?: string;
                    resumeLink?: string;
                  };
                  return (
                    <tr
                      key={m.id || m.email}
                      className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 pr-4 font-medium text-black dark:text-white">
                        {m.name || "N/A"}
                      </td>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                        {m.email || m.id}
                      </td>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                        {profile.major || "-"}
                      </td>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                        {profile.gradYear || "-"}
                      </td>
                      <td className="py-4 px-4 text-right space-x-3">
                        {profile.linkedIn ? (
                          <a
                            href={profile.linkedIn}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[var(--columbia-blue)] dark:text-[var(--columbia-blue-light)] hover:text-black dark:hover:text-white transition-colors"
                          >
                            LinkedIn
                          </a>
                        ) : (
                          <span className="text-gray-500">No LinkedIn</span>
                        )}
                        {profile.resumeLink ? (
                          <a
                            href={profile.resumeLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 dark:text-emerald-400 hover:text-black dark:hover:text-white transition-colors"
                          >
                            Resume
                          </a>
                        ) : (
                          <span className="text-gray-500">No Resume</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {resumeBook.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 min-h-screen">
      {header("Member Dashboard")}

      {/* My Profile — every member, including admins and board */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 dark:text-blue-400">
            <User size={20} />
          </div>
          <h2 className="text-2xl font-serif">My Profile</h2>
        </div>
        <div className="glass-panel p-6 rounded-xl max-w-3xl">
          <p className="text-[14px] text-[var(--accent-grey)] mb-6 font-light">
            Keep your profile updated. This information is shared securely with our partner
            recruiters in the GSBS Resume Book.
          </p>
          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={profileMajor}
              onChange={(e) => setProfileMajor(e.target.value)}
              placeholder="Major"
              className={FIELD_CLASS}
            />
            <input
              type="text"
              value={profileGradYear}
              onChange={(e) => setProfileGradYear(e.target.value)}
              placeholder="Graduation year"
              className={FIELD_CLASS}
            />
            <input
              type="url"
              value={profileLinkedIn}
              onChange={(e) => setProfileLinkedIn(e.target.value)}
              placeholder="LinkedIn URL"
              className={FIELD_CLASS}
            />
            <input
              type="url"
              value={profileResume}
              onChange={(e) => setProfileResume(e.target.value)}
              placeholder="Resume link (Google Drive, Dropbox…)"
              className={FIELD_CLASS}
            />
            <div className="md:col-span-2 flex items-center gap-4">
              <button
                type="submit"
                disabled={profileStatus === "loading"}
                className="bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-semibold text-sm px-6 py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {profileStatus === "loading" ? "Saving…" : "Save profile"}
              </button>
              {profileStatus === "success" && (
                <span className="text-sm text-emerald-600 dark:text-emerald-400">Saved.</span>
              )}
            </div>
          </form>
        </div>
      </motion.div>

      {/* Recruiting tracker — admins and board reviewers, never recruiters */}
      {isBoard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <div className="flex items-center gap-3 mb-6">
            <ClipboardList className="text-[var(--columbia-blue)] dark:text-[var(--columbia-blue-light)]" size={20} />
            <h2 className="text-2xl font-serif">Recruiting</h2>
          </div>
          {cycle ? (
            <ApplicantTracker
              cycle={cycle}
              reviewerEmail={email}
              reviewerName={user.displayName || user.email || "Board member"}
            />
          ) : (
            <div className="glass-panel p-6 rounded-xl">
              <p className="text-[var(--foreground)] text-sm mb-1">No recruiting cycle configured.</p>
              <p className="text-[var(--accent-grey)] text-sm">
                An admin needs to create the{" "}
                <code className="text-[var(--foreground)]">config/recruitment</code> document in
                Firebase before applications can be opened or tracked.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {isAdmin && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <AdminPanel
            members={members}
            messages={messages}
            currentUserEmail={email}
            onMemberAdded={(member) =>
              setMembers((prev) => [...prev.filter((m) => m.id !== member.id), member])
            }
          />
        </motion.div>
      )}
    </div>
  );
}
