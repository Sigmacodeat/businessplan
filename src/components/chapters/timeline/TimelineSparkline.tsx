"use client";

import React from "react";
import { useMessages } from "next-intl";
import { z } from "zod";
import SparklineCanvas from "@/components/chapters/timeline/SparklineCanvas";
import DonutGauge from "@/components/chapters/timeline/DonutGauge";
import MiniBarChart from "@/components/chapters/timeline/MiniBarChart";

// Hinweis: Keine globale Balkenfarb-Konstante nötig – AnimatedBar wurde entfernt

// Hinweis: Früher gab es hier eine Card-Hülle; entfernt für eine cleanere Timeline ohne Card-Optik.

// Vereinfachte generische Fallback-Komponente ohne Hooks im Parent
const GenericSparklineBasic: React.FC<{
  headerLabel: string;
  period?: string | null | undefined;
  growthPct?: number | undefined;
  xLabels?: [string, string] | undefined;
  height?: number | undefined; // Gesamthöhe der Komponente in px
  headerHeight?: number | undefined; // Höhe des Kopfbereichs in px
  compact?: boolean | undefined;
  // Feintuning-Weitergabe
  color?: string | undefined;
  durationMs?: number | undefined;
  lineWidth?: number | undefined;
  glowRadius?: number | undefined;
  areaAlpha?: number | undefined;
  maxWidth?: number | undefined; // Maximale Breite in px (z.B. 100)
  // Optional: Header-Icon
  icon?: React.ReactNode | undefined;
  // Optional: Renderer für alternative Visuals (z.B. Donut/Bar). Wenn gesetzt, ersetzt es die Sparkline.
  renderContent?: ((canvasH: number) => React.ReactNode) | undefined;
}> = ({ headerLabel, period, growthPct, xLabels, height, headerHeight, compact, color, durationMs, lineWidth, glowRadius, areaAlpha, maxWidth, icon, renderContent }) => {
  const pct = typeof growthPct === 'number' && Number.isFinite(growthPct) ? Math.max(0, Math.min(1000, growthPct)) : undefined;
  // Wrapper-Ref für ResizeObserver (nur zum Neuzeichnen, ohne eigene Breitenkappung)
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  // Höhe: bevorzugt Prop, ansonsten moderat (200). Headerhöhe bevorzugt Prop, sonst 32.
  const totalH = typeof height === 'number' && Number.isFinite(height) ? Math.max(120, Math.floor(height)) : 200;
  const headH = typeof headerHeight === 'number' && Number.isFinite(headerHeight) ? Math.max(24, Math.floor(headerHeight)) : 32;
  const canvasH = Math.max(40, totalH - headH);
  return (
    <div ref={wrapperRef} className="select-none mx-auto w-full" style={{ height: totalH }}>
      <div className="flex items-center justify-between" style={{ height: headH }}>
        <div className="flex items-center gap-1.5 text-[12px] md:text-[12.5px] font-medium text-[--color-foreground-strong] tracking-[-0.006em] [font-variant-numeric:tabular-nums]">
          {icon ? <span aria-hidden className="inline-flex items-center" >{icon}</span> : null}
          <span>{headerLabel}</span>
        </div>
        <div className="text-[11px] md:text-[11.5px]" title={period ?? undefined}>
          <PeriodBadges period={period ?? null} />
        </div>
      </div>
      <div className="w-full overflow-hidden" style={{ height: canvasH }} aria-label={`${headerLabel}: Entwicklung${period ? `, Zeitraum ${period}` : ''}`} role="img">
        {typeof renderContent === 'function' ? (
          renderContent(canvasH)
        ) : (
          <SparklineCanvas
            percent={pct}
            xLabels={xLabels}
            ariaLabel={`${headerLabel}: Entwicklung${period ? `, Zeitraum ${period}` : ''}`}
            compact={compact}
            color={color}
            durationMs={durationMs}
            lineWidth={lineWidth}
            glowRadius={glowRadius}
            areaAlpha={areaAlpha}
          />
        )}
      </div>
    </div>
  );
};

// (entfernt: YouTube Inline-Icon – unbenutzt)

// (entfernt: AnimatedBar – unbenutzt)

// Zeitleisten-Badges für Perioden wie "05/2022 – 02/2024" oder "seit 2020"
const PeriodBadges: React.FC<{ period?: string | null }> = ({ period }) => {
  const fmt = React.useMemo(() => {
    if (!period || typeof period !== 'string') return null as { start?: string; end?: string } | null;
    const raw = period.trim();
    const lower = raw.toLowerCase();
    const pad = (n: number) => String(n).padStart(2, '0');
    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();
    const parseMY = (s: string) => {
      const sNorm = normalize(s);
      // Recognize textual open end markers
      if (/^(heute|now|present|ongoing)$/i.test(sNorm)) return 'heute';
      const m1 = /^(\d{1,2})\/(\d{4})$/.exec(sNorm);
      if (m1) return `${pad(parseInt(m1[1]!, 10))}/${m1[2]}`;
      const m2 = /^(\d{4})$/.exec(sNorm);
      if (m2) return m2[1]!;
      return sNorm;
    };
    // seit X → open range
    if (/^seit\s+/i.test(lower)) {
      const after = normalize(raw.replace(/^seit\s*/i, ''));
      return { start: parseMY(after), end: 'heute' };
    }
    // ab/from X → open range
    if (/^(ab|from)\b/i.test(lower)) {
      const after = normalize(raw.replace(/^(ab|from)\s*/i, ''));
      return { start: parseMY(after), end: 'heute' };
    }
    const parts = raw.split(/\s*[–-]\s*/);
    if (parts.length === 2) {
      const start = parseMY(parts[0] ?? '');
      const endRaw = parts[1] ?? '';
      const endParsed = parseMY(endRaw);
      const end = endParsed || 'heute';
      return { start, end };
    }
    // Fallback: Einzelwert als Start und "heute"
    return { start: parseMY(raw), end: 'heute' };
  }, [period]);

  // Dauer berechnen (Jahre/Monate) und Laufindikator bestimmen
  const meta = React.useMemo(() => {
    if (!fmt) return null as null | { ongoing: boolean; duration?: { years: number; months: number } };
    const toDate = (token?: string, isEnd?: boolean): Date | null => {
      if (!token) return null;
      if (token === 'heute') return new Date();
      const mmYYYY = /^(\d{2})\/(\d{4})$/;
      const YYYY = /^(\d{4})$/;
      if (mmYYYY.test(token)) {
        const m = mmYYYY.exec(token)!;
        const monthIdx = Math.max(1, Math.min(12, parseInt(m[1]!, 10))) - 1;
        const year = parseInt(m[2]!, 10);
        return new Date(year, monthIdx, isEnd ? 28 : 1);
      }
      if (YYYY.test(token)) {
        const year = parseInt(token, 10);
        return new Date(year, isEnd ? 11 : 0, isEnd ? 31 : 1);
      }
      return null;
    };
    const startD = toDate(fmt.start, false);
    const endD = toDate(fmt.end, true);
    const ongoing = (fmt.end === 'heute');
    if (!startD || !endD) return { ongoing };
    const totalMonths = (endD.getFullYear() - startD.getFullYear()) * 12 + (endD.getMonth() - startD.getMonth());
    const years = Math.max(0, Math.floor(totalMonths / 12));
    const months = Math.max(0, totalMonths % 12);
    return { ongoing, duration: { years, months } };
  }, [fmt]);

  if (!fmt) return null;
  // Sprache erkennen (de/en) für Einheiten
  const isEN = (() => {
    if (typeof document !== 'undefined') {
      const lang = document.documentElement.lang || '';
      if (/^en/i.test(lang)) return true;
    }
    const raw = (period ?? '').toLowerCase();
    return /(present|ongoing|from)/.test(raw);
  })();
  const unitY = isEN ? 'Y' : 'J';
  const unitM = 'M';
  const label = `Zeitraum: ${fmt.start ?? ''} → ${fmt.end ?? ''}` + (meta?.duration ? ` • Dauer: ${meta.duration.years}${unitY} ${meta.duration.months}${unitM}` : '');
  const isActive = fmt.end === 'heute';
  return (
    <div className="flex items-center gap-1.5 text-[10px] md:text-[10.5px]" aria-label={label} title={label}>
      {fmt.start && (
        <span className="px-2 py-[2px] rounded-full whitespace-nowrap ring-1 ring-[rgba(148,163,184,0.30)] bg-[rgba(148,163,184,0.08)] text-[--color-foreground]">
          {fmt.start}
        </span>
      )}
      <span aria-hidden className="h-px w-7 md:w-9 bg-[rgba(148,163,184,0.28)] rounded-full mx-0.5" />
      {fmt.end && (
        isActive ? (
          <span className="px-2 py-[2px] rounded-full whitespace-nowrap flex items-center gap-1 ring-1 ring-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.10)] text-[--color-foreground-strong]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[rgba(16,185,129,0.9)] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" aria-hidden />
            <span className="uppercase tracking-[0.04em] text-[9px] opacity-75" aria-hidden>live</span>
            {fmt.end}
          </span>
        ) : (
          <span className="px-2 py-[2px] rounded-full whitespace-nowrap ring-1 ring-[rgba(148,163,184,0.30)] bg-[rgba(148,163,184,0.08)] text-[--color-foreground]">
            {fmt.end}
          </span>
        )
      )}
    </div>
  );
};

// --- Types & Schema ---
export type PerfItem = {
  period: string;
  company: string;
  value: number;
  growth: number;
  employees?: number;
  description: string;
  series?: number[];
  startCapital?: number;
};

const PerfArraySchema = z.array(
  z.object({
    period: z.string(),
    company: z.string(),
    value: z.number(),
    growth: z.number(),
    employees: z.number().optional(),
    description: z.string(),
    series: z.array(z.number()).optional(),
    startCapital: z.number().optional(),
  })
);

function usePerformanceFromI18n(): PerfItem[] {
  const messages = useMessages();
  return React.useMemo(() => {
    const root = messages as Record<string, unknown> | undefined;
    if (!root || typeof root !== 'object') return [];
    const cvRaw = 'cv' in root ? (root['cv'] as unknown) : undefined;
    if (!cvRaw || typeof cvRaw !== 'object') return [];
    const cvObj = cvRaw as Record<string, unknown>;
    const perfRaw = 'performance' in cvObj ? (cvObj['performance'] as unknown) : undefined;
    if (!perfRaw || typeof perfRaw !== 'object') return [];
    const perfObj = perfRaw as Record<string, unknown>;
    const itemsRaw = 'items' in perfObj ? (perfObj['items'] as unknown) : undefined;
    if (!itemsRaw) return [];
    const parsed = PerfArraySchema.safeParse(itemsRaw);
    return parsed.success ? (parsed.data as PerfItem[]) : [];
  }, [messages]);
}

type TimelineSparklineProps = { title: string; subtitle?: string; xLabels?: [string, string]; height?: number; headerHeight?: number; compact?: boolean; contextText?: string; maxWidth?: number };

export function TimelineSparkline({ title, subtitle, xLabels, height, headerHeight, compact = true, contextText, maxWidth = 100 }: TimelineSparklineProps): React.ReactElement | null {
  const perf = usePerformanceFromI18n();
  const match = React.useMemo(() => {
    const hay = `${title} ${subtitle ?? ''}`.toLowerCase();
    if (subtitle) {
      const sub = subtitle.toLowerCase();
      const direct = perf.find((p) => {
        const pc = p.company.toLowerCase();
        return pc === sub || pc.includes(sub) || sub.includes(pc);
      });
      if (direct) return direct;
    }
    return perf.find((p) => hay.includes(p.company.toLowerCase()));
  }, [perf, title, subtitle]);

  const headerLabel = match?.company ?? subtitle ?? title;
  const growth = typeof match?.growth === 'number' ? match.growth : undefined;
  const period = match?.period ?? null;

  const autoXLabels = React.useMemo(() => {
    const p = match?.period?.trim();
    if (!p) return undefined;
    const norm = p.replace(/\s+/g, ' ').trim();
    const parts = norm.split(/\s*[–-]\s*/);
    const toLabel = (token: string) => {
      const m1 = /^(\d{1,2})\/(\d{4})$/.exec(token);
      if (m1) return m1[2]!; // Jahr
      if (/^(heute|now|present|ongoing)$/i.test(token)) return 'heute';
      if (/^(\d{4})$/.test(token)) return token;
      return token;
    };
    if (parts.length === 2) {
      return [toLabel(parts[0] ?? ''), toLabel(parts[1] ?? '')] as [string, string];
    }
    // Einzelwert → von Startjahr bis heute
    return [toLabel(norm), 'heute'] as [string, string];
  }, [match]);

  // Heuristik: Stil aus Beschreibung ableiten (Titel/Untertitel/Bullets)
  const hayRaw = `${title} ${subtitle ?? ''} ${contextText ?? ''}`;
  const hay = hayRaw.toLowerCase();
  const isFinance = /(€|eur|revenue|umsatz|gm|gross\s*marg|ltv|cac|payback|mrr|arr|roi|profit|invest|capital|kapital)/i.test(hay);
  const isTech = /(uptime|latency|sdk|edge|cloud|ros2|trl|ai|ml|robot|humanoid|perception|planning|controls|infra|platform)/i.test(hay);
  const isTeam = /(team|mitarbeiter|employees|hiring|esop|roles|education|degree|bachelor|master|ph\.d|phd|schule|uni|fh|tu)/i.test(hay);
  // Optional: Visual-Override Tags [viz:donut|bar|spark]
  const vizOverride = (() => {
    const m = /\[\s*viz\s*:\s*(donut|bar|spark)\s*\]/i.exec(hayRaw);
    return (m ? (m[1]!.toLowerCase() as 'donut'|'bar'|'spark') : undefined);
  })();
  // Optional: Palette-Override [pal:finance|tech|team]
  const palOverride = (() => {
    const m = /\[\s*pal\s*:\s*(finance|tech|team)\s*\]/i.exec(hayRaw);
    return m ? m[1]!.toLowerCase() : undefined;
  })();

  // Farbpaletten (Brand‑freundlich)
  const palettes: Record<'finance'|'tech'|'team'|'default', string> = {
    finance: 'rgba(245,158,11,0.86)',   // amber-500
    tech:    'rgba(6,182,212,0.86)',    // cyan-500
    team:    'rgba(139,92,246,0.86)',   // violet-500
    default: 'rgba(16,185,129,0.85)',   // emerald-500
  };
  // Default Style – Standard Grün, Kontext kann überschreiben
  let color: string = palettes.default;
  let durationMs = 980;
  let lineWidth = compact ? 1.2 : 1.4;
  let glowRadius = compact ? 8 : 10;
  let areaAlpha = compact ? 0.08 : 0.12;

  // Heuristik beeinflusst nur Feintuning (Dauer/Strich/Glow/Fläche), nicht die Farbe
  if (isFinance) { durationMs = 1200; lineWidth = 1.35; glowRadius = 11; areaAlpha = 0.14; color = palettes.finance; }
  else if (isTech) { durationMs = 900; lineWidth = 1.2; glowRadius = 8; areaAlpha = 0.08; color = palettes.tech; }
  else if (isTeam) { durationMs = 1000; lineWidth = 1.25; glowRadius = 9; areaAlpha = 0.10; color = palettes.team; }
  if (palOverride === 'finance') color = palettes.finance;
  if (palOverride === 'tech') color = palettes.tech;
  if (palOverride === 'team') color = palettes.team;

  // Themen-Icon (SVG, leicht, ohne externe Lib)
  const Icon = (() => {
    const cls = "h-[14px] w-[14px] opacity-90 animate-[fadeIn_.6s_ease-out]";
    if (isFinance) return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></svg>);
    if (isTech) return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M7 21h10"/><path d="M9 7l-2 2 2 2"/><path d="M15 11l2-2-2-2"/></svg>);
    if (isTeam) return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 21c0-3.314 2.686-6 6-6"/><path d="M22 21c0-3.314-2.686-6-6-6"/></svg>);
    return null;
  })();
  
  // kleinste Keyframe für Icon-FadeIn
  const IconAnim = (
    <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(2px);} to { opacity: 1; transform: translateY(0);} }`}</style>
  );

  // Datengetriebene Visual-Auswahl
  const hasSeries = Array.isArray(match?.series) && match!.series!.length >= 3;
  let mode: 'spark' | 'bar' | 'donut' = 'spark';
  if (isFinance && typeof growth === 'number') mode = 'donut';
  else if (hasSeries || isTeam) mode = 'bar';
  else if (isTech) mode = 'spark';
  if (vizOverride) mode = vizOverride;

  if (mode === 'donut') {
    return (
      <GenericSparklineBasic
        headerLabel={headerLabel}
        period={period}
        growthPct={growth}
        xLabels={xLabels ?? autoXLabels}
        height={height}
        headerHeight={headerHeight}
        compact={compact}
        color={color}
        durationMs={durationMs}
        lineWidth={lineWidth}
        glowRadius={glowRadius}
        areaAlpha={areaAlpha}
        maxWidth={maxWidth}
        icon={<>{IconAnim}{Icon}</>}
        renderContent={(canvasH) => (
          <div className="w-full h-full flex items-center justify-center">
            <DonutGauge value={typeof growth === 'number' ? growth : 0} size={Math.min(180, Math.max(96, Math.floor(canvasH)))} label={subtitle ?? undefined} ariaLabel={`${headerLabel}: +${Math.round(growth ?? 0)}%`} color={color} />
          </div>
        )}
      />
    );
  }

  if (mode === 'bar') {
    const series = hasSeries ? (match!.series as number[]) : (typeof match?.employees === 'number' ? [Math.max(1, Math.floor(match!.employees! * 0.6)), match!.employees!] : [40, 60, 80, 100]);
    return (
      <GenericSparklineBasic
        headerLabel={headerLabel}
        period={period}
        growthPct={growth}
        xLabels={xLabels ?? autoXLabels}
        height={height}
        headerHeight={headerHeight}
        compact={compact}
        color={color}
        durationMs={durationMs}
        lineWidth={lineWidth}
        glowRadius={glowRadius}
        areaAlpha={areaAlpha}
        maxWidth={maxWidth}
        icon={<>{IconAnim}{Icon}</>}
        renderContent={(canvasH) => (
          <div className="w-full h-full flex items-center justify-center">
            <MiniBarChart series={series} height={Math.max(100, Math.floor(canvasH))} ariaLabel={`${headerLabel}: Balkendiagramm`} color={color} />
          </div>
        )}
      />
    );
  }

  // Default: Sparkline
  return (
    <GenericSparklineBasic
      headerLabel={headerLabel}
      period={period}
      growthPct={growth}
      xLabels={xLabels ?? autoXLabels}
      height={height}
      headerHeight={headerHeight}
      compact={compact}
      color={color}
      durationMs={durationMs}
      lineWidth={lineWidth}
      glowRadius={glowRadius}
      areaAlpha={areaAlpha}
      maxWidth={maxWidth}
      icon={<>{IconAnim}{Icon}</>}
    />
  );
}

export default TimelineSparkline;
