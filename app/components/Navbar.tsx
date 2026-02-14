'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/events' },
    { name: 'About', href: '/about' },
    { name: 'Newsletter', href: '/#newsletter' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center">
          <Link href="/">
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
        <div className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-widest text-[#6D6E71]">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="hover:text-[#C4D8E2] transition-colors">
              {link.name}
            </Link>
          ))}
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <button 
          className="md:hidden text-[#6D6E71] focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-6 py-6 space-y-4 shadow-xl">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              onClick={() => setIsOpen(false)}
              className="block text-sm font-medium uppercase tracking-widest text-[#6D6E71] hover:text-[#C4D8E2]"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}