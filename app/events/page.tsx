import React from 'react';

const UPCOMING_EVENTS = [
  {
   title: "McKinsey & Company Talent Acquisition Event",
   date: "20260402T190000", // April 2, 7:00 PM
   endDate: "20260402T200000",
   displayDate: "Thursday, April 2, 2026",
   time: "7:00 PM - 8:00 PM",
   location: "To be notified by email",
   fullAddress: "Check confirmation email for campus location", 
   description: "Join us for an interactive session with Özgü Kokal, a Columbia Business School alum and current McKinsey Associate. Gain insight into the recruiting process at one of the world's most prestigious consulting firms.",
   category: "Talent Acquisition",
   rsvpLink: "https://docs.google.com/forms/d/e/1FAIpQLSdehSOJI5GODH6IaAg4jSRlGmUU9EoF15hqWn0yGbl8LSkAXQ/viewform"
  },
  {
    title: "Insight Partners Office Visit",
    date: "20260326T200000Z",
    endDate: "20260326T220000Z",
    displayDate: "Thursday, March 26, 2026",
    time: "4:00 PM",
    location: "Insight Partners Office (NYC)",
    fullAddress: "1114 Avenue of the Americas, New York, NY 10036",
    description: "Join CQBS and GSBS for an exclusive site visit to Insight Partners. RSVP required by March 20th.",
    category: "Site Visit & Networking",
    rsvpLink: "https://docs.google.com/forms/d/e/1FAIpQLSdfhB2kPU08AKkB1M0hRi1P7sEhJV4ZwV_YxeMpxXrWHtj9Qw/viewform"
  },
  {
    title: "New York Stock Exchange Site Visit (Session 2)",
    date: "20260403T190000Z",
    endDate: "20260403T210000Z",
    displayDate: "Friday, April 3, 2026",
    time: "3:00 PM",
    location: "New York Stock Exchange",
    fullAddress: "11 Wall St, New York, NY 10005",
    description: "Gain firsthand experience in real-world trading and investment. Learn how capital markets operate at the heart of global finance. Note: Registrations are reviewed on a rolling basis.",
    category: "Site Visit",
    rsvpLink: "https://docs.google.com/forms/d/e/1FAIpQLScuVzaBJXQUI88vP95bv9o7_CVJKQ3AsjHF8twSdmZH4CFSeg/viewform"
  },
  {
    title: "New York Stock Exchange Site Visit (Session 3)",
    date: "20260410T190000Z",
    endDate: "20260410T210000Z",
    displayDate: "Friday, April 10, 2026",
    time: "3:00 PM",
    location: "New York Stock Exchange",
    fullAddress: "11 Wall St, New York, NY 10005",
    description: "Gain firsthand experience in real-world trading and investment. Learn how capital markets operate at the heart of global finance. Note: Registrations are reviewed on a rolling basis.",
    category: "Site Visit",
    rsvpLink: "https://docs.google.com/forms/d/e/1FAIpQLScuVzaBJXQUI88vP95bv9o7_CVJKQ3AsjHF8twSdmZH4CFSeg/viewform"
  }
];
const PAST_EVENTS = [
  {
    title: "NYSE Floor Visit (Session 1)",
    date: "March 13, 2026",
    description: "The first session of our NYSE site visit series. Members went behind the scenes at 11 Wall Street to witness the opening of the world's most iconic trading floor and discuss market mechanics with seasoned floor brokers.",
    category: "Site Visit",
    image: "/nyse-visit-1.jpeg", 
    link: "https://www.linkedin.com/posts/gx2173_inside-where-capital-markets-happen-a-gsbs-activity-7439448996751806464-ahuz?utm_source=share&utm_medium=member_desktop&rcm=ACoAABY3M8EB69xaH0QG60BC3VGy1Lc8o8jeAaQhttps://www.linkedin.com/posts/gx2173_inside-where-capital-markets-happen-a-gsbs-activity-7439448996751806464-ahuz?utm_source=share&utm_medium=member_desktop&rcm=ACoAABY3M8EB69xaH0QG60BC3VGy1Lc8o8jeAaQ" // Replace with your LinkedIn post link when ready
  },
  {
    title: "GSBS Launch Event: The Power of Non-Traditional Leadership",
    date: "February 25, 2026",
    description: "Our inaugural event featuring Dean Marlyn Delva and panelists from Morgan Stanley and the CBS community. We explored how unique life detours forge the resilient leadership qualities needed in the professional world.",
    category: "Panel & Networking",
    image: "/launch-event.jpeg", 
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
      <div key={index} className="group cursor-default flex flex-col h-full">
        
        {/* Image Container */}
        <div className="relative aspect-video bg-gray-200 dark:bg-gray-800 mb-6 overflow-hidden transition-all duration-500 rounded-sm">
          <img 
            src={event.image} 
            alt={event.title} 
            className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700" 
          />
          <div className="absolute top-2 right-2 bg-[var(--background)] px-2 py-1 text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
             {event.category}
          </div>
        </div>
        
        {/* Date Label */}
        <p className="text-[10px] text-[var(--columbia-blue)] font-bold uppercase tracking-[0.2em] mb-2">
          {event.date}
        </p>
        
        {/* Content Wrapper */}
        <div className="flex flex-col flex-grow">
          <h3 className="font-serif text-xl text-[var(--foreground)] mb-3 leading-tight group-hover:text-[var(--columbia-blue)] transition-colors min-h-[3rem]">
            {event.title}
          </h3>
          
          <p className="text-xs text-[var(--accent-grey)] leading-relaxed mb-6 flex-grow">
            {event.description}
          </p>
          
          <div className="mt-auto pt-2">
            <a 
              href={event.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block text-[10px] font-bold uppercase tracking-widest border-b border-[var(--columbia-blue)] pb-1 hover:text-[var(--columbia-blue)] transition-all"
            >
              View on LinkedIn
            </a>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>   
 </main>
  );
}