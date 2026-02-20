import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/app/components/Navbar"; 

export const metadata: Metadata = {
  title: "GS Business Society",
  description: "Columbia's premier organization for professional excellence.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      {/* 1. Changed bg-white to var(--background)
        2. Changed text-[#333333] to var(--foreground)
        3. Removed font-serif from html to avoid messing up buttons/inputs, 
           letting the specific components handle typography.
      */}
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)] min-h-screen flex flex-col transition-colors duration-300">
        
        <Navbar />

        {/* PAGE CONTENT */}
        <main className="flex-grow">
          {children}
        </main>

        {/* GLOBAL FOOTER */}
        {/* FIX: Used a slightly darker background than the accent-grey for text contrast */}
        <footer className="bg-[#2A2A2A] dark:bg-[#0F0F0F] py-8 text-white border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <p className="font-serif text-xl mb-1 tracking-tight">GS Business Society</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-sans">
                Columbia University
              </p>
            </div>
            
            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] font-sans">
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                /* Changed hover to the accessible blue variable */
                className="hover:text-[var(--columbia-blue)] transition-colors"
              >
                LinkedIn
              </a>
              <a 
                href="https://www.instagram.com/gsbs_columbia/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-[var(--columbia-blue)] transition-colors"
              >
                Instagram
              </a>
              <p className="text-gray-500">© 2026</p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}