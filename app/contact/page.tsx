'use client';

import React, { useState } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('partner@columbiagsbs.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await addDoc(collection(db, 'contact_messages'), {
        ...data,
        createdAt: serverTimestamp(),
      });
      setStatus('success');
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error("Error sending message:", err);
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen transition-colors duration-500 pb-32 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[var(--columbia-blue)] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none"></div>

      <section className="max-w-7xl mx-auto px-6 pt-32 pb-32 relative z-10">

        {/* ── SPLIT ───────────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-20 md:gap-32 items-start">

          {/* LEFT — direct contact */}
          <div className="space-y-8">
            <div className="space-y-4 text-[16px] leading-[1.8]">
              <p className="text-[var(--accent-grey)] font-light">
                The fastest way to reach us is directly.
              </p>
              <div>
                <button
                  onClick={handleCopyEmail}
                  className="font-serif text-2xl text-black dark:text-white hover:text-[var(--columbia-blue-light)] transition-colors duration-300"
                >
                  partner@columbiagsbs.com
                </button>
                <div className="h-4 mt-1">
                  {copied && (
                    <p className="text-[11px] text-[var(--columbia-blue-light)]">
                      copied to clipboard
                    </p>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[var(--accent-grey)] text-[15px] leading-relaxed font-light">
              Every message is read by the board. Depending on your inquiry, the right person will reach out directly. We aim to respond to all messages within 3–5 business days.
            </p>
          </div>

          {/* RIGHT — form */}
          <div>
            <form onSubmit={handleSubmit} className="glass-panel p-8 md:p-12 rounded-3xl space-y-10 relative">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-grey)]">Name*</label>
                  <input
                    name="name"
                    required
                    type="text"
                    placeholder="Jane Doe"
                    className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-2 focus:outline-none focus:border-[var(--columbia-blue-light)] text-black dark:text-white text-sm placeholder:text-black dark:text-white/20 transition-colors"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-grey)]">Organization</label>
                  <input
                    name="organization"
                    type="text"
                    placeholder="Company or institution"
                    className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-2 focus:outline-none focus:border-[var(--columbia-blue-light)] text-black dark:text-white text-sm placeholder:text-black dark:text-white/20 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-grey)]">Email Address*</label>
                <input
                  name="email"
                  required
                  type="email"
                  placeholder="name@company.com"
                  className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-2 focus:outline-none focus:border-[var(--columbia-blue-light)] text-black dark:text-white text-sm placeholder:text-black dark:text-white/20 transition-colors"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-grey)]">Message*</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="How can we help?"
                  className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-2 focus:outline-none focus:border-[var(--columbia-blue-light)] text-black dark:text-white text-sm placeholder:text-black dark:text-white/20 transition-colors resize-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="group inline-flex items-center justify-center gap-2 w-full bg-white text-black hover:bg-gray-200 font-semibold text-sm px-8 py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                  {status !== 'loading' && (
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </button>

                <div className="h-6 mt-4 text-center">
                  {status === 'success' && (
                    <p className="font-serif italic text-[var(--columbia-blue-light)] text-[15px]">
                      Message received. We'll be in touch shortly.
                    </p>
                  )}
                  {status === 'error' && (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      Something went wrong. Please email us directly.
                    </p>
                  )}
                </div>
              </div>

            </form>
          </div>
        </div>

      </section>
    </main>
  );
}