import React from 'react';
import Link from 'next/link';

const BOARD_MEMBERS = [
  { name: "Gavin Xue", role: "Founder and President", school: "GS '28", linkedin: "https://www.linkedin.com/in/gx2173", image: "/board/president.jpg" },
  { name: "Bayron Aguilar", role: "Founder and Vice President", school: "GS '29", linkedin: "https://linkedin.com/in/Bayron-Aguilar", image: "/board/vice-president1.jpeg" },
  { name: "Eren Yesiltepe", role: "Founder and Vice President", school: "GS '28", linkedin: "https://www.linkedin.com/in/erenyesiltepe/", image: "/board/vice-president2.jpeg" },
    { name: "Thomas Ryder", role: "Co-head of Development", school: "GS '27", linkedin: "https://www.linkedin.com/in/tjr2162/", image: "/board/head-of-development1.jpeg" },
  { name: "Mehdi Shakibapour", role: "Head of Technology", school: "GS '27", linkedin: "https://linkedin.com/in/mehdisha", image: "/board/head-of-technology.png" },
  { name: "Noah Kim", role: "Head of Marketing", school: "GS '27", linkedin: "https://www.linkedin.com/in/noah-kim-4075772b0", image: "/board/head-of-marketing.jpeg" },
  { name: "Fatine Mohattane", role: "Head of Events", school: "GS '27", linkedin: "https://www.linkedin.com/in/fatinemohattane/", image: "/board/head-of-events.jpeg" },
  // { name: "Joshua Becher", role: "Co-head of Development", school: "GS '28", linkedin: "https://www.linkedin.com/in/joshua-becher/", image: "/board/head-of-development2.jpeg" },
  // { name: "Brian Van Dort", role: "Co-Head of Communication", school: "GS '28", linkedin: "https://linkedin.com/in/username", image: "/board/head-of-communications.jpeg" },
  { name: "Tom Rosenzweig", role: "Head of Finance", school: "GS '28", linkedin: "https://www.linkedin.com/in/tom-rosenzweig-073219339/", image: "/board/head-of-finance.jpeg" },
  { name: "Gal Winter", role: "Co-head of Education", school: "GS '28", linkedin: "https://www.linkedin.com/in/galwinter/", image: "/board/head-of-education2.jpeg" },
  { name: "Julia Zhang", role: "Co-head of Education", school: "CC '28", linkedin: "https://www.linkedin.com/in/julia-zhang-2298a4354", image: "/board/head-of-education1.jpeg" },
  { name: "William Hamilton", role: "Co-head of Communication", school: "GS '30", linkedin: "https://linkedin.com/in/username", image: "/board/head-of-communications2.jpeg" },

];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">

      {/* ── WHO WE ARE ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-32">

        <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--columbia-blue)] mb-8">
          About
        </p>

        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">

          {/* Left — text */}
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-[var(--foreground)] leading-[1.08] mb-10">
              Who We Are
            </h1>
            <div className="space-y-6 text-[var(--accent-grey)] text-[15px] leading-[1.8]">
              <p>
                The Columbia GS Business Society aims to increase GS students'
                engagement in pre-professional life. By bringing in industry
                professionals, offering training, and fostering community,
                we build an inclusive space for GS students.
              </p>
            </div>
          </div>

          {/* Right — image placeholder */}
          <div className="h-80 md:h-96 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl flex items-center justify-center">
            <span className="font-serif italic text-sm text-[var(--accent-grey)] opacity-50 text-center px-10">
              Photo coming soon
            </span>
          </div>

        </div>
      </section>

      {/* ── EXECUTIVE BOARD ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-32">

        <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--columbia-blue)] mb-12">
          Executive Board
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {BOARD_MEMBERS.map((member, index) => (
            <a
              key={index}
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-center"
            >
              {/* Photo */}
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4 grayscale group-hover:grayscale-0 ring-2 ring-transparent group-hover:ring-[var(--columbia-blue)]/30 transition-all duration-500">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name */}
              <p className="font-serif text-[15px] text-[var(--foreground)] leading-tight mb-1 group-hover:text-[var(--columbia-blue)] transition-colors duration-200">
                {member.name}
              </p>

              {/* Role */}
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--accent-grey)] leading-snug mb-1">
                {member.role}
              </p>

              {/* Class year */}
              <p className="text-[11px] text-[var(--accent-grey)] opacity-60 italic">
                {member.school}
              </p>
            </a>
          ))}
        </div>

      </section>

      {/* ── JOIN THE BOARD ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-[1fr_auto] gap-10 items-center border-t border-gray-100 dark:border-gray-800 pt-16">

          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--columbia-blue)] mb-4">
              Get Involved
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-[var(--foreground)] leading-tight mb-4">
              Join the board.
            </h2>
            <p className="text-[var(--accent-grey)] text-[15px] leading-relaxed max-w-lg">
              We open applications for junior board positions at the beginning of
              every semester. If you're a GS student looking to build the org from
              the inside, we'd love to hear from you.
            </p>
          </div>

          <p className="text-[var(--accent-grey)] text-sm italic whitespace-nowrap">
            Applications open each semester.
          </p>

        </div>
      </section>

    </main>
  );
}