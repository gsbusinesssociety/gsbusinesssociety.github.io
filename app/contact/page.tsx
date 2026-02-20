'use client';

import React, { useState } from 'react';

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('gsbs@columbia.edu');
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
      } else { setStatus('error'); }
    } catch (err) { setStatus('error'); }
  };

  return (
    <main className=" bg-[var(--background)] transition-colors duration-300">
      
      {/* 1. COMPACT HEADER */}
      {/* <header className="py-12 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="font-serif text-4xl text-[var(--foreground)]">Contact</h1>
        </div>
      </header> */}

      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* 2. LEFT COLUMN (3/12 space): INFO */}
          <div className="lg:col-span-4 space-y-12">
            <div>
              <h2 className="font-serif text-2xl text-[var(--foreground)] mb-4">Let&apos;s Connect</h2>
              <p className="text-[var(--accent-grey)] leading-relaxed font-serif italic text-sm">
                Whether you&apos;re looking to recruit talent or discuss a partnership, we look forward to hearing from you.
              </p>
            </div>

            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--columbia-blue)] mb-4">Direct Email</h3>
              <div className="cursor-pointer group" onClick={handleCopyEmail}>
                <p className="text-[var(--foreground)] text-lg group-hover:text-[var(--columbia-blue)] transition-colors">
                  gsbusinesssociety@gmail.com
                </p>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">
                  {copied ? 'Copied to clipboard' : 'Click to copy'}
                </p>
              </div>
            </div>

          </div>

          {/* 3. RIGHT COLUMN (8/12 space): THE FORM */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]">Name</label>
                  <input name="name" required type="text" placeholder="Jane Doe" className="w-full border-b border-gray-300 dark:border-gray-600 bg-transparent py-2 focus:outline-none focus:border-[var(--columbia-blue)] text-[var(--foreground)] text-sm transition-colors" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]">Organization</label>
                  <input name="organization" type="text" placeholder="Company Name" className="w-full border-b border-gray-300 dark:border-gray-600 bg-transparent py-2 focus:outline-none focus:border-[var(--columbia-blue)] text-[var(--foreground)] text-sm transition-colors" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]">Email Address</label>
                <input name="email" required type="email" placeholder="name@company.com" className="w-full border-b border-gray-300 dark:border-gray-600 bg-transparent py-2 focus:outline-none focus:border-[var(--columbia-blue)] text-[var(--foreground)] text-sm transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]">Inquiry</label>
                <select name="subject" className="w-full border-b border-gray-300 dark:border-gray-600 py-2 focus:outline-none focus:border-[var(--columbia-blue)] bg-transparent text-[var(--foreground)] text-sm transition-colors appearance-none">
                  <option className="bg-[var(--background)]">Recruitment & Talent</option>
                  <option className="bg-[var(--background)]">Corporate Partnership</option>
                  <option className="bg-[var(--background)]">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]">Message</label>
                <textarea name="message" required rows={4} placeholder="How can we help you?" className="w-full border-b border-gray-300 dark:border-gray-600 bg-transparent py-2 focus:outline-none focus:border-[var(--columbia-blue)] text-[var(--foreground)] text-sm transition-colors resize-none" />
              </div>

              <button type="submit" disabled={status === 'loading'} className="w-full bg-[#0072CE] hover:bg-[#005da8] text-white font-bold py-4 px-10 transition-all uppercase tracking-[0.2em] text-[10px] disabled:opacity-50">
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
              {status === 'success' && <p className="text-green-600 text-xs italic text-center animate-pulse">Message sent successfully.</p>}
            </form>
          </div>
        </div>
      </section>

      {/* 4. NEW FOOTER SECTION TO FILL SPACE but remove dead space */}
<section className="py-16 border-t border-gray-100 dark:border-gray-800">
  <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
    <div>
      <h4 className="font-serif text-xl text-[var(--foreground)] mb-3">Board Recruitment</h4>
      <p className="text-sm text-[var(--accent-grey)] leading-relaxed">
        Applications for Junior Board positions open in September and January. We review all applications carefully and aim to respond within two weeks of the deadline.
      </p>
    </div>
    <div>
      <h4 className="font-serif text-xl text-[var(--foreground)] mb-3">Corporate Partnerships</h4>
      <p className="text-sm text-[var(--accent-grey)] leading-relaxed">
        We offer companies direct access to Columbia's most driven business talent. Reach out for our recruitment prospectus and we'll follow up within 2–3 business days.
      </p>
    </div>
    <div>
      <h4 className="font-serif text-xl text-[var(--foreground)] mb-3">General Inquiries</h4>
      <p className="text-sm text-[var(--accent-grey)] leading-relaxed">
        For anything else — press, collaborations, or questions about our events — send us a message and a board member will get back to you shortly.
      </p>
    </div>
  </div>
</section>
    </main>
  );
}