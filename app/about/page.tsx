"use client";

import React from 'react';
import Link from 'next/link';

const BOARD_MEMBERS = [
  { name: "Gavin Xue", role: "Founder and President", school: "GS '28", linkedin: "https://www.linkedin.com/in/gx2173", image: "/board/president.jpg" },
  { name: "Bayron Aguilar", role: "Founder and Vice President", school: "GS '29", linkedin: "https://linkedin.com/in/Bayron-Aguilar", image: "/board/vice-president1.jpeg" },
  { name: "Eren Yesiltepe", role: "Founder and Vice President", school: "GS '28", linkedin: "https://www.linkedin.com/in/erenyesiltepe/", image: "/board/vice-president2.jpeg" },

  { name: "Mehdi Shakibapour", role: "Head of Technology", school: "GS '27", linkedin: "https://linkedin.com/in/mehdisha", image: "/board/head-of-technology.png" },
  { name: "Noah Kim", role: "Head of Marketing", school: "GS '27", linkedin: "https://www.linkedin.com/in/noah-kim-4075772b0", image: "/board/head-of-marketing.jpeg" },
  { name: "Fatine Mohattane", role: "Head of Events", school: "GS '27", linkedin: "https://www.linkedin.com/in/fatinemohattane/", image: "/board/head-of-events.jpeg" },
  { name: "Tom Rosenzweig", role: "Head of Finance", school: "GS '28", linkedin: "https://www.linkedin.com/in/tom-rosenzweig-073219339/", image: "/board/head-of-finance.jpeg" },
  { name: "Gal Winter", role: "Co-head of Education", school: "GS '28", linkedin: "https://www.linkedin.com/in/galwinter/", image: "/board/head-of-education2.jpeg" },
  { name: "Julia Zhang", role: "Co-head of Education", school: "CC '28", linkedin: "https://www.linkedin.com/in/julia-zhang-2298a4354", image: "/board/head-of-education1.jpeg" },
  { name: "William Hamilton", role: "Co-head of Communication", school: "GS '30", linkedin: "https://www.linkedin.com/in/williamwesthamilton/", image: "/board/head-of-communications2.jpeg" },
];

const ALUMNI = [
  { name: "Thomas Ryder", role: "Co-head of Development", school: "Columbia Alumni '26", linkedin: "https://www.linkedin.com/in/tjr2162/", image: "/board/head-of-development1.jpeg" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen transition-colors duration-500 pb-32">
      
      {/* Glow effect behind header */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--columbia-blue)] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none"></div>

      {/* ── BOARD GRID ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-32 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {BOARD_MEMBERS.map((member, index) => (
            <a
              key={index}
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-center p-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/[0.03] transition-all duration-300"
            >
              {/* Photo */}
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-black/5 dark:bg-white/5 mb-5 grayscale group-hover:grayscale-0 ring-1 ring-black/10 dark:ring-white/10 group-hover:ring-[var(--columbia-blue-light)]/50 group-hover:shadow-[0_0_20px_rgba(185,217,235,0.2)] transition-all duration-500 group-hover:-translate-y-1">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name */}
              <p className="font-serif text-[16px] text-black dark:text-white leading-tight mb-1 group-hover:text-[var(--columbia-blue-light)] transition-colors duration-300">
                {member.name}
              </p>

              {/* Role */}
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--accent-grey)] leading-snug mb-1">
                {member.role}
              </p>

              {/* Class year */}
              <p className="text-[11px] text-[var(--accent-grey)] opacity-50 italic">
                {member.school}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* ── ALUMNI ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mt-32 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl text-black dark:text-white leading-tight mb-4">
            Alumni
          </h2>
          <p className="text-[var(--accent-grey)] text-[16px]">
            Celebrating the past leaders of the General Studies Business Society.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {ALUMNI.map((member, index) => (
            <a
              key={index}
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-center p-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/[0.03] transition-all duration-300"
            >
              {/* Photo */}
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-black/5 dark:bg-white/5 mb-5 grayscale group-hover:grayscale-0 ring-1 ring-black/10 dark:ring-white/10 group-hover:ring-[var(--columbia-blue-light)]/50 group-hover:shadow-[0_0_20px_rgba(185,217,235,0.2)] transition-all duration-500 group-hover:-translate-y-1">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name */}
              <p className="font-serif text-[16px] text-black dark:text-white leading-tight mb-1 group-hover:text-[var(--columbia-blue-light)] transition-colors duration-300">
                {member.name}
              </p>

              {/* Role */}
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--accent-grey)] leading-snug mb-1">
                {member.role}
              </p>

              {/* Class year */}
              <p className="text-[11px] text-[var(--accent-grey)] opacity-50 italic">
                {member.school}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* ── GET INVOLVED ────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 mt-32 relative z-10">
        <div className="glass-panel p-10 md:p-14 rounded-3xl text-center">
          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[var(--columbia-blue-light)] mb-4">
            Get Involved
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-black dark:text-white leading-tight mb-6">
            Join the board.
          </h2>
          <p className="text-[var(--accent-grey)] text-[16px] leading-relaxed mx-auto max-w-xl mb-8">
            We open applications for junior board positions at the beginning of
            every semester. If you're a GS student looking to build the org from
            the inside, we'd love to hear from you.
          </p>
          <div className="inline-block px-6 py-3 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[13px] text-[var(--accent-grey)] italic">
            Applications open each semester
          </div>
        </div>
      </section>

    </main>
  );
}