import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { getMessages } from '@/i18n/messages';
import { chapters } from '../chapters.config';
import { buildLocalePath } from '@/i18n/path';
import InViewFade from '@/components/animation/InViewFade';
import SectionCard from '@components/chapters/SectionCard';
import { NumberedList, NumberedItem } from '@components/chapters/NumberedList';
import ElegantCard from '@/components/ui/ElegantCard';
import MiniSparkline from '@/components/charts/MiniSparkline';
import MiniBar from '@/components/charts/MiniBar';
import MiniDonut from '@/components/charts/MiniDonut';
import ROIInlineSimulator from './ROIInlineSimulator';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const index = Math.max(0, chapters.findIndex((c) => c.slug === 'exit-strategy')) + 1;
  return {
    robots: { index: false, follow: true },
    alternates: { canonical: buildLocalePath(locale, `/chapters/${index}`) },
  };
}

export default async function ExitStrategyPage() {
  const locale = await getLocale();
  const t = await getTranslations('bp.exit');
  const tBp = await getTranslations('bp');
  const { bp } = await getMessages(locale.startsWith('de') ? 'de' : 'en');
  const exit = (bp as any)?.exit ?? {};
  const chapterIndex = Math.max(0, chapters.findIndex((c) => c.slug === 'exit-strategy')) + 1;
  const chapterTitle = `${locale.startsWith('de') ? 'Kapitel' : 'Chapter'} ${chapterIndex} – ${tBp('sections.exit')}`;
  // Laufende Unterkapitel-Nummerierung wie in Kapitel 1/2
  let subCounter = 0;
  const sub = () => `${chapterIndex}.${++subCounter}`;
  const a = (exit?.options?.a?.points as string[] | undefined) ?? [];
  const b = (exit?.options?.b?.points as string[] | undefined) ?? [];
  const c = (exit?.options?.c?.points as string[] | undefined) ?? [];
  const roiText = (exit?.roi?.text as string | undefined) ?? '';
  const valuation = exit?.valuation ?? {};
  const earnOut = exit?.earnOut ?? {};
  const secondary = exit?.secondary ?? {};
  const coInvest = exit?.coInvest ?? {};
  const buyers = exit?.buyers ?? {};
  const timeline = exit?.timeline ?? {};
  const preparation = exit?.preparation ?? {};
  const exitRisks = exit?.risks ?? {};

  return (
    <div className="space-y-6">
      <div className="prose prose-sm max-w-none [font-feature-settings:'ss01','ss02','liga','clig','tnum']">
        <h1 className="section-title font-semibold tracking-tight leading-tight text-[--color-foreground-strong]">{chapterTitle}</h1>

        {/* Option Cards (A/B/C) */}
        <span id="exit-options" className="sr-only" aria-hidden="true" />
        <div className="not-prose mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3 items-stretch">
          {[{ key: 'a', icon: undefined, color: 'var(--kpi-blue)', bg: 'var(--kpi-blue-bg)', series: [12,14,16,18,20], titleKey: 'growth' },
            { key: 'b', icon: undefined, color: 'var(--kpi-green)', bg: 'var(--kpi-green-bg)', series: [8,10,14,19,25], titleKey: 'forecast' },
            { key: 'c', icon: undefined, color: 'var(--kpi-amber)', bg: 'var(--kpi-amber-bg)', series: [5,6,7,8,9], titleKey: 'marketshare' }].map((opt, idx) => {
            const title = t(`options.${opt.key}.title`);
            const chartTitle = t(`options.${opt.key}.chartTitle`);
            const list = opt.key === 'a' ? a : opt.key === 'b' ? b : c;
            return (
              <InViewFade key={opt.key} delay={0.04 + idx * 0.05} className="h-full">
                <ElegantCard
                  className="h-full"
                  innerClassName="relative h-full rounded-[12px] bg-[--color-surface] p-0"
                  ariaLabel={`${title} Option Card`}
                  role="group"
                >
                  <div className="border-b border-zinc-600/25 px-4 py-3 md:px-4.5">
                    <div className="flex items-center gap-2">
                      <span aria-hidden className="inline-flex h-[14px] w-[14px] items-center justify-center rounded-sm bg-[--color-muted] text-[10px] text-[--color-foreground-muted]/80">•</span>
                      <div className="not-prose w-full leading-tight font-medium text-[--color-foreground-muted] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontSize: 'clamp(10px, 0.9vw, 15px)' }}>
                        {title}
                      </div>
                      <details className="ml-auto">
                        <summary className="cursor-pointer list-none text-[--color-foreground-muted]" aria-label={locale.startsWith('de') ? 'Info' : 'Info'}>
                          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[--color-muted] text-[10px]">i</span>
                        </summary>
                        {Array.isArray(list) && list.length > 0 && (
                          <div className="mt-1 w-64 rounded-md bg-[--color-popover] p-2 text-[12px] shadow-lg border border-[--color-border] z-10">
                            <ul>
                              {list.map((x, i) => (<li key={i}>{x}</li>))}
                            </ul>
                          </div>
                        )}
                      </details>
                    </div>
                  </div>
                  <div className="p-3 md:p-3.5">
                    <div className="text-xs font-medium text-[--color-foreground-muted] text-center mb-1">
                      {chartTitle}
                    </div>
                    {opt.key === 'b' ? (
                      <MiniSparkline data={opt.series} height={18} delay={0.12 + idx * 0.08} duration={3.2} className="w-full my-1" colorStart={opt.color} colorEnd={opt.color} showArea={false} showDot />
                    ) : opt.key === 'c' ? (
                      <MiniDonut value={0.7} color={opt.color} bg={opt.bg} delay={0.12 + idx * 0.08} duration={3.2} className="my-1" />
                    ) : (
                      <MiniBar data={opt.series} color={opt.color} bg={opt.bg} delay={0.12 + idx * 0.08} duration={3.2} className="w-full my-1" />
                    )}
                    {Array.isArray(list) && list.length > 0 && (
                      <ul>
                        {list.slice(0, 4).map((x, i) => (<li key={i}>{x}</li>))}
                      </ul>
                    )}
                  </div>
                </ElegantCard>
              </InViewFade>
            );
          })}
        </div>

        <div className="space-y-6 mt-6">
          <InViewFade as="section" delay={0.08}>
            <SectionCard id="exit-investor-value">
              <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${locale.startsWith('de') ? 'Investor Value' : 'Investor Value'}`}</h3>
              <p>{t('notes')}</p>
            </SectionCard>
          </InViewFade>

          <InViewFade as="section" delay={0.1}>
            <SectionCard id="exit-roi">
              <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${t('roi.title')}`}</h3>
              <p>{roiText}</p>
              <div className="mt-3">
                <ROIInlineSimulator />
              </div>
            </SectionCard>
          </InViewFade>

          {valuation && (
            <InViewFade as="section" delay={0.12}>
              <SectionCard id="exit-valuation">
                <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${valuation.title ?? (locale.startsWith('de') ? 'Bewertungsansatz' : 'Valuation approach')}`}</h3>
                {Array.isArray(valuation.methods) && valuation.methods.length > 0 && (
                  <>
                    <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">Methods</h3>
                    <NumberedList>
                      {valuation.methods.map((x: string, i: number) => (
                        <NumberedItem key={i} num={`${chapterIndex}.3.${i + 1}`}>{x}</NumberedItem>
                      ))}
                    </NumberedList>
                  </>
                )}
                {valuation.range && <p><strong>Range:</strong> {valuation.range}</p>}
                {Array.isArray(valuation.multiples) && valuation.multiples.length > 0 && (
                  <>
                    <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">Multiples</h3>
                    <NumberedList>
                      {valuation.multiples.map((x: string, i: number) => (
                        <NumberedItem key={i} num={`${chapterIndex}.3.${i + 1 + (Array.isArray(valuation.methods) ? valuation.methods.length : 0)}`}>{x}</NumberedItem>
                      ))}
                    </NumberedList>
                  </>
                )}
              </SectionCard>
            </InViewFade>
          )}

          {earnOut && (
            <InViewFade as="section" delay={0.14}>
              <SectionCard id="exit-earnout">
                <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${earnOut.title ?? (locale.startsWith('de') ? 'Earn‑out Mechanismen' : 'Earn‑out mechanisms')}`}</h3>
                {Array.isArray(earnOut.mechanics) && (
                  <NumberedList>
                    {earnOut.mechanics.map((x: string, i: number) => (
                      <NumberedItem key={i} num={`${chapterIndex}.4.${i + 1}`}>{x}</NumberedItem>
                    ))}
                  </NumberedList>
                )}
              </SectionCard>
            </InViewFade>
          )}

          {secondary && (
            <InViewFade as="section" delay={0.16}>
              <SectionCard id="exit-secondary">
                <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${secondary.title ?? (locale.startsWith('de') ? 'Secondary Optionen' : 'Secondary options')}`}</h3>
                {Array.isArray(secondary.points) && (
                  <NumberedList>
                    {secondary.points.map((x: string, i: number) => (
                      <NumberedItem key={i} num={`${chapterIndex}.5.${i + 1}`}>{x}</NumberedItem>
                    ))}
                  </NumberedList>
                )}
              </SectionCard>
            </InViewFade>
          )}

          {coInvest && (
            <InViewFade as="section" delay={0.18}>
              <SectionCard id="exit-coinvest">
                <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${coInvest.title ?? (locale.startsWith('de') ? 'Co‑Investment Strukturen' : 'Co‑investment structures')}`}</h3>
                {Array.isArray(coInvest.points) && (
                  <NumberedList>
                    {coInvest.points.map((x: string, i: number) => (
                      <NumberedItem key={i} num={`${chapterIndex}.6.${i + 1}`}>{x}</NumberedItem>
                    ))}
                  </NumberedList>
                )}
              </SectionCard>
            </InViewFade>
          )}

          {buyers && (
            <InViewFade as="section" delay={0.2}>
              <SectionCard id="exit-buyers">
                <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${buyers.title ?? (locale.startsWith('de') ? 'Potenzielle Käufer' : 'Potential buyers')}`}</h3>
                {Array.isArray(buyers.strategic) && buyers.strategic.length > 0 && (
                  <>
                    <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">Strategic</h3>
                    <NumberedList>
                      {buyers.strategic.map((x: string, i: number) => (
                        <NumberedItem key={i} num={`${chapterIndex}.7.${i + 1}`}>{x}</NumberedItem>
                      ))}
                    </NumberedList>
                  </>
                )}
                {Array.isArray(buyers.financial) && buyers.financial.length > 0 && (
                  <>
                    <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">Financial</h3>
                    <NumberedList>
                      {buyers.financial.map((x: string, i: number) => (
                        <NumberedItem key={i} num={`${chapterIndex}.7.${i + 1 + (Array.isArray(buyers.strategic) ? buyers.strategic.length : 0)}`}>{x}</NumberedItem>
                      ))}
                    </NumberedList>
                  </>
                )}
              </SectionCard>
            </InViewFade>
          )}

          {timeline && (
            <InViewFade as="section" delay={0.22}>
              <SectionCard id="exit-timeline">
                <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${timeline.title ?? (locale.startsWith('de') ? 'Exit‑Zeitplan' : 'Exit timeline')}`}</h3>
                {Array.isArray(timeline.phases) && timeline.phases.length > 0 && (
                  <NumberedList>
                    {timeline.phases.map((p: any, i: number) => (
                      <NumberedItem key={i} num={`${chapterIndex}.8.${i + 1}`}>
                        <strong>{p.period}:</strong> {Array.isArray(p.activities) ? p.activities.join(', ') : ''}
                      </NumberedItem>
                    ))}
                  </NumberedList>
                )}
              </SectionCard>
            </InViewFade>
          )}

          {preparation && (
            <InViewFade as="section" delay={0.24}>
              <SectionCard id="exit-preparation">
                <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${preparation.title ?? (locale.startsWith('de') ? 'Exit‑Vorbereitung' : 'Exit preparation')}`}</h3>
                {Array.isArray(preparation.actions) && (
                  <NumberedList>
                    {preparation.actions.map((x: string, i: number) => (
                      <NumberedItem key={i} num={`${chapterIndex}.9.${i + 1}`}>{x}</NumberedItem>
                    ))}
                  </NumberedList>
                )}
              </SectionCard>
            </InViewFade>
          )}

          {exitRisks && (
            <InViewFade as="section" delay={0.26}>
              <SectionCard id="exit-risks">
                <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${exitRisks.title ?? (locale.startsWith('de') ? 'Exit‑Risiken & Mitigation' : 'Exit risks & mitigations')}`}</h3>
                {Array.isArray(exitRisks.items) && (
                  <NumberedList>
                    {exitRisks.items.map((x: any, i: number) => (
                      <NumberedItem key={i} num={`${chapterIndex}.10.${i + 1}`}>
                        <strong>{x.risk}:</strong> {x.mitigation}
                      </NumberedItem>
                    ))}
                  </NumberedList>
                )}
              </SectionCard>
            </InViewFade>
          )}
        </div>
      </div>
      {/* Print is handled globally in chapters layout */}
    </div>
  );
}
