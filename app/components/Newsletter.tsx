'use client';

import React, { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Use your actual Formspree ID here
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
    <section id="newsletter" className="py-24 bg-white flex justify-center">
      <div className="w-full max-w-[600px] px-6 text-center">
        <form onSubmit={handleSubmit} className="space-y-6">
          <header className="mb-8">
            <h2 className="font-serif text-3xl md:text-4xl text-[#333333] mb-3">
              Subscribe
            </h2>
            <p className="text-[#6D6E71] text-sm md:text-base leading-relaxed">
              Sign up with your email address to receive news and updates.
            </p>
          </header>

          <div className="flex flex-col items-center gap-6">
            <div className="w-full text-left">
              <label htmlFor="email-field" className="block text-sm font-medium text-[#333333] mb-2">
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
                className="w-full px-4 py-4 bg-[#fafafa] border border-gray-200 focus:outline-none focus:border-[#C4D8E2] transition-colors"
              />
            </div>

            <div className="w-full">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="group relative w-full md:w-auto min-w-[160px] bg-[#C4D8E2] hover:bg-[#A9C4D1] text-white font-bold py-4 px-10 transition-all uppercase tracking-widest text-xs disabled:opacity-70 overflow-hidden"
              >
                <span className={`flex items-center justify-center gap-2 transition-all duration-300 ${status === 'loading' ? 'opacity-0' : 'opacity-100'}`}>
                  Sign Up
                </span>
                
                {/* LOADING SPINNER */}
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

          {/* SUCCESS/ERROR MESSAGES */}
          <div className="h-8 transition-all duration-500">
            {status === 'success' && (
              <p className="text-[#C4D8E2] font-serif text-lg italic animate-in fade-in slide-in-from-bottom-2 duration-500">
                Thank you! You&apos;ve been added to our list.
              </p>
            )}
            {status === 'error' && (
              <p className="text-red-400 text-sm animate-in fade-in duration-300">
                Something went wrong. Please try again.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}