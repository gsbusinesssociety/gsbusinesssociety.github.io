"use client";

import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Force account selection to allow user to pick Columbia email
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      // Restrict to @columbia.edu
      if (email && !email.endsWith("@columbia.edu")) {
        await auth.signOut();
        setError("Please sign in with your @columbia.edu email address.");
        return;
      }

      // Check if they are an approved member
      if (email) {
        const memberDoc = await getDoc(doc(db, "members", email));
        if (!memberDoc.exists()) {
          await auth.signOut();
          setError("Your account is not on the approved members list. Please contact the club admins.");
          return;
        }
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.");
    }
  };

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
          Access exclusive insights, interview tips, and monthly newsletters.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-[var(--foreground)] text-[var(--background)] hover:bg-gray-200 font-semibold py-3.5 px-4 rounded-xl transition-all duration-200"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Columbia Email
        </button>
      </motion.div>
    </div>
  );
}
