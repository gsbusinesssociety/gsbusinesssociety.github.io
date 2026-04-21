import React from 'react';

const UPCOMING_EVENTS = [
  
  //   {
  //   title: "McKinsey & Company Talent Acquisition Event",
  //   date: "20260402T190000",
  //   endDate: "20260402T200000",
  //   displayDate: "April 2, 2026",
  //   dayOfWeek: "Thursday",
  //   time: "7:00 PM – 8:00 PM",
  //   location: "To be notified by email",
  //   fullAddress: "Check confirmation email for campus location",
  //   description: "Join us for an interactive session with Özgü Kokal, a Columbia Business School alum and current McKinsey Associate. Gain insight into the recruiting process at one of the world's most prestigious consulting firms.",
  //   category: "Talent Acquisition",
  //   rsvpLink: "https://docs.google.com/forms/d/e/1FAIpQLSdehSOJI5GODH6IaAg4jSRlGmUU9EoF15hqWn0yGbl8LSkAXQ/viewform"
  // },
  //   {
  //   title: "Evercore Office Visit with Ahmet Yetis",
  //   date: "20260416T130000", // April 16, 1:00 PM
  //   endDate: "20260416T143000 ", // April 16, 2:30 PM
  //   dayOfWeek: "Thursday",
  //   displayDate: "April 16, 2026",
  //   time: "1:00 PM - 2:30 PM",
  //   location: "Evercore Headquarters",
  //   fullAddress: "55 E 52nd St, New York, NY 10055",
  //   description: "  Join us for an inside look at Evercore, one of WallStreet's most respected independent investment banks. We'll be hearing from Ahmet Yetis, Senior Managing Director in Private Capital Advisory and a 20+ year veteran. Don't miss your chance to go behind the scenes and connect with a leader at the top of the industry.",
  //   category: "Office Visit",
  //   rsvpLink: "https://forms.gle/4VMVGujbMzcdf37y9"
  // },
    {
  title: "Ask an Incoming Analyst: Peer-to-Peer Panel",
  date: "20260422T190000", 
  endDate: "20260422T210000",
  dayOfWeek: "Wednesday",
  displayDate: "Wednesday, April 22, 2026",
  time: "7:00 PM - 9:00 PM",
  location: "MLK 610 (91 Claremont Ave)",
  fullAddress: "91 Claremont Ave, New York, NY 10027", 
  description: "Join GSBS, GSRA, and CQBS for a panel with students who landed roles at JPM, MS, Goldman, McKinsey, and more. Learn the honest truth about navigating recruiting directly from those who just did it.",
  category: "Peer Mentorship",
  rsvpLink: "https://linktr.ee/gsbs_columbia"
}
];

const PAST_EVENTS = [
  {
    title: "Finance Careers in the Age of AI with Orina Chang",
    date: "April 8, 2026",
    description: "Partnered with Columbia EVG to host Wall Street veteran Orina Chang. We discussed how AI is reshaping private equity and hedge funds, drawing on her 30 years of experience at Carlyle, Morgan Stanley, and Oppenheimer Funds.",
    category: "Speaker Event",
    image: "/orina-chang-event.jpeg", 
    link: "https://www.linkedin.com/posts/the-columbia-gs-business-society_last-week-gsbs-partnered-with-columbia-enterprise-activity-7451842352786132992-P5Ou?utm_source=share&utm_medium=member_desktop&rcm=ACoAABY3M8EB69xaH0QG60BC3VGy1Lc8o8jeAaQ" 
  },
  {
    title: "Insight Partners x CQBS: Venture Capital & Growth Equity",
    date: "March 26, 2026",
    description: "A collaborative office visit with the Columbia Queer Business Society. We explored software business evaluation and product-market fit with Zachary Rosenfeld and Kedar Venkatesh at a firm with over $90B in AUM.",
    category: "Office Visit & Networking",
    image: "/insight-visit.jpeg",
    link: "https://www.linkedin.com/posts/the-columbia-gs-business-society_last-week-the-general-studies-business-society-activity-7445693369340551168-JIDd"
  },
  {
    title: "NYSE Floor Visit (Session 1)",
    date: "March 13, 2026",
    description: "The first session of our NYSE site visit series. Members went behind the scenes at 11 Wall Street to witness the opening of the world's most iconic trading floor and discuss market mechanics with seasoned floor brokers.",
    category: "Site Visit",
    image: "/nyse-visit-1.jpeg",
    link: "https://www.linkedin.com/posts/gx2173_inside-where-capital-markets-happen-a-gsbs-activity-7439448996751806464-ahuz?utm_source=share&utm_medium=member_desktop&rcm=ACoAABY3M8EB69xaH0QG60BC3VGy1Lc8o8jeAaQ"
  },
  {
    title: "GSBS Launch Event: The Power of Non-Traditional Leadership",
    date: "February 25, 2026",
    description: "Our inaugural event featuring Dean Marlyn Delva and panelists from Morgan Stanley and the CBS community. We explored how unique life detours forge the resilient leadership qualities needed in the professional world.",
    category: "Panel & Networking",
    image: "/launch-event.jpeg",
    link: "https://www.linkedin.com/posts/gx2173_columbia-general-studies-business-society-ugcPost-7432836934500061184-DS-A?utm_source=share&utm_medium=member_desktop&rcm=ACoAABY3M8EB69xaH0QG60BC3VGy1Lc8o8jeAaQ"
  }
];

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] transition-colors duration-300">

      {/* ── UPCOMING EVENTS ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-32">

        <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--columbia-blue)] mb-16">
          Upcoming Events
        </p>

        {UPCOMING_EVENTS.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {UPCOMING_EVENTS.map((event, index) => {
              const calendarLocation = encodeURIComponent(event.fullAddress || event.location);
              const gCalLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.date}/${event.endDate}&details=${encodeURIComponent(event.description)}&location=${calendarLocation}`;

              return (
                <div
                  key={index}
                  className="group grid md:grid-cols-[160px_1fr_auto] gap-6 md:gap-12 items-start py-10 first:pt-0"
                >
                  {/* Date column */}
                  <div className="shrink-0">
                    <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--accent-grey)] mb-1">
                      {event.dayOfWeek}
                    </p>
                    <p className="font-serif text-[var(--foreground)] text-lg leading-snug">
                      {event.displayDate}
                    </p>
                    <p className="text-[12px] text-[var(--accent-grey)] mt-1">
                      {event.time}
                    </p>
                  </div>

                  {/* Content column */}
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--columbia-blue)] mb-2">
                      {event.category}
                    </p>
                    <h3 className="font-serif text-2xl text-[var(--foreground)] leading-tight mb-3">
                      {event.title}
                    </h3>
                    <p className="text-[var(--accent-grey)] text-sm leading-relaxed max-w-xl">
                      {event.description}
                    </p>
                    <p className="text-[12px] text-[var(--accent-grey)] mt-3">
                      {event.location}
                    </p>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-row md:flex-col gap-3 shrink-0">
                    <a
                      href={event.rsvpLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#0072CE] hover:bg-[#005da8] text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all duration-200 shadow-sm active:scale-[0.99] whitespace-nowrap"
                    >
                      RSVP
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                    <a
                      href={gCalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent-grey)] hover:text-[var(--foreground)] border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-lg transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 whitespace-nowrap"
                    >
                      + Calendar
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[var(--accent-grey)] text-sm font-serif italic">
            New events for the spring semester will be announced shortly.
          </p>
        )}
      </section>

      {/* ── PAST HIGHLIGHTS ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-32">

        <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--columbia-blue)] mb-16">
          Past Highlights
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {PAST_EVENTS.map((event, index) => (
            <div key={index} className="group flex flex-col h-full">

              {/* Image */}
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 mb-6 overflow-hidden rounded-sm">
                <img
                  src={event.image}
                  alt={event.title}
                  className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute top-3 right-3 bg-[var(--background)] px-2 py-1 text-[8px] font-semibold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {event.category}
                </div>
              </div>

              {/* Date */}
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--columbia-blue)] mb-2">
                {event.date}
              </p>

              {/* Content */}
              <div className="flex flex-col flex-grow">
                <h3 className="font-serif text-xl text-[var(--foreground)] leading-tight mb-3 group-hover:text-[var(--columbia-blue)] transition-colors duration-200">
                  {event.title}
                </h3>
                <p className="text-sm text-[var(--accent-grey)] leading-relaxed mb-6 flex-grow">
                  {event.description}
                </p>
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground)] border-b border-[var(--columbia-blue)] pb-0.5 hover:text-[var(--columbia-blue)] transition-colors duration-200 w-fit"
                >
                  View on LinkedIn
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M7 7h10v10"/>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

      </section>

    </main>
  );
}