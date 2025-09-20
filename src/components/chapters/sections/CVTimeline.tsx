"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useMessages, useTranslations } from "next-intl";
import { z } from "zod";
import TimelineEventCard from "@/components/chapters/timeline/TimelineEventCard";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Briefcase, GraduationCap, Layers } from "lucide-react";
import { variantsMap, defaultTransition } from "@/components/animation/variants";
import TimelineSparkline from "@/components/chapters/timeline/TimelineSparkline";

// Lokale, kompakte Badge-Darstellung für Perioden in der CV-Timeline
const CVPeriodBadges: React.FC<{ period?: string | null }> = ({ period }) => {
  const fmt = React.useMemo(() => {
    if (!period || typeof period !== 'string') return null as { start?: string; end?: string } | null;
    const raw = period.trim();
    const lower = raw.toLowerCase();
    const pad = (n: number) => String(n).padStart(2, '0');
    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();
    const parseMY = (s: string) => {
      const sNorm = normalize(s);
      if (/^(heute|now|present|ongoing)$/i.test(sNorm)) return 'heute';
      const m1 = /^(\d{1,2})\/(\d{4})$/.exec(sNorm);
      if (m1) return `${pad(parseInt(m1[1]!, 10))}/${m1[2]}`;
      const m2 = /^(\d{4})$/.exec(sNorm);
      if (m2) return m2[1]!;
      return sNorm;
    };
    if (/^seit\s+/i.test(lower)) {
      const after = normalize(raw.replace(/^seit\s*/i, ''));
      return { start: parseMY(after), end: 'heute' };
    }
    if (/^(ab|from)\b/i.test(lower)) {
      const after = normalize(raw.replace(/^(ab|from)\s*/i, ''));
      return { start: parseMY(after), end: 'heute' };
    }
    const parts = raw.split(/\s*[–-]\s*/);
    if (parts.length === 2) {
      const start = parseMY(parts[0] ?? '');
      const end = parseMY(parts[1] ?? '');
      return { start, end: end || 'heute' };
    }
    return { start: parseMY(raw), end: 'heute' };
  }, [period]);

  if (!fmt) return null;
  const isActive = fmt.end === 'heute';
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] w-full items-center gap-1.5 text-[11px] md:text-[12px] [font-variant-numeric:tabular-nums] text-[--color-foreground]">
      {fmt.start && (
        <span className="justify-self-end px-2.5 py-[2px] rounded-full whitespace-nowrap ring-1 ring-[rgba(148,163,184,0.32)] bg-[rgba(148,163,184,0.10)]">
          {fmt.start}
        </span>
      )}
      <motion.span
        aria-hidden
        className="justify-self-center h-px w-16 md:w-24 bg-[rgba(148,163,184,0.34)] rounded-full origin-left"
        initial={{ scaleX: 0, opacity: 1 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.6, margin: '-40% 0px -40% 0px' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      />
      {fmt.end && (
        isActive ? (
          <span className="justify-self-start px-2.5 py-[2px] rounded-full whitespace-nowrap flex items-center gap-1.5 ring-1 ring-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.10)]">
            <span className="inline-block w-[6px] h-[6px] rounded-full bg-[rgba(16,185,129,0.92)] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.55)]" aria-hidden />
            <span className="uppercase tracking-[0.06em] text-[10px] opacity-80" aria-hidden>live</span>
          </span>
        ) : (
          <span className="justify-self-start px-2.5 py-[2px] rounded-full whitespace-nowrap ring-1 ring-[rgba(148,163,184,0.32)] bg-[rgba(148,163,184,0.10)]">
            {fmt.end}
          </span>
        )
      )}
    </div>
  );
};

export type TimelineItem = {
  period: string; // e.g. "2023–Heute"
  title: string; // Role / Degree
  subtitle?: string | undefined; // Company / Institution
  bullets?: string[] | undefined; // Achievements / responsibilities
  /** Optional: Klassifizierung, falls in i18n gepflegt. Fallback via Heuristik. */
  kind?: 'work' | 'education';
};

const TimelineItemSchema = z.object({
  period: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  kind: z.enum(['work', 'education']).optional(),
});
const TimelineArraySchema = z.array(TimelineItemSchema);

interface CVTimelineProps {
  items?: TimelineItem[];
  /** Deprecated: use compactLevel instead. If true, behaves like compactLevel='sm'. */
  compact?: boolean;
  /** Fine-grained compactness: 'sm' | 'md' | 'lg' (default: derived from compact or 'lg') */
  compactLevel?: 'sm' | 'md' | 'lg';
  /** Priorisiere Technologie-relevante Einträge (AI, Robotics, Cloud, ML). Default: true */
  techPriority?: boolean;
  /** Pitchdeck-/Slides-Modus: horizontaler Snap-Scroller. Default: false */
  deckMode?: boolean;
  /** Verknüpfe vertikales Page‑Scrolling mit seitlicher Slide‑Bewegung. Default: true */
  deckScrollLinked?: boolean;
  /** Scrollrichtung im Deck‑Modus: 'ltr' oder 'rtl'. Default: 'rtl' (von rechts nach links einblenden) */
  deckScrollDirection?: 'ltr' | 'rtl';
  /** Dunkle/helle Rand‑Vignetten für Tiefe im Deck‑Modus. Default: false */
  deckVignette?: boolean;
  /** Überschrift innerhalb der Komponente anzeigen. Default: true */
  showHeading?: boolean;
  /** Zeige die Segment-Filter (Alle/Beruflich/Schulisch). Default: false */
  showFilters?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const CVTimeline: React.FC<CVTimelineProps> = ({ items, compact, compactLevel, techPriority = true, deckMode = false, deckScrollLinked: _deckScrollLinked = true, deckScrollDirection = 'rtl', deckVignette = false, showHeading = true, showFilters = false }) => {
  const t = useTranslations("cv");
  const messages = useMessages() as Record<string, unknown> | undefined;
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  // Segment-Filter: 'all' | 'work' | 'education'
  const [segment, setSegment] = useState<'all' | 'work' | 'education'>('all');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Deck nur ab md-Viewport aktiv (mobile vertikal)
  const [isDeck, setIsDeck] = useState<boolean>(false);
  const prefersReduced = useReducedMotion();
  useEffect(() => {
    const mq = typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)') : null;
    const update = () => {
      setIsDeck(Boolean(deckMode && mq?.matches));
    };
    update();
    mq?.addEventListener('change', update);
    return () => mq?.removeEventListener('change', update);
  }, [deckMode]);

  // Segment initial aus URL (?seg) oder localStorage lesen – nur wenn Filter sichtbar
  useEffect(() => {
    if (!showFilters) return;
    try {
      const fromUrl = (searchParams?.get('seg') ?? '').toLowerCase();
      const isValid = fromUrl === 'all' || fromUrl === 'work' || fromUrl === 'education';
      if (isValid) {
        setSegment(fromUrl as 'all' | 'work' | 'education');
        return;
      }

      const ls = typeof window !== 'undefined' ? window.localStorage.getItem('cvSegment') : null;
      if (ls === 'all' || ls === 'work' || ls === 'education') setSegment(ls as any);
    } catch {}
  }, [showFilters, searchParams]);

  // Segment in URL (shallow) & localStorage persistieren – nur wenn Filter sichtbar
  useEffect(() => {
    if (!showFilters) return;
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem('cvSegment', segment);
      if (!pathname || !searchParams) return;
      const params = new URLSearchParams(searchParams.toString());
      if (segment === 'all') {
        params.delete('seg');
      } else {
        params.set('seg', segment);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    } catch {}
  }, [segment, pathname, searchParams, router, showFilters]);

  // Bei Segmentwechsel: aktuellen Index zurücksetzen und Deck-Scroller an den Anfang
  useEffect(() => {
    setCurrentIdx(0);
    if (!isDeck) return;
    const el = deckRef.current; if (!el) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    el.scrollLeft = deckScrollDirection === 'rtl' ? max : 0;
  }, [segment, isDeck, deckScrollDirection]);

  // Determine size from compactLevel or legacy compact flag
  const size: 'sm' | 'md' | 'lg' = compactLevel ?? (compact ? 'sm' : 'lg');

  const fallbackItems: TimelineItem[] = useMemo(() => (
    [
      {
        period: t("fallback.0.period"),
        title: t("fallback.0.title"),
        subtitle: t("fallback.0.subtitle"),
        bullets: [t("fallback.0.bullets.0"), t("fallback.0.bullets.1")],
      },
      {
        period: t("fallback.1.period"),
        title: t("fallback.1.title"),
        subtitle: t("fallback.1.subtitle"),
        bullets: [t("fallback.1.bullets.0")],
      },
    ]
  ), [t]);

  // Prefer explicit items prop, then i18n-driven cv.items, then fallback
  const itemsFromI18n = useMemo(() => {
    const root = messages as Record<string, unknown> | undefined;
    if (!root || typeof root !== "object") return undefined;
    const cvRaw = "cv" in root ? (root["cv"] as unknown) : undefined;
    if (!cvRaw || typeof cvRaw !== "object") return undefined;
    const cvObj = cvRaw as Record<string, unknown>;
    return "items" in cvObj ? (cvObj["items"] as unknown) : undefined;
  }, [messages]);

  // einfache Scoring-Funktion für Tech-Priorisierung
  const scoreItem = (it: TimelineItem): number => {
    const text = `${it.title} ${it.subtitle ?? ''} ${(it.bullets ?? []).join(' ')}`.toLowerCase();
    // expand weights list
    const patterns: [RegExp, number][] = [
      [/(ai|künstliche intelligenz)/g, 3],
      [/(robot|robotik|humanoid)/g, 3],
      [/(ml|machine learning|diffusion|transformer|policy)/g, 2],
      [/(perception|planning|controls|ros2|sdk)/g, 2],
      [/(cloud|edge|inferenz|triton|tensorrt)/g, 1],
    ];
    let score = 0;
    for (const [re, w] of patterns) {
      if (re.test(text)) score += w;
    }
    return score;
  };

  const data: TimelineItem[] = useMemo(() => {
    // 1) Explicit prop via Zod
    if (items && TimelineArraySchema.safeParse(items).success) return items;
    // 2) i18n-driven items via Zod
    const parsed = itemsFromI18n ? TimelineArraySchema.safeParse(itemsFromI18n) : undefined;
    if (parsed?.success) {
      const arr = parsed.data as TimelineItem[];
      if (!techPriority) return arr;
      // stabile Sortierung: tech score desc, ansonsten Originalreihenfolge
      return arr
        .map((it, i) => ({ it, i, s: scoreItem(it) }))
        .sort((a, b) => (b.s - a.s) || (a.i - b.i))
        .map(x => x.it);
    }
    // 3) fallback
    return fallbackItems;
  }, [items, itemsFromI18n, fallbackItems, techPriority]);

  // Heuristik zur Klassifizierung, wenn kind fehlt
  const getKind = (it: TimelineItem): 'work' | 'education' => {
    if (it.kind === 'work' || it.kind === 'education') return it.kind;
    const hay = `${it.title} ${it.subtitle ?? ''} ${(it.bullets ?? []).join(' ')}`.toLowerCase();
    const edu = [
      /schule|schulisch|ausbildung|studium|hochschule|universität|universitaet|college|campus/,
      /bachelor|master|diplom|ph\.?d|doktor|msc|bsc|mba/,
      /matura|abitur|gymnasium|htl|hak|fh|tu|uni/,
      /kurs|lehrgang|zertifikat|certificate|bootcamp/,
    ];
    if (edu.some(re => re.test(hay))) return 'education';
    return 'work';
  };

  const dataFiltered = useMemo(() => {
    if (segment === 'all') return data;
    return data.filter((it) => getKind(it) === segment);
  }, [data, segment]);

  const headingId = "cv-timeline-heading";

  // Bounce/Wow Variants (nur wenn nicht prefersReduced)
  const springEnter = {
    type: 'spring' as const,
    stiffness: 260,
    damping: 22,
    mass: 0.9,
    bounce: 0.35,
  };
  // Globale Stagger-Parameter für Links→Rechts-Einstieg je Zeile
  const sideStagger = 0.08; // Sekunden Verzögerung für die rechte Seite
  const bounceLeft = {
    hidden: { opacity: 0, x: -24, y: 12, rotate: -1.5 },
    visible: { opacity: 1, x: 0, y: 0, rotate: 0 },
  } as const;
  const bounceRight = {
    hidden: { opacity: 0, x: 24, y: 12, rotate: 1.5 },
    visible: { opacity: 1, x: 0, y: 0, rotate: 0 },
  } as const;

  // Deck-Ref
  const deckRef = useRef<HTMLUListElement>(null);

  // Section-Ref für IO und Sticky Header
  const sectionRef = useRef<HTMLElement>(null);

  // Aktuelle Slide via IntersectionObserver ermitteln (nur deckMode)
  useEffect(() => {
    const rootEl = deckRef.current ?? sectionRef.current; if (!rootEl) return;
    const items = Array.from(rootEl.querySelectorAll('[data-cv-idx]')) as HTMLElement[];
    if (items.length === 0) return;
    const options: IntersectionObserverInit = deckRef.current
      ? { root: rootEl, threshold: [0.5, 0.75, 0.9], rootMargin: '0px 0px 0px 0px' }
      : { root: null, threshold: 0.6, rootMargin: '-20% 0px -20% 0px' };
    const io = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) {
        const idxAttr = (visible.target as HTMLElement).getAttribute('data-cv-idx');
        const idxNum = idxAttr ? parseInt(idxAttr, 10) : 0;
        if (!Number.isNaN(idxNum)) setCurrentIdx(idxNum);
      }
    }, options);
    items.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [deckMode, dataFiltered.length]);

  // Alle Parallax-/Follow-Effekte entfernt – wir nutzen nur IO für currentIdx

  // (bereinigt) – keine Ableitung des aktuellen Jahres mehr notwendig

  return (
    <section ref={sectionRef} className={`relative w-full ${size === 'sm' ? 'py-10 md:py-12' : size === 'md' ? 'py-12 md:py-14' : 'py-14 md:py-18'} scroll-mt-20`} role="region" aria-labelledby={headingId}>
      {showHeading && (
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2
            id={headingId}
            className={`${size === 'sm' ? 'text-base md:text-lg mb-3.5 md:mb-5' : size === 'md' ? 'text-lg md:text-xl mb-4.5 md:mb-6' : 'text-xl md:text-2xl mb-5 md:mb-7'} font-semibold tracking-tight leading-[1.12] text-[--color-foreground-strong] text-center`}
          >
            {t("title")}
          </h2>
        </div>
      )}

      <div className="relative w-full max-w-6xl mx-auto px-4">
        {/* Sticky Header (md+): aktuelles Jahr + Rubrik je nach sichtbarem Item */}
        {!isDeck && (
          <div className="hidden md:block sticky top-2 z-[1] mb-2 print:hidden">
            {(() => {
              const item = dataFiltered[currentIdx];
              const kind = item ? getKind(item) : undefined;
              const kindLabel = kind === 'education' ? t('filter.education', { default: 'Schulisch' }) : t('filter.work', { default: 'Beruflich' });
              const raw = item?.period ?? '';
              const parts = raw.replace(/\s+/g, ' ').trim().split(/\s*[–-]\s*/);
              const toYear = (token: string) => {
                const m1 = /^(\d{1,2})\/(\d{4})$/.exec(token); if (m1) return m1[2]!;
                if (/^(heute|now|present|ongoing)$/i.test(token)) return 'heute';
                const m2 = /^(\d{4})$/.exec(token); if (m2) return m2[1]!; return token;
              };
              const label = parts.length === 2 ? `${toYear(parts[0] ?? '')} – ${toYear(parts[1] ?? '')}` : `${toYear(raw)}`;
              return (
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] ring-1 ring-[var(--color-border)]/80 bg-[var(--color-surface)]/80 supports-[backdrop-filter]:backdrop-blur-sm">
                  <span className="font-medium text-[--color-foreground-strong] [font-variant-numeric:tabular-nums]">{label}</span>
                  <span className="opacity-40" aria-hidden>•</span>
                  <span className="text-[--color-foreground]">{kindLabel}</span>
                </div>
              );
            })()}
          </div>
        )}

        {showFilters && (
          <div className="mb-4 md:mb-5 grid grid-cols-3 gap-1.5 p-1 rounded-full ring-1 ring-[var(--color-border)] bg-[var(--color-surface)]/70 supports-[backdrop-filter]:backdrop-blur-sm print:hidden" role="tablist" aria-label={t('filter.title', { default: 'Filter' })}>
            {([
              { key: 'all' as const, label: t('filter.all', { default: 'Alle' }), icon: Layers },
              { key: 'work' as const, label: t('filter.work', { default: 'Beruflich' }), icon: Briefcase },
              { key: 'education' as const, label: t('filter.education', { default: 'Schulisch' }), icon: GraduationCap },
            ]).map((opt) => {
              const Icon = opt.icon;
              const selected = segment === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`cv-filter-panel`}
                  onClick={() => setSegment(opt.key)}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-ring]
                    ${selected
                      ? 'bg-[var(--color-surface)] text-[--color-foreground] ring-[var(--color-border)]'
                      : 'bg-[var(--color-surface)]/60 text-[--color-foreground] ring-[var(--color-border)]/60 hover:bg-[var(--color-surface)]'}
                  `}
                >
                  <Icon aria-hidden className="h-[14px] w-[14px] opacity-90" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {isDeck && (
          <div className="relative mb-2 flex items-center justify-between gap-2 print:hidden">
            {/* Dots */}
            <div className="flex items-center gap-1.5" role="tablist" aria-label={t('title')}>
              {dataFiltered.map((_, i) => (
                <button
                  key={`dot-${i}`}
                  role="tab"
                  aria-selected={currentIdx === i}
                  aria-controls={`cv-slide-${i}`}
                  className={`h-1.5 rounded-full transition-all duration-240 ease-[cubic-bezier(.45,.05,.55,.95)] ${currentIdx === i ? 'w-8 bg-[--color-foreground-strong]' : 'w-3 bg-[--color-border]'}`}
                  aria-label={`${i + 1} / ${dataFiltered.length}`}
                  tabIndex={0}
                  onClick={() => {
                    const root = deckRef.current; if (!root) return;
                    const el = root.querySelector(`[data-cv-idx='${i}']`) as HTMLElement | null;
                    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                  }}
                >
                  <span className="sr-only">{`${i + 1} / ${dataFiltered.length}`}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs ring-1 ring-[var(--color-border)] bg-[var(--color-surface)]/70 supports-[backdrop-filter]:backdrop-blur-sm hover:bg-[var(--color-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
              onClick={() => {
                const el = deckRef.current; if (!el) return; el.scrollBy({ left: -el.clientWidth * 0.8, behavior: 'smooth' });
              }}
              aria-label={t('less', { default: 'Vorheriger Slide' })}
            >
              ←
              <span className="sr-only">{t('less', { default: 'Vorheriger Slide' })}</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs ring-1 ring-[--color-border] bg-[--color-surface]/70 supports-[backdrop-filter]:backdrop-blur-sm hover:bg-[--color-surface] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-ring]"
              onClick={() => {
                const el = deckRef.current; if (!el) return; el.scrollBy({ left: el.clientWidth * 0.8, behavior: 'smooth' });
              }}
              aria-label={t('more', { default: 'Nächster Slide' })}
            >
              →
              <span className="sr-only">{t('more', { default: 'Nächster Slide' })}</span>
            </button>
          </div>
        )}

        {isDeck && deckVignette && (
          <div className="relative">
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-14 bg-gradient-to-r from-[--color-background] via-[--color-background]/40 to-transparent/0" />
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-14 bg-gradient-to-l from-[--color-background] via-[--color-background]/40 to-transparent/0" />
          </div>
        )}
        {/* A11y: Live-Region für aktuelle Slide-Position im Deck-Modus */}
        {isDeck && (
          <div aria-live="polite" className="sr-only" id="cv-deck-status">
            {`${currentIdx + 1} / ${dataFiltered.length}`}
          </div>
        )}
        <motion.ul
          ref={deckRef}
          className={isDeck
            ? `relative flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`
            : `relative grid md:grid-cols-[minmax(0,1fr)_30px_minmax(0,1fr)] md:gap-x-10 ${size === 'sm' ? 'gap-y-6 md:gap-y-7' : size === 'md' ? 'gap-y-7 md:gap-y-8' : 'gap-y-8 md:gap-y-9'}`}
          aria-label={t('title')}
          {...(isDeck ? { 'aria-roledescription': 'carousel' } : {})}
          role="list"
          {...(isDeck ? { tabIndex: 0, onKeyDown: (e: React.KeyboardEvent<HTMLUListElement>) => {
            const el = deckRef.current; if (!el) return;
            const page = el.clientWidth * 0.8;
            if (e.key === 'ArrowRight') { e.preventDefault(); el.scrollBy({ left: page, behavior: 'smooth' }); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); el.scrollBy({ left: -page, behavior: 'smooth' }); }
            if (e.key === 'Home') { e.preventDefault(); el.scrollTo({ left: 0, behavior: 'smooth' }); }
            if (e.key === 'End') { e.preventDefault(); el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' }); }
          }} : {})}
        >
          {/* Zentrale, dezente Vertikallinie (nur im Grid-Layout, md+) */}
          {!isDeck && (
            <div
              aria-hidden
              className="hidden md:block pointer-events-none absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[color:rgba(148,163,184,0.16)] to-transparent" />
            </div>
          )}
          {/* Mittellinie pro Item bleibt die mittlere Grid-Spalte – diese Linie ist rein dekorativ für mehr Tiefe */}
          {dataFiltered.map((item, idx) => {
            const itemId = `cv-item-${idx}`;
            const titleId = `${itemId}-title`;
            const periodId = `${itemId}-period`;
            const baseDelay = Math.min(idx * 0.04, 0.24);
            return (
              <motion.li
                key={`${item.period}-${idx}`}
                className={isDeck ? 'list-none shrink-0 snap-start w-[85%] md:w-[65%] lg:w-[55%] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-ring] rounded-xl' : 'list-none contents'}
                {...(isDeck ? { role: 'group', 'aria-roledescription': 'slide', 'aria-label': `${idx + 1} / ${dataFiltered.length}`, 'aria-setsize': dataFiltered.length, 'aria-posinset': idx + 1 } : { role: 'listitem' })}
                id={`cv-slide-${idx}`}
                {...(!isDeck ? { initial: { opacity: 0, y: 6 }, whileInView: { opacity: 1, y: 0 } } : {})}
                {...(!isDeck ? { viewport: { once: true, amount: 0.35, margin: '-12% 0px -12% 0px' } } : {})}
                {...(!isDeck ? { transition: { duration: 0.4 } } : {})}
              >
                {!isDeck && (
                  <>
                      {/* Obere Zeile: Jahres-Badges mittig über den Inhalten */}
                      <div className="md:col-span-3 mb-3 md:mb-4">
                        <span id={periodId} aria-label={t('period', { default: 'Zeitraum' })} className="block">
                          <CVPeriodBadges period={item.period} />
                        </span>
                      </div>

                      {/* Mittlere Spalte: keine Marker mehr – nur die zentrale Linie bleibt (siehe absolute dekorative Achse oben) */}
                      <div className="hidden md:block md:col-start-2" aria-hidden />

                      {/* Nebeneinander: links/rechts eigene Container für Text und Animation */}
                      {/* Linke Seite: je nach Index entweder Sparkline oder Karte */}
                      <div className={"md:col-start-1 md:justify-self-stretch md:self-stretch w-full"}>
                        {idx % 2 === 0 ? (
                          // Even: links Animation
                          <motion.div
                            className="w-full min-h-[200px] flex items-center justify-center"
                            {...(!prefersReduced ? { initial: 'hidden', whileInView: 'visible' as const } : { initial: false })}
                            viewport={{ once: true, amount: 0.35, margin: '-12% 0px -12% 0px' }}
                            variants={bounceLeft}
                            transition={prefersReduced ? { duration: 0 } : { ...springEnter, delay: baseDelay }}
                            style={{ transformOrigin: '100% 50%' }}
                          >
                            {(() => {
                              const matches = item.period.match(/\d{4}/g);
                              if (matches && matches.length >= 2) {
                                return (
                                  <TimelineSparkline title={item.title} {...(item.subtitle ? { subtitle: item.subtitle } : {})} xLabels={[matches[0], matches[matches.length-1]] as [string, string]} height={200} headerHeight={32} contextText={(item.bullets ?? []).join(' ')} />
                                );
                              }
                              if (matches && matches.length === 1) {
                                return (
                                  <TimelineSparkline title={item.title} {...(item.subtitle ? { subtitle: item.subtitle } : {})} xLabels={[matches[0], 'heute'] as [string, string]} height={200} headerHeight={32} contextText={(item.bullets ?? []).join(' ')} />
                                );
                              }
                              // Platzhalter, damit 50/50 visuell stabil bleibt
                              return <div className="h-[200px] w-full rounded-md ring-1 ring-[--color-border-subtle] bg-[--color-surface] opacity-40" aria-hidden />;
                            })()}
                          </motion.div>
                        ) : (
                          // Odd: links Textkarte
                          <motion.div
                            className="w-full min-h-[200px] flex items-stretch"
                            {...(!prefersReduced ? { initial: 'hidden', whileInView: 'visible' as const } : { initial: false })}
                            viewport={{ once: true, amount: 0.35, margin: '-12% 0px -12% 0px' }}
                            variants={bounceLeft}
                            transition={prefersReduced ? { duration: 0 } : { ...springEnter, delay: baseDelay }}
                            style={{ transformOrigin: '100% 50%' }}
                          >
                            <TimelineEventCard
                              size={size}
                              title={item.title}
                              {...(item.subtitle ? { subtitle: item.subtitle } : {})}
                              {...(item.bullets ? { bullets: item.bullets } : {})}
                              kind={getKind(item)}
                              bulletsId={`${itemId}-bullets`}
                              headerUnderline="none"
                              rightAside={<span data-fullwidth={true} className="hidden" />}
                            />
                          </motion.div>
                        )}
                      </div>

                      {/* Rechte Seite: je nach Index entweder Karte oder Sparkline */}
                      <div className={"md:col-start-3 md:justify-self-stretch md:self-stretch w-full"}>
                        {idx % 2 === 0 ? (
                          // Even: rechts Textkarte
                          <motion.div
                            className="w-full min-h-[200px] flex items-stretch"
                            {...(!prefersReduced ? { initial: 'hidden', whileInView: 'visible' as const } : { initial: false })}
                            viewport={{ once: true, amount: 0.35, margin: '-12% 0px -12% 0px' }}
                            variants={bounceRight}
                            transition={prefersReduced ? { duration: 0 } : { ...springEnter, delay: baseDelay + sideStagger }}
                            style={{ transformOrigin: '0% 50%' }}
                          >
                            <TimelineEventCard
                              size={size}
                              title={item.title}
                              {...(item.subtitle ? { subtitle: item.subtitle } : {})}
                              {...(item.bullets ? { bullets: item.bullets } : {})}
                              kind={getKind(item)}
                              bulletsId={`${itemId}-bullets`}
                              headerUnderline="none"
                              rightAside={<span data-fullwidth={true} className="hidden" />}
                            />
                          </motion.div>
                        ) : (
                          // Odd: rechts Animation
                          <motion.div
                            className="w-full min-h-[200px] flex items-center justify-center"
                            {...(!prefersReduced ? { initial: 'hidden', whileInView: 'visible' as const } : { initial: false })}
                            viewport={{ once: true, amount: 0.35, margin: '-12% 0px -12% 0px' }}
                            variants={bounceRight}
                            transition={prefersReduced ? { duration: 0 } : { ...springEnter, delay: baseDelay + sideStagger }}
                            style={{ transformOrigin: '0% 50%' }}
                          >
                            {(() => {
                              const matches = item.period.match(/\d{4}/g);
                              if (matches && matches.length >= 2) {
                                return (
                                  <TimelineSparkline title={item.title} {...(item.subtitle ? { subtitle: item.subtitle } : {})} xLabels={[matches[0], matches[matches.length-1]] as [string, string]} height={200} headerHeight={32} contextText={(item.bullets ?? []).join(' ')} />
                                );
                              }
                              if (matches && matches.length === 1) {
                                return (
                                  <TimelineSparkline title={item.title} {...(item.subtitle ? { subtitle: item.subtitle } : {})} xLabels={[matches[0], 'heute'] as [string, string]} height={200} headerHeight={32} contextText={(item.bullets ?? []).join(' ')} />
                                );
                              }
                              return <div className="h-[200px] w-full rounded-md ring-1 ring-[--color-border-subtle] bg-[--color-surface] opacity-40" aria-hidden />;
                            })()}
                          </motion.div>
                        )}
                      </div>

                      {/* Mobile: einspaltig – Card vollflächig */}
                      <div className="md:hidden col-span-full">
                        <motion.div
                            role="article"
                            tabIndex={0}
                            aria-labelledby={`${titleId} ${periodId}`}
                            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-ring] focus-visible:ring-offset-2 focus-visible:ring-offset-[--color-surface] rounded-xl w-full max-w-xl"
                            data-cv-idx={idx}
                            variants={variantsMap.cardEnter}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.35, margin: '-10% 0px -10% 0px' }}
                            transition={defaultTransition}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); const next = document.querySelector(`[data-cv-idx='${idx + 1}']`) as HTMLElement | null; next?.focus(); }
                              if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); const prev = document.querySelector(`[data-cv-idx='${idx - 1}']`) as HTMLElement | null; prev?.focus(); }
                              if (e.key === 'Home') { e.preventDefault(); const first = document.querySelector(`[data-cv-idx='0']`) as HTMLElement | null; first?.focus(); }
                              if (e.key === 'End') { e.preventDefault(); const last = document.querySelector(`[data-cv-idx='${dataFiltered.length - 1}']`) as HTMLElement | null; last?.focus(); }
                            }}
                          >
                            <TimelineEventCard
                              size={size}
                              title={item.title}
                              {...(item.subtitle ? { subtitle: item.subtitle } : {})}
                              {...(item.bullets ? { bullets: item.bullets } : {})}
                              kind={getKind(item)}
                              bulletsId={`${itemId}-bullets`}
                              headerUnderline="none"
                              rightAside={
                                (() => {
                                  const matches = item.period.match(/\d{4}/g);
                                  if (matches && matches.length >= 2) {
                                    return <TimelineSparkline title={item.title} {...(item.subtitle ? { subtitle: item.subtitle } : {})} xLabels={[matches[0], matches[matches.length-1]] as [string, string]} height={140} headerHeight={28} contextText={(item.bullets ?? []).join(' ')} />;
                                  }
                                  if (matches && matches.length === 1) {
                                    return <TimelineSparkline title={item.title} {...(item.subtitle ? { subtitle: item.subtitle } : {})} xLabels={[matches[0], 'heute'] as [string, string]} height={140} headerHeight={28} contextText={(item.bullets ?? []).join(' ')} />;
                                  }
                                  return null;
                                })()
                              }
                              asidePosition={idx % 2 === 0 ? 'left' : 'right'}
                            />
                          </motion.div>
                        </div>
                  </>
                )}
              </motion.li>
            );
          })}
          {(!data || data.length === 0) && (
            <li className="md:col-span-2 list-none">
              <div className="rounded-xl bg-[--color-surface] ring-1 ring-[--color-border-subtle] p-6">
                <h2 className="text-lg font-semibold text-[--color-foreground-strong] mb-1">{t("empty.title", { default: "Keine Einträge" })}</h2>
                <p className="text-[--color-foreground] opacity-90">{t("empty.description", { default: "Es liegen keine Einträge vor." })}</p>
              </div>
            </li>
          )}
        </motion.ul>
        {/* Mobile Progress-Bar entfernt */}

        {/* Mobile: CTA „Weiter“ (zum nächsten Item springen) */}
        {!isDeck && (
          <div className="md:hidden fixed inset-x-0 bottom-3 z-30 flex justify-center print:hidden">
            {currentIdx < Math.max(0, dataFiltered.length - 1) && (
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full ring-1 ring-[var(--color-border-subtle)] bg-[var(--color-surface)]/70 backdrop-blur-[2px] text-[--color-foreground] shadow-sm"
                onClick={() => {
                  try { (navigator as any)?.vibrate?.(10); } catch {}
                  const next = sectionRef.current?.querySelector(`[data-cv-idx='${currentIdx + 1}']`) as HTMLElement | null;
                  next?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                aria-label={t('more', { default: 'Nächster Eintrag' })}
              >
                <span className="text-[12px] font-medium">Weiter</span>
                <span aria-hidden>↓</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
export default CVTimeline;
