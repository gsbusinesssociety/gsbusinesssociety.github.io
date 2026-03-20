import Link from "next/link";
import Newsletter from "./components/Newsletter";

const programs = [
    {
    label: "Speaker & Recruiting Events",
    description:
      "Mixers with professionals from McKinsey, Morgan Stanley, and beyond.",
  },
  {
    label: "Site Visits",
    description:
      "Behind-the-scenes access to firms like the NYSE trading floor and Insight Partners",
  },
  {
    label: "Panel Discussions",
    description:
      "Cnversations about non-traditional paths into finance, consulting, and business.",
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
    <main className="min-h-screen bg-[var(--background)] transition-colors duration-300">

      {/* ── OPENING ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-32">

        {/* Eyebrow */}
        <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--columbia-blue)] mb-8">
          Columbia University
        </p>

        {/* Headline */}
        <h1 className="font-serif text-5xl md:text-6xl lg:text-[4.5rem] text-[var(--foreground)] leading-[1.08] max-w-3xl mb-10">
          GS Business Society
        </h1>

        {/* Body — give it room */}
        <p className="text-[var(--accent-grey)] text-lg leading-[1.8] max-w-xl mb-14">
          GS students come from every kind of background -- veterans, career
          changers, transfer students, working professionals. GSBS exists to
          give that community the access, connections, and professional
          foundation.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 bg-[#0072CE] hover:bg-[#005da8] text-white font-semibold text-sm px-7 py-3.5 rounded-lg transition-all duration-200 shadow-sm active:scale-[0.99]"
          >
            Upcoming events <ArrowRight />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent-grey)] hover:text-[var(--foreground)] border border-gray-200 dark:border-gray-700 px-7 py-3.5 rounded-lg transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
          >
            Partner with us <ArrowRight />
          </Link>
        </div>

      </section>

      {/* ── WHAT WE DO ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-32">

        <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--columbia-blue)] mb-12">
          What We Do
        </p>

        {/* Three columns on desktop, stacked on mobile */}
        <div className="grid md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800">
          {programs.map((p) => (
            <div key={p.label} className="py-10 md:py-0 md:px-10 first:md:pl-0 last:md:pr-0">
              <h3 className="font-serif text-2xl text-[var(--foreground)] mb-4">
                {p.label}
              </h3>
              <p className="text-[var(--accent-grey)] text-[15px] leading-relaxed">
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