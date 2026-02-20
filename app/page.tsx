import Image from "next/image";
import Newsletter from "./components/Newsletter";
import CorePillars from "./components/Corepillars";

export default function Home() {
  return (
    /* Change bg-white to var(--background) */
    <main className="min-h-screen bg-[var(--background)] transition-colors duration-300">

      {/* Hero Section */}
      <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden bg-[#2A2A2A]">
        
        {/* HERO IMAGE BACKGROUND */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero.jpg" 
            alt="Columbia University Campus" 
            fill 
            className="object-cover opacity-60" 
            priority
          />
          {/* A gradient overlay helps text readability regardless of the image used */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-6">
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 drop-shadow-md">
            We are GS Business Society
          </h1>
          {/* Increased contrast for sub-text by using white (not white/90) */}
          <p className="text-white text-xl md:text-2xl max-w-3xl mx-auto font-serif italic tracking-wide">
            Columbia&apos;s premier organization for professional excellence.
          </p>
        </div>
      </section>

      {/* Core Pillars Section */}
      <CorePillars />

      {/* Subtle Divider for visual interest */}
      <div className="max-w-4xl mx-auto h-px bg-gray-100 dark:bg-gray-800" />

      {/* Newsletter Subscription */}
      <Newsletter />
    </main>
  );
}