'use client';

import React, { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Replace 'YOUR_FORMSPREE_ID' with the actual ID from your Formspree dashboard
      const response = await fetch("https://formspree.io/f/xdaleqqe", {
        method: 'POST',
        body: JSON.stringify({ email: email }),
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json' 
        },
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        // Formspree returns error details in JSON
        const data = await response.json();
        console.error(data);
        setStatus('error');
      }
    } catch (err) {
      console.error("Submission error:", err);
      setStatus('error');
    }
  };

  return (
    <section id="newsletter" className="py-24 bg-white flex justify-center">
      <div className="w-full max-w-[600px] px-6 text-center">
        <form onSubmit={handleSubmit} className="space-y-6">
          <header className="mb-8">
            <h2 className="font-serif text-3xl md:text-4xl text-[#333333] mb-3">
              subscribe
            </h2>
            <div className="text-[#6D6E71] text-sm md:text-base leading-relaxed">
              <p>Sign up with your email address to receive news and updates.</p>
            </div>
          </header>

          <div className="flex flex-col items-center gap-6">
            <div className="w-full text-left">
              <label 
                htmlFor="email-field" 
                className="block text-sm font-medium text-[#333333] mb-2"
              >
                Email Address
              </label>
              <input
                id="email-field"
                type="email"
                name="email" // Formspree uses the 'name' attribute to identify fields
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="uni@Columbia.edu"
                className="w-full px-4 py-4 bg-[#fafafa] border border-gray-200 focus:outline-none focus:border-[#C4D8E2] transition-colors placeholder:text-gray-400"
              />
            </div>

            <div className="w-full">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full md:w-auto min-w-[140px] bg-[#C4D8E2] hover:bg-[#A9C4D1] text-white font-bold py-4 px-10 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
              >
                {status === 'loading' ? 'Sending...' : 'Sign Up'}
              </button>
            </div>
          </div>

          <div className="mt-8 pt-4">
            {status === 'success' && (
              <div className="text-[#C4D8E2] font-serif text-lg italic animate-pulse">
                Thank you!
              </div>
            )}
            {status === 'error' && (
              <div className="text-red-400 text-sm">
                Oops! Something went wrong. Please try again.
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}