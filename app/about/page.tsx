import React from 'react';

const BOARD_MEMBERS = [
{ 
    name: "Someone Someone", 
    role: "President", 
    school: "GS '27", 
    linkedin: "https://linkedin.com/in/username",
    image: "/board/president.jpg" // Path to their photo in /public
  },
  { name: "someone someone", role: "Vice President", school: "GS '27", linkedin: "https://linkedin.com/in/username", image: "/board/vice-president.jpg" },
  { name: "someone someone", role: "Director of Operations", school: "GS '28", linkedin: "https://linkedin.com/in/username", image: "/board/director-of-operations.jpg" },
  { name: "someone someone", role: "Head of External Affairs", school: "GS '28", linkedin: "https://linkedin.com/in/username", image: "/board/head-of-external-affairs.jpg" },
  { name: "someone someone", role: "Head of Technology", school: "GS '27", linkedin: "https://linkedin.com/in/username", image: "/board/head-of-technology.jpg" },
  { name: "someone someone", role: "Head of Finance", school: "GS '28", linkedin: "https://linkedin.com/in/username", image: "/board/head-of-finance.jpg" },
  { name: "someone someone", role: "Head of Communications", school: "GS '27", linkedin: "https://linkedin.com/in/username", image: "/board/head-of-communications.jpg" },
  { name: "someone someone", role: "Head of Something else", school: "GS '28", linkedin: "https://linkedin.com/in/username", image: "/board/head-of-something-else.jpg" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. Hero / Mission Header */}
      <section className="bg-[#F2F2F2] py-24 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-serif text-5xl md:text-6xl text-[#333333] mb-8">Our Mission</h1>
          <p className="font-serif italic text-2xl md:text-3xl text-[#6D6E71] leading-relaxed">
            We aim to increase GS students' engagement in the pre-professional life.
          </p>
        </div>
      </section>

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
              Est. 2020
            </span>
          </div>
        </div>
      </section>

      {/* 3. Leadership Section */}
      <section className="py-24 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-4xl text-[#333333] mb-16 text-center">Executive Board</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {BOARD_MEMBERS.map((member, index) => (
              <div key={index} className="text-center group">
                
                {/* LINKEDIN WRAPPER AROUND IMAGE */}
                <a 
                  href={member.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block relative w-32 h-32 mx-auto mb-6"
                >
                  <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500 border-2 border-transparent group-hover:border-[#C4D8E2] relative">
                    {/* If you have images, use the Next.js Image component here */}
                    {/* <Image src={member.image} alt={member.name} fill className="object-cover" /> */}
                    
                    {/* Simple overlay effect on hover */}
                    <div className="absolute inset-0 bg-[#C4D8E2]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="text-[10px] font-bold text-[#333333] uppercase tracking-tighter bg-white/80 px-2 py-1 rounded">View Profile</span>
                    </div>
                  </div>
                </a>

                <h3 className="font-serif text-xl text-[#333333]">{member.name}</h3>
                <p className="text-[#C4D8E2] text-xs font-bold uppercase tracking-widest mt-1">
                  {member.role}
                </p>
                <p className="text-[#6D6E71] text-xs mt-2 italic">
                  {member.school}
                </p>
              </div>
            ))}
          </div>
        </div>
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