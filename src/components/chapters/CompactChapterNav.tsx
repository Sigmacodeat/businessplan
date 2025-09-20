"use client";

import Link from "next/link";
import { chapters } from "@/chapters/chapters.config";
import clsx from "clsx";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import React from "react";
import { buildLocalePath } from "@/i18n/path";
import { scrollToAnchor } from "@/lib/scroll";

type Orientation = "horizontal" | "vertical";

export default function CompactChapterNav({ currentChapter, orientation = "horizontal" }: { currentChapter?: number; orientation?: Orientation }) {
  const isHorizontal = orientation === "horizontal";
  const pathname = usePathname();
  const tCover = useTranslations("chapters.cover");
  const tBp = useTranslations("bp");
  const locale = useLocale();
  const isCoverActive = pathname?.endsWith("/chapters/cover");
  const coverLabel = tCover("title");
  const withLocalePrefix = (path: string) => buildLocalePath(locale, path);
  const chapterWord = locale?.startsWith("de") ? "Kapitel" : "Chapter";
  const isGerman = locale?.startsWith("de");
  // Aktueller Hash (für Unterkapitel‑Aktivierung)
  const [hash, setHash] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const apply = () => setHash(window.location.hash?.replace(/^#/, "") || undefined);
    apply();
    window.addEventListener("hashchange", apply, false);
    return () => window.removeEventListener("hashchange", apply, false);
  }, []);

  // Robust: Kapitel aus der URL ableiten (Layout liefert nicht zuverlässig chapterId)
  const derivedId = React.useMemo(() => {
    if (!pathname) return undefined;
    const m = pathname.match(/\/chapters\/(\d+)(?:$|\/?)/);
    return m ? Number(m[1]) : undefined;
  }, [pathname]);
  // Wenn wir auf dem Deckblatt sind, soll ausschließlich das Deckblatt markiert sein
  // (übergebene Props wie currentChapter werden dann ignoriert)
  const activeChapter = React.useMemo(() => {
    if (isCoverActive) return undefined;
    if (typeof derivedId === 'number' && !Number.isNaN(derivedId)) return derivedId;
    return currentChapter;
  }, [isCoverActive, derivedId, currentChapter]);

  // Accordion-State: nur ein Kapitel offen
  const [openChapter, setOpenChapter] = React.useState<number | undefined>(undefined);
  // Öffne automatisch das aktive Kapitel (nur vertikal)
  React.useEffect(() => {
    if (!isHorizontal) setOpenChapter(activeChapter);
  }, [activeChapter, isHorizontal]);

  const toggleChapter = (id: number) => {
    setOpenChapter((prev) => (prev === id ? undefined : id));
  };

  const buildSubHref = (chapterId: number, subId: string) => withLocalePrefix(`/chapters/${chapterId}#${subId}`);

  // Roving-Tabindex für vertikale Kapitel-Navigation (nur Top-Level Links)
  const chapterRefs = React.useRef<Array<HTMLAnchorElement | null>>([]);
  const setChapterRef = (idx: number) => (el: HTMLAnchorElement | null) => {
    chapterRefs.current[idx] = el;
  };
  const visibleChapters = chapters; // alle Kapitel sind sichtbar; falls später Filter dazukommt, hier anpassen
  const firstEnabledIndex = 0;
  const activeIndex = React.useMemo(() => {
    if (typeof activeChapter !== 'number') return undefined;
    const i = visibleChapters.findIndex(c => c.id === activeChapter);
    return i >= 0 ? i : undefined;
  }, [activeChapter, visibleChapters]);
  const getNextIndex = (i: number) => Math.min(i + 1, visibleChapters.length - 1);
  const getPrevIndex = (i: number) => Math.max(i - 1, 0);
  const onChapterKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, idx: number) => {
    if (isHorizontal) return; // nur vertikal aktiv
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const ni = getNextIndex(idx);
      chapterRefs.current[ni]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const pi = getPrevIndex(idx);
      chapterRefs.current[pi]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      chapterRefs.current[firstEnabledIndex]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      chapterRefs.current[visibleChapters.length - 1]?.focus();
    }
  };

  // Klassen konsolidieren (vermeidet Redundanzen)
  // Größere Touch-Targets für mobile Geräte
  const linkBase = clsx(
    "relative inline-flex items-center rounded-xl transition-all duration-300 hover:shadow-sm",
    // Sichtbarer, kontrastreicher Fokus-Indikator
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[--color-surface]",
    // In DE sollen die Links explizit ohne Unterstreichung sein
    isGerman && "no-underline hover:no-underline [text-decoration:none]"
  );
  // Größere Abstände und bessere Lesbarkeit auf mobilen Geräten
  const linkHoriz = clsx(
    "gap-2 px-3 py-2.5 text-[14px] sm:text-[13.5px] md:text-[14.5px] leading-5 font-medium",
    // WICHTIG: Unterstreichung in deutscher Locale mit ! überschreiben
    isGerman && "!no-underline hover:!no-underline focus:!no-underline active:!no-underline"
  );
  const linkVert = (active: boolean) => clsx(
    "gap-2 px-3 py-2.5 text-[15px] sm:text-[14px] md:text-[15px] leading-[1.25] w-full font-medium",
    // WICHTIG: Unterstreichung in deutscher Locale mit ! überschreiben
    isGerman && "!no-underline hover:!no-underline focus:!no-underline active:!no-underline",
    "sm:py-1.5", // Kleinere Abstände auf größeren Bildschirmen
    active ? "sm:py-2" : "sm:py-1"
  );
  const linkActive = "text-[--color-foreground] bg-[--muted]/20 border-gradient";
  const linkInactive = "text-[--color-foreground-muted] hover:text-[--color-foreground] hover:bg-[--muted]/15 border border-transparent";
  // Größere Kapitel-Nummern für bessere Bedienbarkeit
  const chipClass = "inline-flex h-7 w-7 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-[--muted]/15 ring-1 ring-[--color-border-subtle] text-[12px] sm:text-[11px] font-semibold tabular-nums shadow-[0_1px_0_rgba(0,0,0,0.04)] relative -translate-y-[1px] flex-shrink-0";
  // Zusätzliche Absicherung: Entferne Dekoration direkt am Text-Span (überschreibt prose-Styles)
  const textNoUnderline = isGerman && "!no-underline [text-decoration:none] hover:[text-decoration:none] focus:[text-decoration:none] active:[text-decoration:none] visited:[text-decoration:none]";

  // Subchapter Styles
  const subItemBase = "group relative flex items-center gap-2 pl-10 pr-3 py-1.5 rounded-lg text-[13px] leading-[1.25] transition-colors focus:outline-none";
  // Für Unterkapitel ebenfalls klarer Fokus
  const subItemFocus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[--color-surface]";
  const subItemActive = "text-[--color-foreground] bg-[--muted]/20 ring-1 ring-[--color-border-subtle]";
  const subItemInactive = "text-[--color-foreground-muted] hover:text-[--color-foreground] hover:bg-[--muted]/15";
  // Nummern-Badge für Unterkapitel (z. B. 3.1)
  const subChipClass = "inline-flex h-5 min-w-5 px-1 items-center justify-center rounded-md bg-[--muted]/20 ring-1 ring-[--color-border-subtle] text-[10px] font-semibold tabular-nums text-[--color-foreground-muted] group-hover:text-[--color-foreground] flex-shrink-0";

  const ActiveOutline = () => (
    <motion.span
      layoutId="chapterNavActive"
      className="absolute inset-0 rounded-xl"
      style={{ boxShadow: "inset 0 0 0 1px var(--color-border-subtle)" }}
      transition={{ type: "spring", stiffness: 180, damping: 34, mass: 0.85 }}
      aria-hidden
    />
  );

  // Scroll-Spy Logik entfernt (activeHash wurde nicht genutzt); kann bei Bedarf wieder aktiviert werden.
  return (
    <nav
      aria-label="Kapitel-Navigation kompakt"
      aria-orientation={isHorizontal ? undefined : "vertical"}
      className={clsx(
        "print:hidden z-10",
        isHorizontal ? "sticky top-16 mb-3" : "sticky top-24"
      )}
    >
      <div
        className={clsx(
          "rounded-2xl bg-[--color-surface]/80 supports-[backdrop-filter]:backdrop-blur-xl",
          isHorizontal ? "overflow-x-auto no-scrollbar" : "w-full sm:w-64"
        )}
      >
        {/* Sidebar-Titel nur im vertikalen Modus */}
        {!isHorizontal && (
          <div className="px-4 pt-3 pb-2 text-xs font-medium uppercase tracking-wide text-[--color-foreground-muted] sm:px-3 sm:pt-2 sm:pb-1">
            {chapterWord}
          </div>
        )}
        <motion.ul
          initial={{ opacity: 0, y: isHorizontal ? 4 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          layout
          className={clsx(
            isHorizontal
              ? "flex items-center gap-1 px-1.5 py-1 min-w-full"
              : "flex flex-col items-stretch gap-1 p-1.5 w-full"
          )}
        >
          {/* Deckblatt als eigenständiges Kapitel 0 */}
          <motion.li className="py-0" key="cover" layout>
            <Link
              href={withLocalePrefix("/chapters/cover")}
              onMouseDown={(e) => (e.currentTarget as HTMLAnchorElement).blur()}
              className={clsx(
                linkBase,
                isHorizontal ? linkHoriz : linkVert(!!isCoverActive),
                isCoverActive ? linkActive : linkInactive
              )}
              aria-current={isCoverActive ? "page" : undefined}
              title={coverLabel}
            >
              {isCoverActive && <ActiveOutline />}
              <span className={chipClass}>
                0
              </span>
              <span className={clsx("truncate", isHorizontal ? "whitespace-nowrap max-w-[20ch] sm:max-w-[22ch] leading-tight" : "flex-1 text-left leading-tight", textNoUnderline)}>
                {coverLabel}
              </span>
            </Link>
          </motion.li>
          {!isHorizontal && (
            <li aria-hidden className="px-1.5">
              <div className="mt-0.5 mb-0.5 h-px w-full bg-[--color-border-subtle]/60" />
            </li>
          )}
          {chapters.map((c, index) => {
            const isActive = typeof activeChapter === 'number' && activeChapter > 0 && c.id === activeChapter;
            // i18n-Label für Kapitel (bp.sections.<titleKey>) mit Fallback auf statischen Titel
            let chapterLabel: string = c.title;
            try {
              const key = `sections.${c.titleKey}` as any;
              const translated = tBp(key);
              if (translated && typeof translated === 'string') chapterLabel = translated as string;
            } catch {}
            return (
              <motion.li key={c.id} className="py-0" layout>
                <div className="relative flex items-center gap-2">
                  <Link
                    href={withLocalePrefix(`/chapters/${c.id}`)}
                    onMouseDown={(e) => (e.currentTarget as HTMLAnchorElement).blur()}
                    className={clsx(
                      linkBase,
                      isHorizontal ? linkHoriz : linkVert(isActive),
                      isActive ? linkActive : linkInactive
                    )}
                    aria-current={isActive ? "page" : undefined}
                    title={`${chapterWord} ${c.id}: ${chapterLabel}`}
                    ref={setChapterRef(index)}
                    // Roving-Tabindex nur vertikal:
                    tabIndex={isHorizontal ? undefined : (isActive ? 0 : (activeIndex === undefined && index === firstEnabledIndex ? 0 : -1))}
                    onKeyDown={(ev) => onChapterKeyDown(ev, index)}
                  >
                    {isActive && <ActiveOutline />}
                    <span className={chipClass}>
                      {c.id}
                    </span>
                    <span
                      id={`chapter-${c.id}-label`}
                      className={clsx("truncate", isHorizontal ? "whitespace-nowrap max-w-[20ch] sm:max-w-[22ch] leading-tight" : "flex-1 text-left leading-tight", textNoUnderline)}
                    >
                      {c.id === 12 ? (isHorizontal ? 'Arbeitspakete' : chapterLabel) : chapterLabel}
                    </span>
                  </Link>
                  {/* Toggle nur im vertikalen Modus und wenn Subchapters vorhanden sind */}
                  {!isHorizontal && c.subchapters?.length ? (
                    <button
                      type="button"
                      aria-label={`${openChapter === c.id ? (isGerman ? 'Unterkapitel einklappen' : 'Collapse subchapters') : (isGerman ? 'Unterkapitel ausklappen' : 'Expand subchapters')} – ${chapterWord} ${c.id}: ${chapterLabel}`}
                      aria-controls={`subchapters-${c.id}`}
                      aria-expanded={openChapter === c.id}
                      onClick={(ev) => { ev.preventDefault(); ev.stopPropagation(); toggleChapter(c.id); }}
                      className={clsx(
                        "ml-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[--color-foreground-muted] hover:text-[--color-foreground] ring-1 ring-transparent hover:ring-[--color-border-subtle]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[--color-surface]"
                      )}
                    >
                      <svg
                        className={clsx("transition-transform duration-300", openChapter === c.id ? "rotate-180" : "rotate-0")}
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  ) : null}
                </div>
                {/* Unterkapitel Dropdown (nur vertikal) */}
                {!isHorizontal && c.subchapters?.length ? (
                  <motion.ul
                    id={`subchapters-${c.id}`}
                    aria-labelledby={`chapter-${c.id}-label`}
                    layout
                    initial={false}
                    animate={{
                      height: openChapter === c.id ? 'auto' : 0,
                      opacity: openChapter === c.id ? 1 : 0.5,
                      marginTop: openChapter === c.id ? 6 : 0
                    }}
                    transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                    className={clsx("overflow-hidden", openChapter === c.id ? "visible" : "pointer-events-none")}
                    aria-hidden={openChapter !== c.id}
                    role="list"
                  >
                    {c.subchapters.map((s, idx) => {
                      const isSubActive = (typeof activeChapter === 'number' && c.id === activeChapter) && (!!hash && hash === s.id);
                      return (
                        <li key={s.id} className="py-0">
                          <Link
                            href={buildSubHref(c.id, s.id)}
                            className={clsx(
                              subItemBase,
                              subItemFocus,
                              isGerman && "!no-underline hover:!no-underline",
                              isSubActive ? subItemActive : subItemInactive
                            )}
                            title={`${chapterLabel} – ${s.title ?? s.id}`}
                            onClick={(e) => {
                              // Wenn wir bereits auf diesem Kapitel sind, scrolle in-page pixelgenau
                              const sameChapter = pathname?.match(/\/chapters\/(\d+)(?:$|\/?)/)?.[1] === String(c.id);
                              if (sameChapter) {
                                e.preventDefault();
                                scrollToAnchor(s.id, { headerOffset: 56 });
                              }
                            }}
                          >
                            <span className={subChipClass} aria-hidden>
                              {c.id}.{idx + 1}
                            </span>
                            <span className={clsx("truncate", textNoUnderline)}>
                              {(() => {
                                // versuche Übersetzung "bp.sections.<chapterKey>.<subKey>"
                                try {
                                  const key = `sections.${c.titleKey}.${s.titleKey.split('.').pop()}` as any;
                                  const tr = tBp(key);
                                  if (tr && typeof tr === 'string') return tr as string;
                                } catch {}
                                return s.title ?? s.id;
                              })()}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </motion.ul>
                ) : null}
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </nav>
  );
}
