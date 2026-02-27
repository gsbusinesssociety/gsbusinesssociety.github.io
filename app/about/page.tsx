import React from 'react';

const BOARD_MEMBERS = [
  { name: "Gavin Xue", role: "Founder and President", school: "'28", linkedin: "https://www.linkedin.com/in/gx2173", image: "/board/president.jpg" },
  { name: "Bayron Aguilar", role: "Founder and Vice President", school: "'29", linkedin: "https://linkedin.com/in/Bayron-Aguilar", image: "/board/vice-president1.jpeg" },
  { name: "Eren Yesiltepe", role: "Founder and Vice President", school: "'29", linkedin: "https://www.linkedin.com/in/erenyesiltepe/", image: "/board/vice-president2.jpeg" },
  { name: "Tom Rosenzweig", role: "Head of Finance", school: "'28", linkedin: "https://www.linkedin.com/in/tom-rosenzweig-073219339/", image: "/board/head-of-finance.jpeg" },
  { name: "Mehdi Shakibapour", role: "Head of Technology", school: "'28", linkedin: "https://linkedin.com/in/mehdisha", image: "/board/head-of-technology.png" },
  { name: "Thomas Ryder", role: "Co-head of Development", school: "'27", linkedin: "https://www.linkedin.com/in/tjr2162/", image: "/board/head-of-development1.jpeg" },
  { name: "Joshua Becher", role: "Co-head of Development", school: "'28", linkedin: "https://www.linkedin.com/in/joshua-becher/", image: "/board/head-of-development2.jpeg" },
  { name: "Fatine Mohattane", role: "Head of Events", school: "'28", linkedin: "https://www.linkedin.com/in/fatinemohattane/", image: "/board/head-of-events.jpeg" },
  { name: "Brian Van Dort", role: "Head of Communication", school: "'28", linkedin: "https://linkedin.com/in/username", image: "/board/head-of-communications.jpeg" },
  { name: "Noah Kim", role: "Head of Marketing", school: "'28", linkedin: "https://linkedin.com/in/username", image: "/board/head-of-marketing.jpeg" }
];

export default function AboutPage() {
  return (
    /* Changed bg-white to var(--background) and text to var(--foreground) */
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      
      {/* 2. Who We Are Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-serif text-3xl mb-6 border-b border-[var(--columbia-blue)] pb-2 inline-block">
              Who We Are
            </h2>
            <div className="space-y-6 text-[var(--accent-grey)] leading-relaxed">
              <p>
                The Columbia GS Business Society aims to increase GS students' engagement in pre-professional life. By bringing in industry professionals, offering hands-on training, and fostering community through social events, we build an inclusive space for GS students and others from non-traditional backgrounds to learn, connect, and grow.
              </p>
              <p>
                Founded on the principles of community and excellence, we provide our members with the resources, network, and mentorship necessary to navigate competitive industries.
              </p>
            </div>
          </div>
          
          {/* Placeholder adjusted for Dark Mode visibility */}
          <div className="bg-gray-50 dark:bg-white/5 h-96 flex items-center justify-center border border-gray-100 dark:border-gray-800">
            <span className="text-[var(--columbia-blue)] font-serif italic uppercase tracking-widest text-sm text-center px-10 opacity-60">
              Placeholder for an image of the board!
            </span>
          </div>
        </div>
      </section>

      {/* 3. Leadership Section */}
      <section className="py-24 bg-gray-50 dark:bg-[#1f1f1f] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-4xl mb-16 text-center">Executive Board</h2>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-16 max-w-6xl mx-auto">
            {BOARD_MEMBERS.map((member, index) => (
              <div key={index} className="text-center group w-64"> 
                <a 
                  href={member.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block relative w-32 h-32 mx-auto mb-6"
                >
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500 border-2 border-transparent group-hover:border-[var(--columbia-blue)] relative shadow-sm">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    
                    {/* Hover Overlay adjusted for Dark Mode text contrast */}
                    <div className="absolute inset-0 bg-[var(--columbia-blue)]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="text-[10px] font-bold text-black uppercase tracking-tighter bg-white/90 px-2 py-1 rounded">
                          View Profile
                       </span>
                    </div>
                  </div>
                </a>

                <h3 className="font-serif text-lg leading-tight">{member.name}</h3>
                <p className="text-[var(--columbia-blue)] text-[10px] font-bold uppercase tracking-widest mt-1">
                  {member.role}
                </p>
                <p className="text-[var(--accent-grey)] text-xs mt-1 italic">
                   {member.school}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Contact CTA */}
      <section className="py-24 text-center">
        <h2 className="font-serif text-3xl mb-6">Interested in Joining the Board?</h2>
        <p className="text-[var(--accent-grey)] mb-8 max-w-lg mx-auto">
          We open applications for junior board positions at the beginning of every semester.
        </p>
        <a 
          href="https://forms.gle/FiH8WrxAP7WMifx99" 
          target="_blank" 
          rel="noopener noreferrer"
          /* Link buttons now use var(--foreground) for high-contrast dark mode support */
          className="inline-block border border-[var(--foreground)] text-[var(--foreground)] px-10 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all"
        >
          Get in Touch
        </a>
      </section>
    </main>
  );
}