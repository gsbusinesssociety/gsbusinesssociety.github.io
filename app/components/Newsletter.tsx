'use client';

import React, { useState } from 'react';
import { db } from '../../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * The list is for Columbia students, and the security rules enforce that. This
 * has to agree with the `matches()` pattern on newsletter_subscribers in
 * firestore.rules — it exists so a non-Columbia address is told why it was
 * turned away, rather than being denied by the rules and landing in the generic
 * error branch, which would invite someone to retry an address that can never
 * work. A '/' cannot appear because doc() would read it as a path separator.
 */
const isColumbiaAddress = (address: string) =>
  /^[^@/]+@columbia\.edu$/.test(address);

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'not-columbia'>('idle');

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    // The doc ID is the address itself, so it has to be normalised the same way
    // every time or the same person lands in the list twice.
    const address = email.trim().toLowerCase();
    if (!isColumbiaAddress(address)) {
      setStatus('not-columbia');
      return;
    }

    setStatus('loading');

    try {
      // setDoc rather than addDoc so re-subscribing overwrites one's own record
      // instead of adding a duplicate. The rules allow this same-address rewrite
      // deliberately: it means a returning subscriber succeeds for real, and a
      // permission error below still means something is actually broken rather
      // than "you were already on the list".
      await setDoc(doc(db, 'newsletter_subscribers', address), {
        email: address,
        subscribedAt: serverTimestamp(),
      });

      setStatus('success');
      setEmail('');
    } catch (err) {
      console.error("Error subscribing:", err);
      setStatus('error');
    }
  };

  return (
    <section id="newsletter" className="py-32 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute bottom-0 left-[-10%] w-[400px] h-[400px] bg-[var(--columbia-blue)] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="glass-panel p-10 md:p-16 rounded-3xl grid md:grid-cols-2 gap-16 items-center">

          {/* LEFT — Copy */}
          <div className="space-y-6">
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[var(--columbia-blue-light)]">
              Newsletter
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-black dark:text-white leading-tight">
              Stay close to the community.
            </h2>
            <p className="text-[var(--accent-grey)] text-[15px] md:text-[16px] leading-relaxed max-w-sm font-light">
              Members receive early access to event invitations, RSVP links, and post-event recaps—along with occasional spotlights on people doing interesting work.
            </p>

            <ul className="pt-2 space-y-4">
              {[
                'Upcoming events & RSVP links',
                'Member and alumni spotlights',
                'Recaps from recent programming',
              ].map((item) => (
                <li key={item} className="flex items-center gap-4 text-[14px] text-black dark:text-white">
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--columbia-blue-light)] shadow-[0_0_8px_rgba(185,217,235,0.6)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="email-field" className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-grey)]">
                  Email Address
                </label>
                <input
                  id="email-field"
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="uni@columbia.edu"
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-4 focus:outline-none focus:border-[var(--columbia-blue-light)] text-black dark:text-white text-sm placeholder:text-black dark:placeholder:text-white/20 rounded-xl transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="group w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 font-semibold text-sm px-8 py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              >
                <span className={`transition-opacity duration-200 ${status === 'loading' ? 'opacity-0' : 'opacity-100'}`}>
                  Subscribe
                </span>
                {status === 'loading' ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                ) : (
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </button>

              <div className="flex justify-between items-center">
                <p className="text-[11px] text-black dark:text-white/40 font-light">
                  No spam. Unsubscribe at any time.
                </p>

                <div className="h-4">
                  {status === 'success' && (
                    <p className="text-[var(--columbia-blue-light)] font-serif italic text-[14px]">
                      You&apos;re on the list.
                    </p>
                  )}
                  {status === 'not-columbia' && (
                    <p className="text-red-600 dark:text-red-400 text-xs">
                      Columbia address required.
                    </p>
                  )}
                  {status === 'error' && (
                    <p className="text-red-600 dark:text-red-400 text-xs">
                      Error—please try again.
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}