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
    /* Change bg-white to var(--background) */
    <section id="newsletter" className="py-24 bg-[var(--background)] flex justify-center transition-colors duration-300">
      <div className="w-full max-w-[600px] px-6 text-center">
        <form onSubmit={handleSubmit} className="space-y-6">
          <header className="mb-8">
            <h2 className="font-serif text-3xl md:text-4xl text-[var(--foreground)] mb-3">
              Subscribe
            </h2>
            <p className="text-[var(--accent-grey)] text-sm md:text-base leading-relaxed">
              Sign up with your email address to receive news and updates.
            </p>
          </header>

          <div className="flex flex-col items-center gap-6">
            <div className="w-full text-left">
              <label htmlFor="email-field" className="block text-sm font-medium text-[var(--foreground)] mb-2">
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
                /* Improved input contrast and dark mode support */
                className="w-full px-4 py-4 bg-gray-50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 text-[var(--foreground)] focus:outline-none focus:border-[var(--columbia-blue)] transition-colors placeholder:text-gray-400"
              />
            </div>

            <div className="w-full">
              <button
                type="submit"
                disabled={status === 'loading'}
                /* FIX: Changed bg to the darker Columbia Blue variable for white text contrast */
                className="group relative w-full md:w-auto min-w-[160px] bg-[#0072CE] hover:bg-[#005da8] text-white font-bold py-4 px-10 transition-all uppercase tracking-widest text-xs disabled:opacity-70 overflow-hidden shadow-sm"
              >
                <span className={`flex items-center justify-center gap-2 transition-all duration-300 ${status === 'loading' ? 'opacity-0' : 'opacity-100'}`}>
                  Sign Up
                </span>
                
                {status === 'loading' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>

          <div className="h-8 transition-all duration-500">
            {status === 'success' && (
              /* FIX: Success text uses the darker blue variable for readability */
              <p className="text-[var(--columbia-blue)] font-serif text-lg italic animate-in fade-in slide-in-from-bottom-2 duration-500">
                Thank you! You&apos;ve been added to our list.
              </p>
            )}
            {status === 'error' && (
              <p className="text-red-600 dark:text-red-400 text-sm animate-in fade-in duration-300 font-medium">
                Something went wrong. Please try again.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}