'use client';

import { ThemeProvider, useTheme } from 'next-themes';
import { useEffect, useState } from "react";
import Header from "@components/layout/Header";
import PrintHeaderFooter from "@components/print/PrintHeaderFooter";
import MotionProvider from "@/components/animation/MotionProvider";

export default function ClientLayout({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: 'light' | 'dark';
}) {
  const [mounted, setMounted] = useState(false);

  // Mount-Flag für Skeleton bis zur Hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={initialTheme ?? 'light'}
      enableSystem={false}
      storageKey="theme"
    >
      {/* Synchronisiert data-theme mit der aktiven Klasse */}
      <ThemeSync />
      <div>
        {/* Skip-Link für Tastaturnutzer */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[1000] focus:bg-[--color-surface] focus:text-[--color-foreground] focus:ring-2 focus:ring-[--color-primary] focus:px-3 focus:py-2 focus:rounded-md shadow-md"
        >
          Zum Inhalt springen
        </a>
        <MotionProvider>
          <Header />
          <main id="main" role="main" className="min-h-screen pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {mounted ? children : <div className="min-h-[60vh]" />}
            </div>
          </main>
          <PrintHeaderFooter />
        </MotionProvider>
      </div>
    </ThemeProvider>
  );
}

// Kleiner Helper, der nach Mount die data-theme auf <html> aktuell hält
function ThemeSync() {
  const { theme, resolvedTheme } = useTheme();
  useEffect(() => {
    const current = (theme || resolvedTheme || 'light') as string;
    document.documentElement.setAttribute('data-theme', current);
  }, [theme, resolvedTheme]);
  return null;
}
