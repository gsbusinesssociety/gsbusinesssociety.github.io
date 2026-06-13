'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

// Example of an upcoming event structure for when they need to be populated:
// {
//   title: "Ask an Incoming Analyst: Peer-to-Peer Panel",
//   date: "20260422T190000", 
//   endDate: "20260422T210000",
//   dayOfWeek: "Wednesday",
//   displayDate: "Wednesday, April 22, 2026",
//   time: "7:00 PM - 9:00 PM",
//   location: "MLK 610 (91 Claremont Ave)",
//   fullAddress: "91 Claremont Ave, New York, NY 10027", 
//   description: "Join GSBS, GSRA, and CQBS for a panel with students who landed roles at JPM, MS, Goldman, McKinsey, and more.",
//   category: "Peer Mentorship",
//   rsvpLink: "https://linktr.ee/gsbs_columbia"
// }

const PAST_EVENTS = [
  {
    title: "Breaking into McKinsey with Özgü Kokal",
    date: "April 2, 2026",
    description: "An intimate session with McKinsey Associate Özgü Kokal. We discussed the realities of top-tier consulting, how AI is impacting real client engagements, and navigating the industry from a non-traditional background.",
    category: "Speaker Event",
    image: "/mckinsey-session.jpeg", 
    link: "https://www.linkedin.com/posts/the-columbia-gs-business-society_last-week-gsbs-hosted-%C3%B6zg%C3%BC-kokal-a-columbia-activity-7447865206954680321-tI2E"
  },
  {
    title: "Finance Careers in the Age of AI with Orina Chang",
    date: "April 8, 2026",
    description: "Partnered with Columbia EVG to host Wall Street veteran Orina Chang. We discussed how AI is reshaping private equity and hedge funds, drawing on her 30 years of experience at Carlyle, Morgan Stanley, and Oppenheimer Funds.",
    category: "Speaker Event",
    image: "/orina-chang-event.jpeg", 
    link: "https://www.linkedin.com/posts/the-columbia-gs-business-society_last-week-gsbs-partnered-with-columbia-enterprise-activity-7451842352786132992-P5Ou" 
  },
  {
    title: "Insight Partners x CQBS: Venture Capital & Growth Equity",
    date: "March 26, 2026",
    description: "A collaborative office visit with the Columbia Queer Business Society. We explored software business evaluation and product-market fit with Zachary Rosenfeld and Kedar Venkatesh at a firm with over $90B in AUM.",
    category: "Office Visit",
    image: "/insight-visit.jpeg",
    link: "https://www.linkedin.com/posts/the-columbia-gs-business-society_last-week-the-general-studies-business-society-activity-7445693369340551168-JIDd"
  },
  {
    title: "NYSE Floor Visit (Session 1)",
    date: "March 13, 2026",
    description: "The first session of our NYSE site visit series. Members went behind the scenes at 11 Wall Street to witness the opening of the world's most iconic trading floor and discuss market mechanics with seasoned floor brokers.",
    category: "Site Visit",
    image: "/nyse-visit-1.jpeg",
    link: "https://www.linkedin.com/posts/gx2173_inside-where-capital-markets-happen-a-gsbs-activity-7439448996751806464-ahuz"
  },
  {
    title: "The Power of Non-Traditional Leadership",
    date: "February 25, 2026",
    description: "Our inaugural event featuring Dean Marlyn Delva and panelists from Morgan Stanley and the CBS community. We explored how unique life detours forge the resilient leadership qualities needed in the professional world.",
    category: "Panel",
    image: "/launch-event.jpeg",
    link: "https://www.linkedin.com/posts/gx2173_columbia-general-studies-business-society-ugcPost-7432836934500061184-DS-A"
  }
];

export default function EventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snap = await getDocs(collection(db, "events"));
        if (!snap.empty) {
          setUpcomingEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, []);

  return (
    <main className="min-h-screen transition-colors duration-500 pb-32 relative">

      {/* ── UPCOMING EVENTS ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-32 relative z-10">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[var(--accent-grey)] mb-12 border-b border-white/10 pb-4">
          Upcoming Events
        </p>

        {upcomingEvents.length > 0 ? (
          <div className="space-y-6">
            {upcomingEvents.map((event, index) => {
              const calendarLocation = encodeURIComponent(event.fullAddress || event.location);
              const gCalLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.date}/${event.endDate}&details=${encodeURIComponent(event.description)}&location=${calendarLocation}`;

              return (
                <div
                  key={index}
                  className="glass-panel group grid md:grid-cols-[200px_1fr_auto] gap-6 md:gap-12 items-start p-8 rounded-3xl hover:bg-white/[0.05] transition-all duration-300"
                >
                  {/* Date column */}
                  <div className="shrink-0">
                    <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--columbia-blue-light)] mb-2">
                      {event.dayOfWeek}
                    </p>
                    <p className="font-serif text-white text-2xl leading-snug mb-2">
                      {event.displayDate}
                    </p>
                    <p className="text-[13px] text-[var(--accent-grey)] font-light">
                      {event.time}
                    </p>
                  </div>

                  {/* Content column */}
                  <div>
                    <p className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-semibold tracking-[0.18em] uppercase text-white mb-4">
                      {event.category}
                    </p>
                    <h3 className="font-serif text-3xl text-white leading-tight mb-4 group-hover:text-[var(--columbia-blue-light)] transition-colors duration-300">
                      {event.title}
                    </h3>
                    <p className="text-[var(--accent-grey)] text-[15px] leading-relaxed font-light mb-4">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-2 text-[13px] text-white/60 font-light">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {event.location}
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-row md:flex-col gap-3 shrink-0 self-center md:self-start">
                    <a
                      href={event.rsvpLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98] whitespace-nowrap"
                    >
                      RSVP
                    </a>
                    <a
                      href={gCalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 text-sm font-medium text-white/70 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 px-6 py-3 rounded-xl transition-all duration-300 active:scale-[0.98] whitespace-nowrap"
                    >
                      + Calendar
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-10 rounded-3xl text-center border-dashed border-white/10">
            <p className="text-[var(--accent-grey)] text-[15px] font-light">
              New events for the upcoming semester will be announced shortly.
            </p>
          </div>
        )}
      </section>

      {/* ── PAST HIGHLIGHTS ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 relative z-10">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[var(--accent-grey)] mb-12 border-b border-white/10 pb-4">
          Past Highlights
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PAST_EVENTS.map((event, index) => (
            <div 
              key={index} 
              className="group glass-panel p-6 rounded-3xl flex flex-col h-full transition-all duration-500 hover:bg-white/[0.04]"
            >
              {/* Image */}
              <div className="relative aspect-video bg-white/5 mb-6 overflow-hidden rounded-xl ring-1 ring-white/5">
                <img
                  src={event.image}
                  alt={event.title}
                  className="object-cover w-full h-full grayscale-[50%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[9px] font-semibold uppercase tracking-widest text-white">
                  {event.category}
                </div>
              </div>

              {/* Date */}
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--columbia-blue-light)] mb-3">
                {event.date}
              </p>

              {/* Content */}
              <div className="flex flex-col flex-grow">
                <h3 className="font-serif text-2xl text-white leading-tight mb-4 group-hover:text-[var(--columbia-blue-light)] transition-colors duration-300">
                  {event.title}
                </h3>
                <p className="text-[14px] text-[var(--accent-grey)] font-light leading-relaxed mb-8 flex-grow">
                  {event.description}
                </p>
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white hover:text-[var(--columbia-blue-light)] transition-colors duration-300 w-fit group/link"
                >
                  View on LinkedIn
                  <span className="group-hover/link:translate-x-1 transition-transform duration-300">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}