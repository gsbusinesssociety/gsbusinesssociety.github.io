'use client';

import Link from 'next/link';

const programs = [
  {
    label: 'Site Visits',
    description:
      'Behind-the-scenes access to firms like the NYSE trading floor and Insight Partners — the kind of rooms most undergrads never see.',
  },
  {
    label: 'Speaker & Recruiting Events',
    description:
      'Direct conversations with professionals from McKinsey, Morgan Stanley, and beyond, focused on how to actually break in.',
  },
  {
    label: 'Panel Discussions',
    description:
      "Honest conversations about non-traditional paths into finance, consulting, and business — with people who've been there.",
  },
];

export default function WhatWeDo() {
  return (
    <section className="pt-32 pb-36 bg-[var(--background)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">

        {/* Opening statement — carries the page since there's no hero */}
        <div className="max-w-2xl mb-24">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--columbia-blue)] mb-7">
            GS Business Society
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-[var(--foreground)] leading-[1.1] mb-8">
            Built for students who didn't take the straight road.
          </h1>
          <p className="text-[var(--accent-grey)] text-[15px] md:text-base leading-relaxed">
            GS students come from every kind of background — veterans, career changers, transfer students, working professionals. GSBS exists to give that community the access, connections, and professional foundation that the traditional path assumes you already have.
          </p>
        </div>

        {/* Program cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {programs.map((p) => (
            <div
              key={p.label}
              className="border border-gray-100 dark:border-gray-800 rounded-xl p-9 hover:border-[var(--columbia-blue)]/25 hover:shadow-[0_4px_24px_0_rgba(0,114,206,0.05)] transition-all duration-300 bg-[var(--background)]"
            >
              <h3 className="font-serif text-xl text-[var(--foreground)] mb-4">
                {p.label}
              </h3>
              <p className="text-sm text-[var(--accent-grey)] leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 bg-[#0072CE] hover:bg-[#005da8] text-white font-semibold text-sm px-6 py-3 rounded-lg transition-all duration-200 shadow-sm active:scale-[0.99]"
          >
            See upcoming events
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent-grey)] hover:text-[var(--foreground)] transition-colors duration-200"
          >
            Partner with us
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}