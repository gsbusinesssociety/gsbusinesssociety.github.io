import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/app/components/Navbar"; // Adjust path if needed

export const metadata: Metadata = {
  title: "GS Business Society",
  description: "Columbia's premier organization for professional excellence.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased font-serif bg-white text-[#333333] min-h-screen flex flex-col">
        
        <Navbar />

        {/* PAGE CONTENT */}
        <main className="flex-grow">
          {children}
        </main>

        {/* GLOBAL FOOTER */}
        <footer className="bg-[#6D6E71] py-16 text-white">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <p className="font-serif font-bold text-xl mb-1">GS Business Society</p>
              <p className="text-xs text-gray-300 uppercase tracking-widest">Columbia University</p>
            </div>
            <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
              <a href="https://linkedin.com" target="_blank" className="hover:text-[#C4D8E2] transition-colors">LinkedIn</a>
              <a href="https://www.instagram.com/gsbs_columbia/" target="_blank" className="hover:text-[#C4D8E2] transition-colors">Instagram</a>
              <p className="text-gray-400">© 2026</p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}