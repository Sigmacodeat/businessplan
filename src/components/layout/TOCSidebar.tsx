"use client";
import React, { useEffect, useState, useId, useRef } from "react";
import TOC, { TocItem } from "../print/TOC";

// Lightweight localStorage hook (SSR-safe)
function useLocalStorage<T>(key: string, initial: T) {
  // During SSR and the very first client render, always use the provided initial value
  // to keep markup identical between server and client (prevents hydration mismatch).
  const [value, setValue] = useState<T>(initial);

  // After mount, read the real value from localStorage and sync state.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // ignore read errors and keep initial
    }
  }, [key]);

  // Write back whenever the value changes (only runs on client after mount).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore write errors
    }
  }, [key, value]);

  return [value, setValue] as const;
}

// Scrollspy entfernt – keine automatische TOC-Aktivierung beim Scrollen

export default function TOCSidebar({ items, title }: { items: TocItem[]; title?: string }) {

  const [expanded, setExpanded] = useLocalStorage<boolean>("toc-expanded", true);
  const headingId = useId();
  const asideRef = useRef<HTMLElement | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>("");
  // Width is controlled via Tailwind utility classes below

  // Helper: detect if an element is an editable control to avoid stealing shortcuts
  const isEditable = (node: EventTarget | null): boolean => {
    const el = node as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    if ((el as HTMLElement).isContentEditable) return true;
    return false;
  };

  // Sync root attribute for layout offset
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-toc", expanded ? "expanded" : "collapsed");
    }
  }, [expanded]);

  // Ensure desktop starts expanded for visibility ONCE (only if no stored preference exists)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("toc-expanded");
      if (stored === null && window.innerWidth >= 1024) {
        setExpanded(true);
      }
    } catch {}
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live-Region: Status-Ansage bei Öffnen/Schließen
  useEffect(() => {
    const msg = expanded ? "Inhaltsverzeichnis geöffnet" : "Inhaltsverzeichnis geschlossen";
    setStatusMsg(msg);
  }, [expanded]);

  // Collapse/Expand via Outside-Click & Keyboard (Esc / Alt+Arrows)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPointerDown = (ev: MouseEvent | TouchEvent) => {
      if (!expanded) return;
      const target = ev.target as Node | null;
      const asideEl = asideRef.current;
      // If click/touch occurs inside the sidebar or the edge toggle, ignore
      if (asideEl && asideEl.contains(target)) return;
      setExpanded(false);
    };
    const onKeyDown = (ev: KeyboardEvent) => {
      // Close when expanded via Escape
      if (expanded && (ev.key === "Escape" || ev.key === "Esc")) {
        setExpanded(false);
        return;
      }
      // Quick toggle via Alt+ArrowRight (open) / Alt+ArrowLeft (close)
      // Guard: do not hijack when focus is within an editable control
      const active = (document.activeElement as HTMLElement | null);
      if (isEditable(active)) return;
      if (ev.altKey && ev.key === "ArrowRight") {
        setExpanded(true);
        return;
      }
      if (ev.altKey && ev.key === "ArrowLeft") {
        setExpanded(false);
        return;
      }
    };
    document.addEventListener("mousedown", onPointerDown, true);
    document.addEventListener("touchstart", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown, true);
      document.removeEventListener("touchstart", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded, setExpanded]);

  // Unified aside with smooth width/opacity transitions + persistent edge tab toggle
  return (
    <>
      {/* Live-Region für Screenreader: kündigt Öffnen/Schließen an */}
      <div role="status" aria-live="polite" className="sr-only">{statusMsg}</div>
      <aside
        id="toc-panel"
        aria-labelledby={`toc-title-${headingId}`}
        role="complementary"
        aria-label={title ?? "Inhaltsverzeichnis"}
        ref={asideRef}
        className={[
          "flex print:hidden fixed left-0 top-20 z-[500] h-[calc(100dvh-6rem)] will-change-[width]",
          "transition-[width] duration-300 ease-out motion-reduce:transition-none",
          expanded ? "w-[360px]" : "w-[72px]",
        ].join(" ")}
        style={{ left: expanded ? 0 : -6 }}
      >
        <div
          className={[
            "relative w-full h-[92%] pointer-events-auto rounded-2xl text-[--color-foreground] shadow-xl shadow-black/10 ring-[0.5px] ring-[--color-border-subtle] overflow-hidden flex flex-col",
            expanded
              ? "bg-[--color-surface]/85 dark:bg-[--color-surface]/95 supports-[backdrop-filter]:backdrop-blur-md"
              : "bg-[--color-surface] dark:bg-[--color-surface]"
          ].join(" ")}
        >
          {/* Collapsed-Rail (intern): sichtbarer Bereich mit Label und Toggle */}
          {!expanded && (
            <div className="absolute inset-0 flex flex-col items-center justify-between py-2">
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md ring-[0.5px] ring-[--color-border-subtle] bg-[--color-surface] hover:bg-[--muted] text-[--color-foreground-muted] focus:outline-none focus-visible:ring-2"
                aria-label="Inhaltsverzeichnis öffnen"
                aria-controls="toc-panel"
                title="Inhaltsverzeichnis öffnen"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
              <div className="flex-1 flex items-center justify-center">
                <span className="text-[10px] tracking-[0.2em] text-[--color-foreground-muted] rotate-90 select-none">INHALT</span>
              </div>
              <div className="h-5" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[--color-border] to-transparent opacity-20" />
            </div>
          )}
          {/* Header / Title row (only when expanded) */}
          {expanded && (
            <div className="py-2 px-3 flex items-center justify-between border-b border-[--color-border-subtle]">
              <div
                id={`toc-title-${headingId}`}
                className="toc-title"
                role="heading"
                aria-level={2}
              >
                {title ?? "Inhaltsverzeichnis"}
              </div>
              {/* Header toggle (redundant to edge tab for reliability) */}
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls="toc-panel"
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md ring-[0.5px] ring-[--color-border-subtle] bg-[--color-muted]/40 hover:bg-[--muted] transition-colors focus:outline-none focus-visible:ring-2 pointer-events-auto"
                title="Einklappen"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            </div>
          )}

          {/* Collapsed state: no inner rail content to prevent visual bleed; use edge tab to expand */}

          {/* TOC list – render only when expanded to prevent bleed-through */}
          {expanded && (
            <div
              className="transition-all duration-300 opacity-100 overflow-y-auto px-3 pb-4 flex-1 min-h-0"
              aria-hidden={false}
            >
              <TOC items={items} showTitle={false} compact={true} disableScrollSpy={true} headerOffset={48} />
            </div>
          )}
        </div>
      </aside>

      {/* Externe Peek-Rail entfernt – interne Collapsed-Rail zeigt nun mehr Sidebar */}

      {/* Backdrop overlay to emphasize focus and allow click-to-close – mobile only */}
      {expanded && (
        <div
          aria-hidden
          className="print:hidden fixed inset-0 z-[190] bg-black/20 backdrop-blur-[1px] lg:hidden"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Persistent edge tab toggle entfernt – nur Header-Button bleibt für klare UX */}
    </>
  );
}
