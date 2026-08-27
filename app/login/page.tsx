"use client";

import { useEffect, useState } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebase/config";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState<null | "google" | "password">(null);
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [recruiterPassword, setRecruiterPassword] = useState("");
  const router = useRouter();

  // Domain checks, whitelist lookups and role resolution all live in AuthContext
  // so they hold for every entry point. This page only starts the sign-in and
  // reacts to whatever the context settles on.
  const { user, userRole, authError, loading } = useAuth();

  useEffect(() => {
    if (loading || !user || !userRole) return;
    router.push(userRole === "applicant" ? "/apply" : "/dashboard");
  }, [user, userRole, loading, router]);

  const handleGoogleSignIn = async () => {
    setFormError(null);
    setPending("google");
    try {
      const provider = new GoogleAuthProvider();
      // Force account selection so a personal Google session doesn't get reused.
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
      // Routing happens in the effect above once the role resolves.
    } catch (err) {
      setPending(null);
      const code = (err as { code?: string }).code;
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return;
      }
      setFormError(
        code === "auth/popup-blocked"
          ? "Your browser blocked the sign-in popup. Allow popups for this site and try again."
          : "Sign-in failed. Please try again."
      );
    }
  };

  const handleRecruiterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setPending("password");
    try {
      await signInWithEmailAndPassword(auth, recruiterEmail.trim(), recruiterPassword);
      // Authorization is decided by AuthContext; an account without a recruiter
      // record is turned away there.
    } catch (err) {
      setPending(null);
      const code = (err as { code?: string }).code;
      setFormError(
        code === "auth/too-many-requests"
          ? "Too many attempts. Please wait a few minutes and try again."
          : "Incorrect email or password."
      );
    }
  };

  const message = formError ?? authError?.message ?? null;
  // A rejection from AuthContext ends the attempt, so the button must not stay
  // stuck in its pending state waiting for a resolution that already failed.
  const busy = pending !== null && !authError;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-panel p-10 rounded-2xl w-full max-w-md text-center"
      >
        <h1 className="font-serif text-3xl mb-4 text-[var(--foreground)]">Member Login</h1>
        <p className="text-[var(--accent-grey)] mb-8 text-sm">
          Access monthly newsletters.
        </p>

        {message && (
          <div
            role="alert"
            className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6"
          >
            {message}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={busy}
          className="w-full flex items-center justify-center gap-3 bg-[var(--foreground)] text-[var(--background)] hover:bg-gray-200 font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {busy && pending === "google" ? "Signing in…" : "Sign in with Columbia Email"}
        </button>

        <div className="mt-10">
          <div className="relative flex items-center py-5">
            <div className="flex-grow border-t border-black/10 dark:border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-semibold uppercase tracking-wider text-[var(--accent-grey)]">For Recruiters</span>
            <div className="flex-grow border-t border-black/10 dark:border-white/10"></div>
          </div>

          <form onSubmit={handleRecruiterLogin} className="space-y-3">
            <input
              type="email"
              required
              autoComplete="email"
              value={recruiterEmail}
              onChange={(e) => setRecruiterEmail(e.target.value)}
              placeholder="Partner Email"
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-black dark:text-white text-sm rounded-xl transition-all"
            />
            <input
              type="password"
              required
              autoComplete="current-password"
              value={recruiterPassword}
              onChange={(e) => setRecruiterPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--columbia-blue-light)] text-black dark:text-white text-sm rounded-xl transition-all"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-[var(--accent-grey)] hover:text-black dark:hover:text-white font-medium text-sm py-3 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy && pending === "password" ? "Signing in…" : "Sign In to Recruiter Portal"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
