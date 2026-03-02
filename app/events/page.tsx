import React from 'react';

// 1. Clear out upcoming events for now (or add your next one!)
const UPCOMING_EVENTS = [
  {
    title: "Insight Partners Office Visit",
    date: "20260326T160000Z", 
    endDate: "20260326T180000Z", 
    displayDate: "Thursday, March 26, 2026",
    time: "4:00 PM",
    location: "Insight Partners Office (NYC)", // What shows on the site
    fullAddress: "1114 Avenue of the Americas, New York, NY 10036", // For Google Maps
    description: "Join CQBS and GSBS for an exclusive site visit to Insight Partners. RSVP required by March 20th.",
    category: "Site Visit & Networking",
    rsvpLink: "https://linktr.ee/gsbs_columbia"
  }
];

// 2. Transformed the LinkedIn post into a clean highlight object
const PAST_EVENTS = [
  {
    title: "GSBS Launch Event: The Power of Non-Traditional Leadership",
    date: "February 25, 2026",
    description: "Our inaugural event featuring Dean Marlyn Delva and panelists from Morgan Stanley and the CBS community. We explored how unique life detours forge the resilient leadership qualities needed in the professional world.",
    category: "Panel & Networking",
    image: "/launch-event.jpeg", // Replace with a real photo from last night!
    link: "https://www.linkedin.com/posts/gx2173_columbia-general-studies-business-society-ugcPost-7432836934500061184-DS-A?utm_source=share&utm_medium=member_desktop&rcm=ACoAABY3M8EB69xaH0QG60BC3VGy1Lc8o8jeAaQ" // Link to your post
  }
];

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] pb-24 transition-colors duration-300">
      
      {/* UPCOMING EVENTS SECTION */}
      <section className="pt-16 pb-4 max-w-7xl mx-auto px-6">
        <h2 className="font-serif text-2xl text-[var(--foreground)] mb-4">Upcoming Events</h2>
        <div className="h-1 w-20 bg-[var(--columbia-blue)]"></div>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-8">
        {UPCOMING_EVENTS.length > 0 ? (
          <div className="space-y-12">
{/* UPCOMING EVENTS LIST */}
<section className="max-w-7xl mx-auto px-6 py-8">
  <div className="space-y-12">
    {UPCOMING_EVENTS.map((event, index) => {
      // FIX: Use fullAddress for the URL if it exists, otherwise fallback to location
      const calendarLocation = encodeURIComponent(event.fullAddress || event.location);
      
      const gCalLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.date}/${event.endDate}&details=${encodeURIComponent(event.description)}&location=${calendarLocation}`;

      return (
        <div key={index} className="flex flex-col md:flex-row gap-8 items-start bg-gray-50/50 dark:bg-white/5 p-8 rounded-sm">
          
          {/* LOGISTICS COLUMN (DATE, TIME, LOCATION) */}
          <div className="w-full md:w-48 shrink-0">
            <p className="font-bold text-[var(--foreground)] leading-tight">{event.displayDate}</p>
            <p className="text-xs text-[var(--accent-grey)] mt-1 uppercase tracking-widest">{event.time}</p>
            
            {/* Displaying the clean "Branded" location on the UI */}
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
          </div>
        ) : (
          <p className="text-[var(--accent-grey)] text-sm italic font-serif">
            New events for the spring semester will be announced shortly.
          </p>
        )}
      </section>
      
      {/* PAST HIGHLIGHTS SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-16 border-t border-gray-100 dark:border-gray-800">
        <h2 className="font-serif text-2xl text-[var(--foreground)] mb-10">Past Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {PAST_EVENTS.map((event, index) => (
            <div key={index} className="group cursor-default">
              <div className="relative aspect-video bg-gray-200 dark:bg-gray-800 mb-6 overflow-hidden transition-all duration-500">
                 {/* Once you upload the photo, uncomment the img tag below */}
                <img src={event.image} alt={event.title} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 uppercase tracking-widest border border-dashed border-gray-300 dark:border-gray-700">
                   {event.category}
                </div>
              </div>
              
              <p className="text-[10px] text-[var(--columbia-blue)] font-bold uppercase tracking-[0.2em] mb-2">
                {event.date}
              </p>
              <h3 className="font-serif text-xl text-[var(--foreground)] mb-3 leading-tight group-hover:text-[var(--columbia-blue)] transition-colors">
                {event.title}
              </h3>
              <p className="text-xs text-[var(--accent-grey)] leading-relaxed mb-4">
                {event.description}
              </p>
              
              <a 
                href={event.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[10px] font-bold uppercase tracking-widest border-b border-[var(--columbia-blue)] pb-1 hover:text-[var(--columbia-blue)] transition-all"
              >
                View on LinkedIn
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}