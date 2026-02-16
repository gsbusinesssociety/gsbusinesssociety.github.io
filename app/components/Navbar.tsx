'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/events' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md ">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image 
              src="/small.png" 
              alt="GS Business Society" 
              width={140} 
              height={40} 
              className="object-contain"
              priority 
            />
          </Link>
        </div>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex gap-8 text-sm uppercase tracking-[0.2em] text-[#6D6E71]">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="hover:text-[#C4D8E2] transition-colors">
              {link.name}
            </Link>
          ))}
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <button 
          className="md:hidden text-[#6D6E71] p-2 focus:outline-none z-50"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span className={`h-0.5 w-full bg-current transform transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`h-0.5 w-full bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`h-0.5 w-full bg-current transform transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* ANIMATED MOBILE MENU */}
      <div 
        className={`absolute top-20 left-0 w-full bg-white border-b border-gray-100 transition-all duration-300 ease-in-out overflow-hidden md:hidden ${
          isOpen ? 'max-h-[400px] opacity-100 shadow-xl' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-6 py-8 space-y-6">
          {navLinks.map((link, i) => (
            <Link 
              key={link.name} 
              href={link.href} 
              onClick={() => setIsOpen(false)}
              style={{ transitionDelay: `${i * 50}ms` }}
              className={`block text-sm uppercase tracking-[0.2em] text-[#6D6E71] hover:text-[#C4D8E2] transition-all duration-300 ${
                isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}