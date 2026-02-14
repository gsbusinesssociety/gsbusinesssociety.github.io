import Image from "next/image";
import Newsletter from "./components/Newsletter";
import CorePillars from "./components/Corepillars";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* 2. Hero Section */}
      <section className="relative w-full h-[500px] flex items-center justify-center overflow-hidden bg-gray-200">
        {/* Placeholder for Hero Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" /> {/* Text Overlay */}
          <div className="w-full h-full bg-[#6D6E71] flex items-center justify-center text-white/20 italic">
          
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-6">
          <h1 className="font-serif text-4xl md:text-6xl text-white mb-4">
            We are GS Business Society
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto font-serif">
            Columbia's blah blah subtitle.
          </p>
        </div>
      </section>
          {/* 3. Spacing for next section
      <section className="py-20 text-center">
        <h2 className="text-[#6D6E71] uppercase tracking-widest text-sm font-semibold">
          <p>Scroll to explore </p>
          <p>Scroll to explore </p>
          <p>Scroll to explore </p>
          <p>Scroll to explore </p>
          <p>Scroll to explore </p>
          <p>Scroll to explore </p>

        </h2>
      </section> */}
      {/* 3. Core Pillars Section */}
      <CorePillars />
      {/* 4. Newsletter Subscription */}
      <Newsletter />
            {/* 5. Logo? */}
    </main>
  );
}