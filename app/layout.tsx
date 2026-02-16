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
    // We move font-serif to the html tag to ensure everything, 
    // including the scrollbar and overlays, defaults to serif.
    <html lang="en" className="scroll-smooth font-serif">
      <body className="antialiased bg-white text-[#333333] min-h-screen flex flex-col">
        
        <Navbar />

        {/* PAGE CONTENT */}
        <main className="flex-grow">
          {children}
        </main>

        {/* GLOBAL FOOTER */}
        <footer className="bg-[#6D6E71] py-16 text-white">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <p className="font-bold text-xl mb-1">GS Business Society</p>
              <p className="text-xs text-gray-300 uppercase tracking-[0.2em]">
                Columbia University
              </p>
            </div>
            
            <div className="flex gap-8 text-xs font-bold uppercase tracking-[0.2em]">
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-[#C4D8E2] transition-colors"
              >
                LinkedIn
              </a>
              <a 
                href="https://www.instagram.com/gsbs_columbia/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-[#C4D8E2] transition-colors"
              >
                Instagram
              </a>
              <p className="text-gray-400">© 2026</p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}