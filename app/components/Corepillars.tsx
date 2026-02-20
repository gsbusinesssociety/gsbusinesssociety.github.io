import React from 'react';

const pillars = [
  {
    title: "Professional Development",
    description: "Workshops and seminars designed to equip students with the technical acumen and soft skills required for the modern business landscape."
  },
  {
    title: "Strategic Networking",
    description: "Facilitating meaningful connections between General Studies students, world-class faculty, and industry-leading professionals."
  },
  {
    title: "Community Growth",
    description: "Fostering a robust network of peers who support one another through the unique challenges of the GS experience and beyond."
  }
];

export default function CorePillars() {
  return (
    /* Changed bg-[#F2F2F2] to a variable-based subtle grey */
    <section className="py-24 bg-gray-50 dark:bg-[#1f1f1f] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-16 text-center md:text-left">
          <h2 className="font-serif text-3xl md:text-4xl text-[var(--foreground)] mb-4">Our Foundations</h2>
          {/* Changed bar to var(--columbia-blue) */}
          <div className="h-1 w-20 bg-[var(--columbia-blue)] mx-auto md:mx-0"></div>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {pillars.map((pillar, index) => (
            <div key={index} className="group">
              {/* FIX: group-hover uses the variable blue which is accessible */}
              <h3 className="font-serif text-2xl text-[var(--foreground)] mb-4 group-hover:text-[var(--columbia-blue)] transition-colors duration-300">
                {pillar.title}
              </h3>
              {/* FIX: border and text colors updated for contrast */}
              <p className="text-[var(--accent-grey)] leading-relaxed text-sm md:text-base border-l border-[var(--columbia-blue)] pl-6">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}