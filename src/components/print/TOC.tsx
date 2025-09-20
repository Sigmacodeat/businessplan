"use client";
import React, { useEffect, useMemo, useRef, useState, useId } from "react";
import { scrollToAnchor, getEffectiveTopOffset } from "@/lib/scroll";
import { useTranslations } from "next-intl";

export type TocItem = {
  id: string; // anchor id of a section heading
  label: string;
  level?: 1 | 2 | 3; // visual indent only
};

export default function TOC({ items, title, showTitle = true, compact = false, disableScrollSpy = false, headerOffset = 56 }: { items: TocItem[]; title?: string; showTitle?: boolean; compact?: boolean; disableScrollSpy?: boolean; headerOffset?: number }) {
  // Scroll-Spy: identifiziere aktive Sektion per IntersectionObserver
  const [activeId, setActiveId] = useState<string | null>(null);
  const headingId = useId();
  const t = useTranslations("toc");
  const resolvedTitle = title ?? t("title", { default: "Inhaltsverzeichnis" });
  const listRef = useRef<HTMLUListElement | null>(null);

  const ids = useMemo(() => items.map((i) => i.id), [items]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // initialer Status aus URL-Hash (erlaubt aktive Markierung nach Link-Klick/Reload)
    const hash = window.location.hash?.replace(/^#/, "");
    if (hash && ids.includes(hash)) {
      setActiveId(hash);
    }

    // Scrollspy optional deaktivierbar
    let observer: IntersectionObserver | null = null;
    if (!disableScrollSpy && "IntersectionObserver" in window) {
      const options: IntersectionObserverInit = {
        root: null,
        rootMargin: "-50% 0px -50% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      };
      observer = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.getAttribute('id');
          if (id && ids.includes(id)) setActiveId(id);
        } else {
          const tops = ids
            .map((id) => {
              const el = document.getElementById(id);
              if (!el) return { id, top: Infinity };
              return { id, top: el.getBoundingClientRect().top };
            })
            .sort((a, b) => a.top - b.top);
          const lastAbove = [...tops].reverse().find((t) => t.top <= 64);
          if (lastAbove) setActiveId(lastAbove.id);
        }
      }, options);

      const elements = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => Boolean(el));
      elements.forEach((el) => observer!.observe(el));
    }

    const onHashChange: EventListener = () => {
      const h = window.location.hash?.replace(/^#/, "");
      if (h && ids.includes(h)) setActiveId(h);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      if (observer) observer.disconnect();
    };
  }, [ids, disableScrollSpy]);

  // Initial zu Anker scrollen (mit intelligentem Header-Offset) und Hash-Änderungen behandeln
  useEffect(() => {
    if (typeof window === "undefined") return;
    const scrollToHash = () => {
      const id = window.location.hash?.slice(1);
      if (!id) return;
      // headerOffset aus Props hat Vorrang, sonst auto ermitteln
      scrollToAnchor(id, { headerOffset, updateHash: false });
    };

    // initial
    scrollToHash();
    // on change
    const onHashChange: EventListener = () => scrollToHash();
    window.addEventListener('hashchange', onHashChange, { passive: true } as AddEventListenerOptions);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [headerOffset]);

  // Halte den aktiven Link im sichtbaren Bereich der TOC-Liste
  useEffect(() => {
    const ul = listRef.current;
    if (!ul || !activeId) return;
    const link = ul.querySelector<HTMLAnchorElement>(`a[href="#${CSS.escape(activeId)}"]`);
    if (!link) return;
    const prefersReduced = typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
    // Nur scrollen, wenn Link außerhalb des sichtbaren Bereichs liegt; dann möglichst nahe einblenden
    const ulRect = ul.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const isAbove = linkRect.top < ulRect.top + 8;
    const isBelow = linkRect.bottom > ulRect.bottom - 8;
    if (isAbove || isBelow) {
      link.scrollIntoView({ block: 'nearest', behavior: prefersReduced ? 'auto' : 'smooth' });
    }
  }, [activeId]);

  // Bei Resize/Layout-Shift den aktiven Link erneut zentrieren
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler: EventListener = () => {
      if (!activeId) return;
      const ul = listRef.current;
      if (!ul) return;
      const link = ul.querySelector<HTMLAnchorElement>(`a[href="#${CSS.escape(activeId)}"]`);
      if (link) {
        const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        const ulRect = ul.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();
        const isAbove = linkRect.top < ulRect.top + 8;
        const isBelow = linkRect.bottom > ulRect.bottom - 8;
        if (isAbove || isBelow) {
          link.scrollIntoView({ block: 'nearest', behavior: prefersReduced ? 'auto' : 'smooth' });
        }
      }
    };
    window.addEventListener('resize', handler, { passive: true } as AddEventListenerOptions);
    return () => window.removeEventListener('resize', handler);
  }, [activeId]);

  const paddingClass = () => {
    // Einheitliche Ausrichtung: keine zusätzliche Einrückung je Level,
    // damit alle Subkapitel in einer geraden vertikalen Linie stehen.
    return "pl-0";
  };

  // Group items by top-level (level 1 = Kapitel), collect level 2/3 as children
  const groups = useMemo(() => {
    const out: { parent: typeof items[number]; children: typeof items }[] = [];
    let current: { parent: typeof items[number]; children: typeof items } | null = null;
    for (const it of items) {
      if ((it.level ?? 1) === 1) {
        current = { parent: it, children: [] };
        out.push(current);
      } else if (current) {
        current.children.push(it);
      }
    }
    return out;
  }, [items]);

  return (
    <nav
      aria-labelledby={`toc-heading-${headingId}`}
      className={`${compact ? "my-2" : "my-6"} not-prose print:show`}
      data-toc-version="compact-v2"
    >
      <div className="reading-max">
        {showTitle !== false && (
          <h2
            id={`toc-heading-${headingId}`}
            className="toc-title sticky top-0 z-10 opacity-90 bg-[--color-surface]/85 supports-[backdrop-filter]:backdrop-blur-md py-1 mb-1 font-normal tracking-[0.14em] text-[--color-foreground-muted] uppercase text-[8px] opacity-90"
          >
            {resolvedTitle}
          </h2>
        )}
        <ul
          ref={listRef}
          className={`list-none m-0 p-0 !px-0 !pl-0 !pr-0 avoid-break-inside h-auto sm:h-[calc(100dvh-10rem)] max-h-[60vh] sm:max-h-none overflow-auto space-y-0 scrollbar-hide`}
          style={{ margin: 0, padding: 0, paddingInlineStart: 0, paddingRight: 0, scrollbarGutter: "stable both-edges", listStyleType: "none" }}
          data-testid="toc-list"
        >
          {groups.map(({ parent, children }) => {
            const parentActive = parent.id === activeId || children.some((c) => c.id === activeId);
            return (
              <li key={parent.id} className="rounded-md my-0 py-0">
                {/* Top-Level: Kapitel */}
                <a
                  href={`#${parent.id}`}
                  aria-current={parent.id === activeId ? "location" : undefined}
                  className={
                    `group rounded-md px-2 ${compact ? "py-1 sm:py-0.5" : "py-2 sm:py-0.5"} ${compact ? "text-[12px] md:text-[12px] font-normal text-[--color-foreground-muted]" : "text-[13px] md:text-[14px] font-medium"} leading-snug flex items-start transition-colors min-w-0 ` +
                    `hover:bg-[--muted]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent-4] ` +
                    (parentActive
                      ? "font-medium bg-[--color-primary]/10 text-[--color-deep-blue] dark:text-[--color-deep-blue] ring-[0.5px] ring-black/10"
                      : `${compact ? "text-[--color-foreground-muted]" : "text-[--color-foreground] dark:text-[--color-foreground-muted]"}`)
                  }
                  onClick={(e) => {
                    if (typeof window === "undefined") return;
                    e.preventDefault();
                    const id = parent.id;
                    const ok = scrollToAnchor(id, { headerOffset });
                    if (ok) setActiveId(id);
                  }}
                >
                  <div className={`flex ${compact ? "flex-col items-start gap-0" : "items-center justify-between"} min-w-0`}>
                    <span className={`flex-1 min-w-0`}>
                      {/* Prefix „Kapitel“ für Top-Level */}
                      {compact ? (
                        <>
                          <span className="inline-block rounded-sm bg-[--color-muted]/70 px-1 py-0 text-[10px] uppercase leading-tight font-medium text-[--color-foreground-muted]/90">Kapitel</span>
                          <div className="mt-0 leading-[1.05] whitespace-nowrap overflow-hidden text-ellipsis md:whitespace-normal md:overflow-visible">{parent.label}</div>
                        </>
                      ) : (
                        <>
                          <span className="mr-1 inline-block rounded-sm bg-[--color-muted]/70 px-1 py-0 text-[12px] uppercase leading-tight font-medium text-[--color-foreground-muted]">Kapitel</span>
                          <span className="flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis md:whitespace-normal md:overflow-visible leading-tight">{parent.label}</span>
                        </>
                      )}
                    </span>
                    {/* Active indicator bar (only non-compact or align to end) */}
                    {!compact && (
                    <span className={`ml-1 h-2 w-[2px] rounded-full ${parentActive ? "bg-[--color-deep-blue] dark:bg-[--color-deep-blue]" : "bg-transparent"}`} />
                    )}
                  </div>
                </a>

              {/* Subsections */}
              {children.length > 0 && (
                <ul className={`list-none p-0 m-0 ml-2 border-l border-[--color-border-subtle] ${compact ? "pl-1.5 mt-0 space-y-0" : "pl-1.5 mt-0 space-y-0"}`}>
                  {children.map((child) => {
                    const isActive = child.id === activeId;
                    return (
                      <li key={child.id} className={`my-0 py-0 ${paddingClass()}`}>
                        <a
                          href={`#${child.id}`}
                          aria-current={isActive ? "location" : undefined}
                          className={
                            `relative flex items-start gap-1 rounded-md px-2 ${compact ? "py-1 sm:py-0.5" : "py-2 sm:py-0.5"} ${compact ? "text-[11px] md:text-[12px] font-normal text-[--color-foreground-muted]" : "text-[13px] md:text-[14px] font-medium"} leading-snug whitespace-nowrap overflow-hidden text-ellipsis md:whitespace-normal md:overflow-visible transition-colors min-w-0 ` +
                            `hover:bg-[--muted]/40 hover:text-[--color-deep-blue] dark:hover:text-[--color-deep-blue] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent-4] ` +
                            (isActive
                              ? "font-semibold bg-[--color-primary]/10 text-[--color-deep-blue] dark:text-[--color-deep-blue] ring-[0.5px] ring-black/10"
                              : `${compact ? "text-[--color-foreground-muted]" : "text-[--color-foreground] dark:text-[--color-foreground-muted]"}`)
                          }
                          onClick={(e) => {
                            if (typeof window === "undefined") return;
                            e.preventDefault();
                            const id = child.id;
                            const ok = scrollToAnchor(id, { headerOffset });
                            if (ok) setActiveId(id);
                          }}
                        >
                          {/* Bullet/Dot for deeper levels */}
                          <span className={`mt-0.5 inline-block h-1 w-1 rounded-full ${isActive ? "bg-[--color-deep-blue] dark:bg-[--color-deep-blue]" : "bg-[--color-border]"}`} />
                          <span className="flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis md:whitespace-normal md:overflow-visible">{child.label}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  </nav>
  );
}
