import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { getMessages } from '@/i18n/messages';
import { chapters } from '../chapters.config';
import { buildLocalePath } from '@/i18n/path';
import InViewFade from '@/components/animation/InViewFade';
import SectionCard from '@components/chapters/SectionCard';
import TableSimple from '@/components/ui/TableSimple';
import FunnelChartAnimated from '@/components/charts/FunnelChartAnimated';
import StackedAreaAnimated from '@/components/charts/StackedAreaAnimated';
import { NumberedList, NumberedItem } from '@components/chapters/NumberedList';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const index = Math.max(0, chapters.findIndex((c) => c.slug === 'gtm')) + 1;
  return {
    robots: { index: false, follow: true },
    alternates: { canonical: buildLocalePath(locale, `/chapters/${index}`) },
  };
}

export default async function GoToMarketPage() {
  const tBp = await getTranslations('bp');
  const locale = await getLocale();
  const { bp } = await getMessages(locale.startsWith('de') ? 'de' : 'en');
  const bpAny = bp as any;
  const chapterIndex = Math.max(0, chapters.findIndex((c) => c.slug === 'gtm')) + 1;
  const chapterTitle = `${locale.startsWith('de') ? 'Kapitel' : 'Chapter'} ${chapterIndex} – ${tBp('sections.gtm')}`;

  // Einheitliche Unterkapitel-Nummerierung (wie in team/risks)
  let subCounter = 0;
  const sub = () => `${chapterIndex}.${++subCounter}`;

  // Inhalte aus i18n laden; fehlende Keys defensiv mit leeren Arrays abfangen
  let phases: Array<{ name: string; items?: string[] }> = [];
  let tactics: string[] = [];
  let kpis: string[] = [];
  let funnel: Array<{ stage: string; metric?: string; target?: string; notes?: string }> = [];
  let channelMix: Array<{ channel: string; share: number; metrics?: string[]; notes?: string }> = [];
  try {
    const v = bpAny?.gtm?.phases as Array<{ name: string; items?: string[] }> | undefined;
    if (Array.isArray(v)) phases = v;
  } catch {/* fehlender Key */}
  try {
    const v = bpAny?.gtm?.tactics as string[] | undefined;
    if (Array.isArray(v)) tactics = v;
  } catch {/* fehlender Key */}
  try {
    const v = bpAny?.gtm?.kpis as string[] | undefined;
    if (Array.isArray(v)) kpis = v;
  } catch {/* fehlender Key */}
  try {
    const v = bpAny?.gtm?.funnel as Array<{ stage: string; metric?: string; target?: string; notes?: string }> | undefined;
    if (Array.isArray(v)) funnel = v;
  } catch {/* fehlender Key */}
  try {
    const v = bpAny?.gtm?.channelMix as Array<{ channel: string; share: number; metrics?: string[]; notes?: string }> | undefined;
    if (Array.isArray(v)) channelMix = v;
  } catch {/* fehlender Key */}

  return (
    <div className="space-y-7 md:space-y-8">
      <div className="prose prose-sm max-w-none [font-feature-settings:'ss01','ss02','liga','clig','tnum']">
        <h1 className="section-title font-semibold tracking-tight leading-tight text-[--color-foreground-strong]">{chapterTitle}</h1>
        {/* Intro – verkäuferisch, fließender Text */}
        <InViewFade as="p" delay={0.05} duration={0.36} offsetY={10} easing="cubic-bezier(0.16, 1, 0.3, 1)" threshold={0.08} rootMargin="-12% 0px" className="text-[13px] md:text-[14px] leading-relaxed text-[--color-foreground] mb-2.5 md:mb-3">
          {locale.startsWith('de')
            ? 'Unser Go‑to‑Market kombiniert Design‑Partner, OEM‑Allianzen und ein Developer‑Ökosystem. Ziel: schnelle Validierung, skalierbare Adoption und messbare Expansion über den App‑Store.'
            : 'Our GTM blends design partners, OEM alliances and a developer ecosystem. Goal: rapid validation, scalable adoption and measurable expansion via the app store.'}
        </InViewFade>
        <InViewFade as="p" delay={0.1} duration={0.36} offsetY={10} easing="cubic-bezier(0.16, 1, 0.3, 1)" threshold={0.08} rootMargin="-12% 0px" className="text-[13px] text-[--color-foreground]">
          {locale.startsWith('de')
            ? 'Wir fokussieren auf Leuchtturm‑Referenzen, nahtlose Integrationen und klaren ROI – damit aus Piloten planbare Rollouts und aus Rollouts nachhaltige Expansion wird.'
            : 'We focus on lighthouse references, seamless integrations and clear ROI – turning pilots into predictable rollouts and rollouts into durable expansion.'}
        </InViewFade>

        {/* Phasen */}
        <InViewFade as="section" aria-labelledby="gtm-phases" duration={0.38} offsetY={10} easing="cubic-bezier(0.16, 1, 0.3, 1)" threshold={0.08} rootMargin="-12% 0px">
          <SectionCard id="gtm-phases">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${tBp('headings.phases')}`}</h3>
            {phases.length > 0 ? (
              <>
                <p className="text-[12px] md:text-[13px] leading-relaxed text-[--color-foreground-muted]">
                  {locale.startsWith('de')
                    ? 'Von Pilot‑Fit über App‑Store‑Beta bis zum Enterprise‑Rollout – jede Phase hat klare Ziele und Messpunkte.'
                    : 'From pilot fit to app‑store beta to enterprise rollout – each phase has clear objectives and metrics.'}
                </p>
                <div className="not-prose mt-2.5">
                  {phases.map((p, i) => (
                    <InViewFade key={`${i}-${p.name}`} delay={i * 0.15} duration={0.8} offsetY={15} easing="cubic-bezier(0.25, 0.46, 0.45, 0.94)" threshold={0.1} rootMargin="-8% 0px" className="text-[13px]">
                      <NumberedList className="mb-2">
                        <NumberedItem num={`${chapterIndex}.1.${i + 1}`} title={p.name}>
                          {Array.isArray(p.items) && p.items.length > 0 && (
                            <NumberedList className="mt-1">
                              {p.items.map((it, idx) => (
                                <NumberedItem key={idx} num={`${chapterIndex}.1.${i + 1}.${idx + 1}`}>{it}</NumberedItem>
                              ))}
                            </NumberedList>
                          )}
                        </NumberedItem>
                      </NumberedList>
                    </InViewFade>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-[--color-foreground-muted]">{tBp('emptyNotice')}</p>
            )}
          </SectionCard>
        </InViewFade>

        {/* Divider (nur Abstand, ohne sichtbare Linie) */}
        <div aria-hidden className="not-prose my-4 md:my-7" />

        {/* Funnel */}
        <InViewFade as="section" aria-labelledby="gtm-funnel" duration={0.38} offsetY={10} easing="cubic-bezier(0.16, 1, 0.3, 1)" threshold={0.08} rootMargin="-12% 0px">
          <SectionCard id="gtm-funnel">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${tBp('headings.funnel')}`}</h3>
            {/* Edles, kompaktes Funnel-Diagramm über der Tabelle */}
            {funnel.length > 0 ? (
              <div className="mt-3 overflow-x-auto rounded-xl bg-[--color-surface] p-3">
                <FunnelChartAnimated
                  stages={funnel.map((f, idx) => {
                    // 1) Versuche Prozent aus target ODER metric zu erkennen
                    const parsePercent = (s?: string) => {
                      if (!s) return NaN;
                      const m = s.match(/([0-9]+(?:[.,][0-9]+)?)\s*%/);
                      return m ? parseFloat(m[1].replace(',', '.')) : NaN;
                    };
                    // 2) Fallback: numerische Werte (inkl. k/M) für Breite ableiten
                    const parseNumberWithUnits = (s?: string) => {
                      if (!s) return NaN;
                      const trimmed = s.trim();
                      const m = trimmed.match(/([>~≈]?\s*)?([0-9]+(?:[.,][0-9]+)?)\s*([kKmMbB])?/);
                      if (!m) return NaN;
                      const num = parseFloat(m[2].replace(',', '.'));
                      const unit = m[3]?.toLowerCase();
                      const factor = unit === 'k' ? 1_000 : unit === 'm' ? 1_000_000 : unit === 'b' ? 1_000_000_000 : 1;
                      return num * factor;
                    };
                    const pct = Number.isFinite(parsePercent(f.target)) ? parsePercent(f.target) : parsePercent(f.metric);
                    const numeric = Number.isFinite(pct) ? pct : (Number.isFinite(parseNumberWithUnits(f.target)) ? parseNumberWithUnits(f.target) : parseNumberWithUnits(f.metric));
                    // 3) Wert für Breite: Prozent direkt nutzen, sonst numerischen Wert, sonst fallback sequentiell
                    const value = Number.isFinite(numeric) ? numeric : Math.max(1, 100 - idx * 10);
                    // 4) Label-Text: Prozent → "xx%"; sonst bevorzugt target/metrik Rohtext anzeigen
                    let display: string = '';
                    if (Number.isFinite(pct)) {
                      display = `${Math.round(pct!)}%`;
                    } else if (typeof f.target === 'string' && f.target.trim().length > 0) {
                      display = f.target.trim();
                    } else if (typeof f.metric === 'string' && f.metric.trim().length > 0) {
                      display = f.metric.trim();
                    }
                    return { label: `${f.stage} — ${display}`.trim(), value };
                  })}
                  responsive
                  height={240}
                  ariaLabel={tBp('headings.funnel')}
                  showLabels
                />
              </div>
            ) : null}
            <p className="text-[12px] md:text-[13px] leading-relaxed text-[--color-foreground] mb-2.5">
              {locale.startsWith('de')
                ? 'Der GTM‑Funnel wird konsequent gemessen – von Awareness über Evaluation bis Rollout. Ziel: planbare Conversion je Stufe.'
                : 'We instrument the GTM funnel end‑to‑end – from awareness to rollout. Goal: predictable conversion at each stage.'}
            </p>
            {funnel.length > 0 ? (
              <TableSimple
                headers={[tBp('tables.headers.stage'), tBp('tables.headers.metric'), tBp('tables.headers.target'), tBp('tables.headers.notes')]}
                rows={funnel.map((f) => [
                  f.stage,
                  f.metric ?? '',
                  f.target ?? '',
                  f.notes ?? ''
                ])}
                className="mt-3"
                animateRows
                rowVariant="fadeInUp"
                stagger={0.06}
                zebra
                denseRows
                emphasizeFirstCol
              />
            ) : (
              <p className="text-[--color-foreground-muted]">{tBp('emptyNotice')}</p>
            )}
          </SectionCard>
        </InViewFade>

        {/* Divider (nur Abstand, ohne sichtbare Linie) */}
        <div aria-hidden className="not-prose my-5 md:my-8" />

        {/* Channel Mix */}
        <InViewFade as="section" aria-labelledby="gtm-channelMix" duration={1.2} offsetY={20} easing="cubic-bezier(0.25, 0.46, 0.45, 0.94)" threshold={0.1} rootMargin="-8% 0px">
          <SectionCard id="gtm-channelMix">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${tBp('headings.channelMix')}`}</h3>
            {channelMix.length > 0 ? (
              <>
                <p className="text-[12px] md:text-[13px] leading-relaxed text-[--color-foreground] mb-2.5">
                  {locale.startsWith('de')
                    ? 'Channel Mix Entwicklung über 6 Monate – von ersten Partnerschaften bis zur skalierten Multi-Channel-Strategie.'
                    : 'Channel mix evolution over 6 months – from initial partnerships to scaled multi-channel strategy.'}
                </p>
                <div className="mt-3 overflow-x-auto rounded-xl bg-[--color-surface] p-3 shadow-none ring-0 border-0 will-change-transform">
                  <StackedAreaAnimated
                    labels={["M1", "M2", "M3", "M4", "M5", "M6"]}
                    series={(() => {
                      const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#14b8a6"];
                      return channelMix.map((channel, index) => {
                        const baseShare = channel.share;
                        const growthPattern = (() => {
                          switch (channel.channel) {
                            case "Allianzen (OEM/Integrator)":
                            case "Alliances (OEM/integrator)":
                              return [0.3, 0.5, 0.7, 0.85, 0.95, 1.0];
                            case "Design‑Partner/Direct":
                            case "Design partners/direct":
                              return [0.8, 0.9, 0.95, 1.0, 1.0, 0.95];
                            case "Developer/Marketplace":
                            case "Developer/marketplace":
                              return [0.1, 0.2, 0.4, 0.6, 0.8, 1.0];
                            case "Events & Demos":
                              return [0.6, 0.8, 1.0, 0.7, 0.9, 1.0];
                            case "Content/SEO/Community":
                              return [0.4, 0.5, 0.6, 0.7, 0.8, 1.0];
                            default:
                              return [0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
                          }
                        })();
                        
                        const values = growthPattern.map(factor => Math.round(baseShare * factor * 10) / 10);
                        
                        return {
                          name: channel.channel.replace(/‑/g, '-'),
                          color: colors[index % colors.length],
                          values: values
                        };
                      });
                    })()}
                    width={560}
                    height={280}
                    responsive
                    className="will-change-transform"
                    ariaLabel={tBp('headings.channelMix')}
                  />
                </div>
                
                {/* Tabelle mit Channel Details */}
                <div className="mt-4">
                  <TableSimple
                    headers={[tBp('tables.headers.channel'), tBp('tables.headers.share'), 'Metriken', 'Notizen']}
                    rows={channelMix.map((c) => [
                      c.channel,
                      `${c.share}%`,
                      Array.isArray(c.metrics) ? c.metrics.join(', ') : '',
                      c.notes ?? ''
                    ])}
                    className="bg-transparent ring-0 shadow-none"
                    animateRows
                    rowVariant="fadeInUp"
                    stagger={0.06}
                    zebra
                    denseRows
                    emphasizeFirstCol
                  />
                </div>
              </>
            ) : (
              <p className="text-[--color-foreground-muted]">{tBp('emptyNotice')}</p>
            )}
          </SectionCard>
        </InViewFade>

        {/* Divider (nur Abstand, ohne sichtbare Linie) */}
        <div aria-hidden className="not-prose my-4 md:my-6" />

        {/* Taktiken */}
        <InViewFade as="section" aria-labelledby="gtm-tactics" duration={1.0} offsetY={15} easing="cubic-bezier(0.25, 0.46, 0.45, 0.94)" threshold={0.1} rootMargin="-8% 0px">
          <SectionCard id="gtm-tactics">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${tBp('headings.tactics')}`}</h3>
            {tactics.length > 0 ? (
              <>
                <p className="text-[12px] md:text-[13px] leading-relaxed text-[--color-foreground] mb-2.5">
                  {locale.startsWith('de')
                    ? 'Kern‑Taktiken für schnelle Traktion und effiziente Pipeline‑Konversion:'
                    : 'Core tactics for fast traction and efficient pipeline conversion:'}
                </p>
                <InViewFade>
                  <NumberedList>
                    {tactics.map((tactic, idx) => (
                      <NumberedItem key={idx} num={`${chapterIndex}.4.${idx + 1}`}>{tactic}</NumberedItem>
                    ))}
                  </NumberedList>
                </InViewFade>
              </>
            ) : (
              <p className="text-[--color-foreground-muted]">{tBp('emptyNotice')}</p>
            )}
          </SectionCard>
        </InViewFade>

        {/* Divider (nur Abstand, ohne sichtbare Linie) */}
        <div aria-hidden className="not-prose my-4 md:my-6" />

        {/* KPIs */}
        <InViewFade as="section" aria-labelledby="gtm-kpis" duration={1.0} offsetY={15} easing="cubic-bezier(0.25, 0.46, 0.45, 0.94)" threshold={0.1} rootMargin="-8% 0px">
          <SectionCard id="gtm-kpis">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${tBp('headings.kpis')}`}</h3>
            {kpis.length > 0 ? (
              <>
                <p className="text-[12px] md:text-[13px] text-[--color-foreground] mb-2">
                  {locale.startsWith('de')
                    ? 'Wir steuern über wenige, aussagekräftige KPIs – Uptime, Latenz, Adoption:'
                    : 'We operate with a few decisive KPIs – uptime, latency, adoption:'}
                </p>
                <InViewFade>
                  <NumberedList>
                    {kpis.map((kpi, idx) => (
                      <NumberedItem key={idx} num={`${chapterIndex}.5.${idx + 1}`}>{kpi}</NumberedItem>
                    ))}
                  </NumberedList>
                </InViewFade>
              </>
            ) : (
              <p className="text-[--color-foreground-muted]">{tBp('emptyNotice')}</p>
            )}
          </SectionCard>
        </InViewFade>

        {/* Print is handled globally in chapters layout */}
      </div>
    </div>
  );
}
