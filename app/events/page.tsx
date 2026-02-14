import React from 'react';

const UPCOMING_EVENTS = [
  {
    title: "Wall Street Recruitment Panel",
    date: "20260315T180000Z", // Format: YYYYMMDDTHHMMSSZ
    endDate: "20260315T200000Z",
    displayDate: "March 15, 2026",
    time: "6:00 PM - 8:00 PM",
    location: "Lerner Hall, Room 402",
    description: "Join alumni from Goldman Sachs and JP Morgan for a recruitment deep dive.",
    category: "Professional Development"
  },
  {
    title: "Spring Networking Mixer",
    date: "20260322T190000Z",
    endDate: "20260322T210000Z",
    displayDate: "March 22, 2026",
    time: "7:00 PM - 9:00 PM",
    location: "Faculty House",
    description: "A formal evening of networking with GS alumni and peers.",
    category: "Networking"
  }
];

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Page Header */}
      <header className="bg-[#F2F2F2] py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="font-serif text-5xl text-[#333333] mb-4 text-center md:text-left">Events</h1>
          <p className="text-[#6D6E71] text-lg max-w-2xl text-center md:text-left mx-auto md:mx-0 font-serif">
            Upcoming opportunities for the GS Business Society community.
          </p>
        </div>
      </header>

      {/* Events List */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        <div className="space-y-16">
          {UPCOMING_EVENTS.map((event, index) => {
            // Generate Google Calendar Link
            const gCalLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.date}/${event.endDate}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;

            return (
              <div key={index} className="flex flex-col md:flex-row gap-8 items-start border-b border-gray-50 pb-16 last:border-0">
                <div className="w-full md:w-48 pt-1">
                  <p className="font-bold text-[#333333]">{event.displayDate}</p>
                  <p className="text-sm text-[#6D6E71]">{event.time}</p>
                </div>
                
                <div className="flex-1">
                  <span className="text-[#C4D8E2] text-xs font-bold uppercase tracking-widest">{event.category}</span>
                  <h4 className="font-serif text-3xl text-[#333333] mt-2">{event.title}</h4>
                  <p className="text-[#6D6E71] mt-4 text-sm leading-relaxed max-w-2xl">
                    {event.description}
                  </p>
                  <p className="text-[#333333] font-medium text-xs mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#C4D8E2] rounded-full"></span>
                    {event.location}
                  </p>
                </div>

                {/* Button Group */}
                <div className="flex flex-col gap-3 w-full md:w-auto pt-2">
                  <button className="bg-[#C4D8E2] text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#A9C4D1] transition-all text-center">
                    RSVP
                  </button>
                  <a 
                    href={gCalLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="border border-gray-200 text-[#6D6E71] px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all text-center"
                  >
                    + Google Calendar
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}