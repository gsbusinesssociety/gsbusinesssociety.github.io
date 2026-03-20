'use client';

import React, { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch("https://formspree.io/f/xdaleqqe", {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <section id="newsletter" className="py-24 bg-[var(--background)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">

          {/* LEFT — Copy */}
          <div className="space-y-5">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--columbia-blue)]">
              Newsletter
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-[var(--foreground)] leading-tight">
              Stay close to the community.
            </h2>
            <p className="text-[var(--accent-grey)] text-[15px] leading-relaxed max-w-sm">
              Members receive early access to event invitations, RSVP links, and post-event recaps — along with occasional spotlights on people doing interesting work.
            </p>

            <ul className="pt-2 space-y-3">
              {[
                'Upcoming events & RSVP links',
                'Member and alumni spotlights',
                'Recaps from recent programming',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[var(--accent-grey)]">
                  <span className="mt-[6px] shrink-0 w-1 h-1 rounded-full bg-[var(--columbia-blue)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email-field" className="block text-xs font-medium text-[var(--foreground)] mb-2 tracking-wide">
                  Email address
                </label>
                <input
                  id="email-field"
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="uni@columbia.edu"
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 text-[var(--foreground)] text-sm rounded-lg focus:outline-none focus:border-[var(--columbia-blue)] focus:ring-2 focus:ring-[var(--columbia-blue)]/10 transition-all placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="relative w-full bg-[#0072CE] hover:bg-[#005da8] active:scale-[0.99] text-white font-semibold py-3.5 px-6 rounded-lg text-sm transition-all duration-200 disabled:opacity-70 shadow-sm"
              >
                <span className={`transition-opacity duration-200 ${status === 'loading' ? 'opacity-0' : 'opacity-100'}`}>
                  Subscribe
                </span>
                {status === 'loading' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
              </button>

              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                No spam. Unsubscribe at any time.
              </p>

              <div className="h-6">
                {status === 'success' && (
                  <p className="text-[var(--columbia-blue)] font-serif italic text-[15px] animate-in fade-in slide-in-from-bottom-1 duration-400">
                    You're on the list.
                  </p>
                )}
                {status === 'error' && (
                  <p className="text-red-500 dark:text-red-400 text-sm animate-in fade-in duration-300">
                    Something went wrong — please try again.
                  </p>
                )}
              </div>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}