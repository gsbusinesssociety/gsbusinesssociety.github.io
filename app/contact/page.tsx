'use client';

import React, { useState } from 'react';

export default function ContactPage() {
    const [copied, setCopied] = useState(false);

const handleCopyEmail = async () => {
  try {
    await navigator.clipboard.writeText('gsbs@columbia.edu');
    setCopied(true);
    // Reset the "Copied" message after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    console.error('Failed to copy!', err);
  }
};
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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
    <main className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="py-20 bg-[#fafafa] border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-serif text-4xl md:text-5xl text-[#333333] mb-6">
            Let&apos;s Connect.
          </h1>
          <p className="text-[#6D6E71] text-lg max-w-2xl leading-relaxed">
            Whether you&apos;re looking to recruit talent, discuss a partnership, or simply learn more about the GS Business Society, we look forward to hearing from you.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
          
          {/* LEFT COLUMN: QUICK LINKS */}
<div>
  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C4D8E2] mb-4">Direct</h3>
  
  <div 
    className="inline-block cursor-pointer group" 
    onClick={handleCopyEmail}
  >
    {/* The actual Email Address */}
    <p className="text-[#333333] text-lg group-hover:text-[#C4D8E2] transition-colors duration-300">
      gsbs@columbia.edu
    </p>
    
    {/* The Dynamic Label: This area swaps between "Click to copy" and "Copied!" */}
    <div className="h-5 mt-1 overflow-hidden">
      <p className={`text-[10px] uppercase tracking-widest font-bold transition-all duration-300 ${
        copied 
          ? 'text-[#C4D8E2] translate-y-0 opacity-100' 
          : 'text-gray-400 -translate-y-full opacity-0'
      }`}>
        Copied to clipboard
      </p>
      
      <p className={`text-[10px] uppercase tracking-widest font-medium text-gray-400 transition-all duration-300 ${
        copied 
          ? 'translate-y-full opacity-0' 
          : 'translate-y-[-100%] opacity-100 group-hover:text-[#333333]'
      }`}>
      </p>
    </div>
  </div>  
</div>          {/* RIGHT COLUMN: THE FORM */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#333333]">Name</label>
                  <input 
                    name="name"
                    required 
                    type="text" 
                    placeholder="Jane Doe"
                    className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-[#C4D8E2] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#333333]">Organization</label>
                  <input 
                    name="organization"
                    type="text" 
                    placeholder="Company Name"
                    className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-[#C4D8E2] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#333333]">Email Address</label>
                <input 
                  name="email"
                  required 
                  type="email" 
                  placeholder="name@company.com"
                  className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-[#C4D8E2] transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#333333]">Inquiry Type</label>
                <select 
                  name="subject"
                  className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-[#C4D8E2] bg-transparent transition-colors appearance-none"
                >
                  <option>Recruitment & Talent</option>
                  <option>Corporate Partnership</option>
                  <option>Speaking Opportunity</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#333333]">Message</label>
                <textarea 
                  name="message"
                  required 
                  rows={4}
                  placeholder="How can we help you?"
                  className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-[#C4D8E2] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#333333] hover:bg-[#C4D8E2] text-white font-bold py-5 px-10 transition-all uppercase tracking-[0.3em] text-xs disabled:opacity-50"
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>

              {status === 'success' && (
                <p className="text-green-600 text-sm font-serif italic text-center animate-pulse">
                  Thank you. Your message has been sent.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}