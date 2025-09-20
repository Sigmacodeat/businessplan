"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import ChaptersTOC from "@components/layout/ChaptersTOC";
import { useTranslations } from "next-intl";

export default function MobileChaptersSidebar({ currentChapter }: { currentChapter?: number }) {
  const [open, setOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const t = useTranslations();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      // Save last focused element to restore later
      lastFocusedRef.current = (document.activeElement as HTMLElement) ?? null;
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";

      // Focus trap: focus first focusable element inside panel
      const panel = panelRef.current;
      if (panel) {
        const focusables = panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0];
        first?.focus();
      }
    } else {
      // Restore body scroll and focus
      document.body.style.overflow = "";
      lastFocusedRef.current?.focus?.();
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onKeyDown]);

  // Live-Region: Status-Ansage bei Öffnen/Schließen
  useEffect(() => {
    const msg = open ? `${t('toc.title', { default: 'Inhaltsverzeichnis' })} geöffnet` : `${t('toc.title', { default: 'Inhaltsverzeichnis' })} geschlossen`;
    setStatusMsg(msg);
  }, [open, t]);

  // Close drawer on route/path change
  useEffect(() => {
    // Close unconditionally on route change (setting to same state is a no-op)
    setOpen(false);
  }, [pathname]);

  // Handle tab key within panel to loop focus
  const onPanelKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    const current = document.activeElement as HTMLElement | null;
    if (e.shiftKey) {
      if (current === first || !panel.contains(current)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (current === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  return (
    <div className="print:hidden">
      {/* Live-Region für Screenreader */}
      <div role="status" aria-live="polite" className="sr-only">{statusMsg}</div>
      {/* Vertikaler, dezenter Edge-Button (nur mobil sichtbar) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed left-0 top-1/3 z-[60] flex items-center justify-center rounded-r-2xl px-2 py-3 bg-[--color-surface]/80 supports-[backdrop-filter]:backdrop-blur-md shadow-md shadow-black/10 ring-[0.5px] ring-[--color-border-subtle] hover:bg-[--muted]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]/40"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-chapters-sidebar"
        aria-label={`${t('toc.title', { default: 'Inhaltsverzeichnis' })} ${t('toc.open', { default: 'aufklappen' })}`}
      >
        <span
          className="text-[11px] font-medium tracking-wider text-[--color-foreground-muted] [writing-mode:vertical-rl] rotate-180 select-none"
        >
          {`${t('toc.title', { default: 'Inhaltsverzeichnis' }).toUpperCase()} ${t('toc.open', { default: 'AUFKLAPPEN' }).toUpperCase()}`}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
            id="mobile-chapters-sidebar"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            {/* Panel */}
            <motion.div
              className="absolute inset-y-0 left-0 w-72 max-w-[85%] rounded-r-2xl bg-[--color-surface]/90 supports-[backdrop-filter]:backdrop-blur-md shadow-xl shadow-black/10 ring-[0.5px] ring-[--color-border-subtle]"
              initial={{ x: prefersReducedMotion ? 0 : -320 }}
              animate={{ x: 0 }}
              exit={{ x: prefersReducedMotion ? 0 : -320 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
              ref={panelRef}
              role="document"
              aria-labelledby="mobile-chapters-title"
              onKeyDown={onPanelKeyDown}
            >
              <div className="flex items-center justify-between px-3 py-2">
                <div id="mobile-chapters-title" className="toc-title text-[8px] font-normal tracking-[0.14em] text-[--color-foreground-muted] whitespace-nowrap overflow-hidden text-ellipsis">
                  {t("toc.title")}
                </div>
                <button
                  type="button"
                  className="p-2 rounded-md hover:bg-[--muted]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[--color-surface]"
                  onClick={() => setOpen(false)}
                  aria-label={t("common.close", { default: "Close" }) + ` ${t('toc.title', { default: 'Inhaltsverzeichnis' })}`}
                >
                  <X className="h-4 w-4 " />
                </button>
              </div>
              <div className="mt-1">
                {typeof currentChapter === "number" ? (
                  <ChaptersTOC currentChapter={currentChapter} />
                ) : (
                  <ChaptersTOC />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
