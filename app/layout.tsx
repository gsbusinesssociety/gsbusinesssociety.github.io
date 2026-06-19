import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import { GoogleAnalytics } from '@next/third-parties/google';
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "General Studies Business Society",
  description: "Columbia's premier organization for professional excellence.",
  icons: {
    icon: "/favicon.ico",
  },
};

// Add sponsor logos here as you acquire them:
// { name: "Firm Name", logo: "/sponsors/firm.svg", href: "https://firm.com" }
const sponsors: { name: string; logo: string; href: string }[] = [];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)] min-h-screen flex flex-col transition-colors duration-300" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
          <Navbar />
          <GoogleAnalytics gaId="G-ZY4HTMYZ76" />

          <main className="flex-grow">
            {children}
          </main>

        <footer className="bg-[var(--background)] border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6 py-16">

            {/* Sponsor logos — only renders once sponsors array is populated */}
            {sponsors.length > 0 && (
              <div className="mb-10">
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--accent-grey)] mb-6">
                  Partners
                </p>
                <div className="flex flex-wrap items-center gap-8">
                  {sponsors.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.name}
                      className="opacity-50 hover:opacity-100 transition-opacity duration-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.logo} alt={s.name} className="h-6 object-contain dark:invert" />
                    </a>
                  ))}
                </div>
                <div className="mt-10" />
              </div>
            )}

            {/* Bottom row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="font-serif text-[var(--foreground)] text-base">
                General Studies Business Society
              </p>
              <p className="text-[11px] text-[var(--accent-grey)]">
                © 2026 Columbia University
              </p>
            </div>

          </div>
        </footer>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}