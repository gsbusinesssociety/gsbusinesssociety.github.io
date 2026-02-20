import React from 'react';

const BOARD_MEMBERS = [
  { name: "Bayron Aguilar", role: "President", school: "'27", linkedin: "https://linkedin.com/in/Bayron-Aguilar", image: "/board/president.jpeg" },
  { name: "Gavin Xue", role: "Vice President", school: "'27", linkedin: "https://linkedin.com/in/Gavin-Xue", image: "/board/vice-president.jpeg" },
  { name: "Tom Rosenzweig", role: "Head of Finance", school: "'28", linkedin: "https://linkedin.com/in/username", image: "/board/head-of-finance.jpeg" },
  { name: "Thomas Ryder", role: "Head of Development", school: "'28", linkedin: "https://linkedin.com/in/username", image: "/board/head-of-development.jpeg" },
  { name: "Fatine Mohattane", role: "Head of Events", school: "'28", linkedin: "https://linkedin.com/in/username", image: "/board/head-of-events.jpeg" },
  { name: "Mehdi Shakibapour", role: "Head of Technology", school: "'27", linkedin: "https://linkedin.com/in/mehdishak", image: "/board/head-of-technology.jpeg" },
  { name: "Brian Van Dort", role: "Head of Communications", school: "'27", linkedin: "https://linkedin.com/in/username", image: "/board/head-of-communications.jpeg" },
  { name: "Noah Jaehyeok Kim", role: "Head of Marketing", school: "'28", linkedin: "https://linkedin.com/in/username", image: "/board/head-of-marketing.jpeg" },
  { name: "Sanaalee Troupe", role: "Head of Education", school: "'28", linkedin: "https://linkedin.com/in/username", image: "/board/head-of-education.jpeg" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. Hero / Mission Header */}
      {/* <section className="bg-[#F2F2F2] py-24 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-serif text-5xl md:text-6xl text-[#333333] mb-8">Our Mission</h1>
          <p className="font-serif italic text-2xl md:text-3xl text-[#6D6E71] leading-relaxed">
            We aim to increase GS students' engagement in the pre-professional life.
          </p>
        </div>
      </section> */}

      {/* 2. Who We Are (Split Section) */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-serif text-3xl text-[#333333] mb-6 border-b border-[#C4D8E2] pb-2 inline-block">
              Who We Are
            </h2>
            <div className="space-y-6 text-[#6D6E71] leading-relaxed">
              <p>
The Columbia GS Business Society aims to increase GS students' engagement in the pre-professional life. By bringing in industry professionals, offering hands-on training, and fostering community through social events, we build an inclusive space for gs students and others from non-traditional backgrounds to learn, connect, and grow.              </p>
              <p>
                Founded on the principles of community and excellence, we provide our members with the resources, network, and mentorship necessary to navigate competitive industries.
              </p>
            </div>
          </div>
          {/* Placeholder for an Image of Board */}
          <div className="bg-[#C4D8E2]/20 h-96 flex items-center justify-center border border-[#C4D8E2]">
            <span className="text-[#C4D8E2] font-serif italic uppercase tracking-widest">
              Placeholder for an image of the board!
            </span>
          </div>
        </div>
      </section>

      {/* 3. Leadership Section */}
      <section className="py-24 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-4xl text-[#333333] mb-16 text-center">Executive Board</h2>
{/* Replace the current grid div with this */}
<div className="flex flex-wrap justify-center gap-x-8 gap-y-16 max-w-6xl mx-auto">
  {BOARD_MEMBERS.map((member, index) => (
    <div key={index} className="text-center group w-64"> 
      {/* w-64 (256px) ensures they don't get too wide, keeping the '3-ish' feel but tighter */}
      
      <a 
        href={member.linkedin} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block relative w-32 h-32 mx-auto mb-6"
      >
        <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500 border-2 border-transparent group-hover:border-[#C4D8E2] relative shadow-sm">
          {/* Use your <img> or <Image> tag here */}
          <div className="absolute inset-0 bg-[#C4D8E2]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <span className="text-[10px] font-bold text-[#333333] uppercase tracking-tighter bg-white/80 px-2 py-1 rounded">View Profile</span>
          </div>
        </div>
      </a>

      <h3 className="font-serif text-lg text-[#333333] leading-tight">{member.name}</h3>
      <p className="text-[#C4D8E2] text-[10px] font-bold uppercase tracking-widest mt-1">
        {member.role}
      </p>
      <p className="text-[#6D6E71] text-xs mt-1 italic">
         {member.school}
      </p>
    </div>
  ))}
</div>        </div>
      </section>

      {/* 4. Contact CTA */}
      <section className="py-24 text-center">
        <h2 className="font-serif text-3xl text-[#333333] mb-6">Interested in Joining the Board?</h2>
        <p className="text-[#6D6E71] mb-8 max-w-lg mx-auto">
          We open applications for junior board positions at the beginning of every semester.
        </p>
        <a 
          href="https://forms.gle/FiH8WrxAP7WMifx99"                   target="_blank" 
                  rel="noopener noreferrer"
          className="inline-block border border-[#333333] text-[#333333] px-10 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#333333] hover:text-white transition-all"
        >
          Get in Touch
        </a>
      </section>
    </main>
  );
}