import Link from "next/link";
import Newsletter from "./components/Newsletter";

const programs = [
  {
    label: "Alumni Mentorship",
    description:
      "Direct access to GS alumni who have successfully navigated the exact paths you are pursuing.",
  },
  {
    label: "Interview Prep",
    description:
      "Rigorous, highly-tailored preparation frameworks for technical and behavioral interviews across top firms.",
  },
  {
    label: "Industry Guides",
    description:
      "Curated insider knowledge and step-by-step roadmaps designed specifically for the condensed timelines of GS students.",
  },
];

const ArrowRight = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default function Home() {
  return (
    <main className="min-h-screen transition-colors duration-500">
      {/* ── OPENING ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-32 relative">
        {/* Glow effect behind text */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--columbia-blue)] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse-slow pointer-events-none"></div>

        <div className="relative z-10 animate-fade-in-up">
          {/* Eyebrow */}
          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[var(--columbia-blue-light)] mb-8">
            Columbia University
          </p>

          {/* Headline */}
          <h1 className="font-serif text-5xl md:text-6xl lg:text-[5rem] text-white leading-[1.08] max-w-4xl mb-10 tracking-tight">
            General Studies Business Society
          </h1>

          {/* Body */}
          <div className="space-y-6 text-[var(--accent-grey)] text-lg md:text-[1.15rem] leading-[1.8] max-w-3xl mb-14 font-light">
            <p>
              We started this society because the traditional recruiting timeline wasn't built for us. 
              General Studies students don't follow a normal pattern. Many of us are here for only two years, arriving as highly qualified, seasoned professionals.
            </p>
            <p>
              Yet, despite that experience, navigating the competitive Columbia club scene can be incredibly difficult. 
              GSBS is here to bridge that gap. We are the premier business society dedicated entirely to students with unique, non-traditional trajectories.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT WE DO ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[var(--columbia-blue-light)] mb-16 text-center">
          What We Do
        </p>

        {/* Three columns on desktop, stacked on mobile */}
        <div className="grid md:grid-cols-3 gap-8">
          {programs.map((p, i) => (
            <div 
              key={p.label} 
              className="glass-panel p-8 rounded-2xl hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,114,206,0.15)] group"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <h3 className="font-serif text-2xl text-white mb-4 group-hover:text-[var(--columbia-blue-light)] transition-colors duration-300">
                {p.label}
              </h3>
              <p className="text-[var(--accent-grey)] text-[15px] leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ──────────────────────────────────────────────────── */}
      <Newsletter />
    </main>
  );
}