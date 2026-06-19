"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
  </svg>
);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const pathname = usePathname();
  const { user, loading, isAdmin } = useAuth();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "bg-[var(--background)]/70 backdrop-blur-xl shadow-[0_1px_30px_0_rgba(0,0,0,0.3)] border-b border-[var(--card-border)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="group flex items-center p-1">
          <Image
            src="/big.png"
            alt="GS Business Society"
            width={180}
            height={52}
            className="object-contain priority dark:brightness-0 dark:invert transition-all duration-500 ease-out group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(185,217,235,0.3)]"
            priority
          />
        </Link>
        
        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link, i) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative px-4 py-2 text-[13px] font-medium rounded-md transition-colors duration-200 group ${
                  isActive
                    ? "text-[var(--columbia-blue-light)]"
                    : "text-[var(--accent-grey)] hover:text-black dark:hover:text-white"
                }`}
              >
                <span
                  className={`absolute inset-0 rounded-md bg-[var(--columbia-blue-light)]/10 transition-opacity duration-200 ${
                    hoveredIndex === i ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span className="relative">{link.name}</span>
                <span
                  className={`absolute bottom-1 left-4 right-4 h-[1.5px] bg-[var(--columbia-blue-light)] rounded-full transition-all duration-300 origin-left ${
                    isActive
                      ? "scale-x-100 opacity-100"
                      : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-60"
                  }`}
                />
              </Link>
            );
          })}

          <a
            href="https://www.instagram.com/gsbs_columbia/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="ml-2 p-2 rounded-md text-[var(--accent-grey)] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <InstagramIcon />
          </a>

          {!loading && (
            <div className="flex items-center gap-2 ml-4">
              <Link 
                href={user ? "/dashboard" : "/login"}
                className="px-5 py-2 text-[13px] font-medium rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-black dark:text-white border border-black/10 dark:border-white/10 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
              >
                {user ? "Dashboard" : "Member Login"}
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE HAMBURGER */}
        <button
          className="md:hidden text-[var(--foreground)] p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200 focus:outline-none z-50"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          <div className="w-5 h-4 relative flex flex-col justify-between">
            <span className={`h-[1.5px] w-full bg-current transform transition-all duration-300 ease-in-out ${isOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`h-[1.5px] bg-current transition-all duration-200 ease-in-out ${isOpen ? "opacity-0 w-0" : "opacity-100 w-full"}`} />
            <span className={`h-[1.5px] w-full bg-current transform transition-all duration-300 ease-in-out ${isOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </div>
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`absolute top-20 left-0 w-full bg-[var(--background)]/95 backdrop-blur-xl border-b border-[var(--card-border)] transition-all duration-300 ease-in-out overflow-hidden md:hidden ${
          isOpen ? "max-h-[500px] opacity-100 shadow-2xl" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-6 py-6 space-y-2">
          {navLinks.map((link, i) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                style={{ transitionDelay: isOpen ? `${i * 40}ms` : "0ms" }}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl text-[13px] font-medium transition-all duration-300 ${
                  isOpen ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"
                } ${
                  isActive
                    ? "text-[var(--columbia-blue-light)] bg-[var(--columbia-blue-light)]/10"
                    : "text-[var(--accent-grey)] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--columbia-blue-light)] inline-block" />}
                {link.name}
              </Link>
            );
          })}

          {!loading && (
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
              <Link
                href={user ? "/dashboard" : "/login"}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-medium text-[var(--accent-grey)] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300"
              >
                {user ? "Dashboard" : "Member Login"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}