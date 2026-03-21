'use client';

import React, { useState } from 'react';

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
      const response = await fetch("https://formspree.io/f/mkovrjyo", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setStatus('success');
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-32">

        {/* ── EYEBROW + HEADLINE ───────────────────────────────────────── */}
        <div className="mb-20">
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--columbia-blue)] mb-8">
            Contact
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-[var(--foreground)] leading-[1.08]">
            Get in touch.
          </h1>
        </div>

        {/* ── SPLIT ───────────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-20 md:gap-32 items-start">

          {/* LEFT — direct contact */}
          <div className="space-y-8">
            <div className="space-y-4 text-[15px] leading-[1.8]">
              <p className="text-[var(--accent-grey)]">
                The fastest way to reach us is directly.
              </p>
              <div>
                <button
                  onClick={handleCopyEmail}
                  className="font-semibold text-[var(--foreground)] hover:text-[var(--columbia-blue)] transition-colors duration-200"
                >
                  partner@columbiagsbs.com
                </button>
                {copied && (
                  <p className="text-[11px] text-[var(--columbia-blue)] mt-1">copied to clipboard</p>
                )}
              </div>
            </div>

            <p className="text-[var(--accent-grey)] text-sm leading-relaxed">
              Every message is read by the board. Depending on your inquiry, the right person will reach out directly. We aim to respond to all messages within 3–5 business days.
            </p>
          </div>

          {/* RIGHT — form */}
          <form onSubmit={handleSubmit} className="space-y-10">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--foreground)]">Name*</label>
                <input
                  name="name"
                  required
                  type="text"
                  placeholder="Jane Doe"
                  className="w-full border-b border-gray-200 dark:border-gray-700 bg-transparent py-2.5 focus:outline-none focus:border-[var(--columbia-blue)] text-[var(--foreground)] text-sm placeholder:text-gray-400 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--foreground)]">Organization</label>
                <input
                  name="organization"
                  type="text"
                  placeholder="Company or institution"
                  className="w-full border-b border-gray-200 dark:border-gray-700 bg-transparent py-2.5 focus:outline-none focus:border-[var(--columbia-blue)] text-[var(--foreground)] text-sm placeholder:text-gray-400 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--foreground)]">Email Address*</label>
              <input
                name="email"
                required
                type="email"
                placeholder="name@company.com"
                className="w-full border-b border-gray-200 dark:border-gray-700 bg-transparent py-2.5 focus:outline-none focus:border-[var(--columbia-blue)] text-[var(--foreground)] text-sm placeholder:text-gray-400 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--foreground)]">Message*</label>
              <textarea
                name="message"
                required
                rows={5}
                placeholder="How can we help?"
                className="w-full border-b border-gray-200 dark:border-gray-700 bg-transparent py-2.5 focus:outline-none focus:border-[var(--columbia-blue)] text-[var(--foreground)] text-sm placeholder:text-gray-400 transition-colors resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex items-center gap-2 bg-[#0072CE] hover:bg-[#005da8] active:scale-[0.99] text-white font-semibold text-sm px-8 py-3.5 rounded-lg transition-all duration-200 shadow-sm disabled:opacity-50"
              >
                {status === 'loading' ? 'Sending…' : 'Send message'}
                {status !== 'loading' && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>

              {status === 'success' && (
                <p className="mt-5 font-serif italic text-[var(--columbia-blue)] text-[15px]">
                  Message received. We'll be in touch shortly.
                </p>
              )}
              {status === 'error' && (
                <p className="mt-5 text-red-500 dark:text-red-400 text-sm">
                  Something went wrong. Please email us directly.
                </p>
              )}
            </div>

          </form>
        </div>

      </section>
    </main>
  );
}