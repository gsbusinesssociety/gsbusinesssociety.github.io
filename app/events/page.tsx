import React from 'react';

const UPCOMING_EVENTS = [
  {
    title: "Tell Your Leadership Story with Your Non-Traditional Story",
    date: "20260225T233000Z", 
    endDate: "20260226T013000Z",
    displayDate: "Wednesday, February 25, 2026",
    time: "6:30 PM - 8:30 PM",
    location: "Schermerhorn Hall 614", 
    description: "GSBS is Columbia's first pre-professional society built for GS students, celebrating the resilience and unique perspectives that come from non-traditional paths. Join us for our launch event featuring a networking session and panel discussion with a CBS director, a Morgan Stanley associate, and the Dean of Students of GS.",
    category: "Professional Development",
    rsvpLink: "https://forms.gle/RtaYtec3PZXGVtkGA"
  },
];

// const PAST_EVENTS = [
//   {
//     title: "Spring Strategy Mixer",
//     date: "December 2025",
//     description: "An informal gathering for GS students to discuss recruitment cycles and peer mentorship.",
//     image: "/past-event-1.jpg" // Add a grayscale photo here later
//   }
// ];



export default function EventsPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] pb-24 transition-colors duration-300">
      {/* COMPACT HEADER that matches past highlights  */}
<section className="pt-16 pb-4 max-w-7xl mx-auto px-6">
  <h2 className="font-serif text-2xl text-[var(--foreground)] mb-4">Upcoming events</h2>
  <div className="h-1 w-20 bg-[var(--columbia-blue)]"></div>
</section>

{/* UPCOMING EVENTS LIST  */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-12">
          {UPCOMING_EVENTS.map((event, index) => {
            const gCalLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.date}/${event.endDate}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;

            return (
              <div key={index} className="flex flex-col md:flex-row gap-8 items-start bg-gray-50/50 dark:bg-white/5 p-8 rounded-sm">
                
                {/* LOGISTICS COLUMN (DATE, TIME, LOCATION) */}
                <div className="w-full md:w-48 shrink-0">
                  <p className="font-bold text-[var(--foreground)] leading-tight">{event.displayDate}</p>
                  <p className="text-xs text-[var(--accent-grey)] mt-1 uppercase tracking-widest">{event.time}</p>
                  
                  {/* Location added here */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 md:border-t-0 md:mt-2 md:pt-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--columbia-blue)] mb-0.5">Location</p>
                    <p className="text-sm text-[var(--foreground)] leading-snug">{event.location}</p>
                  </div>
                </div>
                
                <div className="flex-1">
                  <span className="text-[var(--columbia-blue)] text-[10px] font-bold uppercase tracking-widest">{event.category}</span>
                  <h4 className="font-serif text-2xl text-[var(--foreground)] mt-1">{event.title}</h4>
                  <p className="text-[var(--accent-grey)] mt-3 text-sm leading-relaxed max-w-2xl italic">
                    {event.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <a href={event.rsvpLink} target="_blank" rel="noopener noreferrer" className="bg-[#0072CE] text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all text-center">
                    RSVP
                  </a>
                  <a href={gCalLink} target="_blank" rel="noopener noreferrer" className="border border-gray-300 dark:border-gray-600 text-[var(--accent-grey)] px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white dark:hover:bg-gray-800 transition-all text-center">
                    + Google Calendar
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      
      {/* PAST EVENTS SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-16 border-t border-gray-100 dark:border-gray-800">
        <h2 className="font-serif text-2xl text-[var(--foreground)] mb-10">Past Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* {PAST_EVENTS.map((event, index) => (
            <div key={index} className="group cursor-default">
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 mb-4 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                Once you have a photo, use <img src={event.image} /> here
                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 uppercase tracking-widest">
                   Archive Photo
                </div>
              </div>
              <h3 className="font-serif text-lg text-[var(--foreground)]">{event.title}</h3>
              <p className="text-[10px] text-[var(--columbia-blue)] font-bold uppercase tracking-tighter mb-2">{event.date}</p>
              <p className="text-xs text-[var(--accent-grey)] leading-relaxed line-clamp-2">
                {event.description}
              </p>
            </div>
          ))} */}
        </div>
      </section>
    </main>
  );
}