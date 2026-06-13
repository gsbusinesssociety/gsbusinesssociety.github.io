'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '../../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--columbia-blue)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    
    try {
      // The Firestore Rules we set up will allow this write because the user's role is 'admin'
      const sanitizedEmail = email.toLowerCase().trim();
      await setDoc(doc(db, "members", sanitizedEmail), {
        email: sanitizedEmail,
        role: "member",
        addedAt: serverTimestamp(),
        addedBy: user?.email
      });
      
      setStatus('success');
      setMessage(`${sanitizedEmail} has been added to the whitelist!`);
      setEmail('');
      
      // Reset success message after a few seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
      
    } catch (err: any) {
      console.error("Error adding member:", err);
      setStatus('error');
      setMessage(err.message || 'Failed to add member. Check your Firestore rules.');
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-32 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--columbia-blue)] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.15] pointer-events-none"></div>

      <div className="max-w-2xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-10">
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[var(--columbia-blue-light)] mb-4">
              Internal System
            </p>
            <h1 className="font-serif text-4xl text-white leading-tight mb-2">
              Admin Dashboard
            </h1>
            <p className="text-[var(--accent-grey)] text-[15px]">
              Logged in as <span className="text-white font-medium">{user?.email}</span>
            </p>
          </div>

          <div className="glass-panel p-8 md:p-10 rounded-3xl">
            <h2 className="text-xl font-serif text-white mb-6">Whitelist a Member</h2>
            <p className="text-[14px] text-[var(--accent-grey)] mb-8 font-light">
              Enter the exact Columbia email address of the student. They will instantly be granted access to the Member Dashboard.
            </p>

            <form onSubmit={handleAddMember} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-grey)]">
                  Student Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@columbia.edu"
                  className="w-full bg-white/5 border border-white/10 px-4 py-3.5 focus:outline-none focus:border-[var(--columbia-blue-light)] text-white text-sm placeholder:text-white/20 rounded-xl transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 font-semibold text-sm px-8 py-3.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.98] disabled:opacity-50"
              >
                {status === 'loading' ? 'Processing...' : 'Approve Member'}
              </button>

              <div className="h-6 mt-2 text-center">
                {status === 'success' && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[var(--columbia-blue-light)] text-[14px]">
                    {message}
                  </motion.p>
                )}
                {status === 'error' && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-[14px]">
                    {message}
                  </motion.p>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
