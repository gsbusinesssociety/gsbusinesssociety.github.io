import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "GS Business Society",
  description: "Columbia's premier organization for professional excellence.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased font-serif bg-white text-[#333333]">
        
        {/* GLOBAL NAVIGATION */}
        <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center">
              <a href="/">
                <Image 
                  src="/small.png" 
                  alt="GS Business Society" 
                  width={160} 
                  height={50} 
                  className="object-contain"
                  priority 
                />
              </a>
            </div>
            <div className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-widest text-[#6D6E71]">
              <a href="/" className="hover:text-[#C4D8E2] transition-colors">Home</a>
              <a href="/events" className="hover:text-[#C4D8E2] transition-colors">Events</a>
              <a href="/about" className="hover:text-[#C4D8E2] transition-colors">About</a>
              <a href="/#newsletter" className="hover:text-[#C4D8E2] transition-colors">Newsletter</a>
              <a href="/contact" className="hover:text-[#C4D8E2] transition-colors">Contact</a>
            </div>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        {children}

        {/* GLOBAL FOOTER */}
        <footer className="bg-[#6D6E71] py-16 text-white mt-auto">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <p className="font-serif font-bold text-xl mb-1">GS Business Society</p>
              <p className="text-xs text-gray-300 uppercase tracking-widest">Columbia University</p>
            </div>
            <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
              <a href="https://linkedin.com" target="_blank" className="hover:text-[#C4D8E2] transition-colors">LinkedIn</a>
              <a href="https://instagram.com" target="_blank" className="hover:text-[#C4D8E2] transition-colors">Instagram</a>
              <p className="text-gray-400">© 2026</p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}