import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { getMessages } from '@/i18n/messages';
import { chapters } from '../chapters.config';
import { buildLocalePath } from '@/i18n/path';
import InViewFade from '@/components/animation/InViewFade';
import SectionCard from '@components/chapters/SectionCard';
import MiniDonut from '@/components/charts/MiniDonut';
import MiniBar from '@/components/charts/MiniBar';
import MiniSparkline from '@/components/charts/MiniSparkline';
import { getChapterTheme } from '@/app/chapters/chapterTheme';
import ElegantCard from '@/components/ui/ElegantCard';
// Icons entfernt – aktuell nicht genutzt

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const index = Math.max(0, chapters.findIndex((c) => c.slug === 'risks')) + 1;
  return {
    robots: { index: false, follow: true },
    alternates: { canonical: buildLocalePath(locale, `/chapters/${index}`) },
  };
}

export default async function RiskPage() {
  const t = await getTranslations('bp.risks');
  const tBp = await getTranslations('bp');
  const locale = await getLocale();
  const { bp } = await getMessages(locale.startsWith('de') ? 'de' : 'en');
  const br = (bp as any)?.risks ?? {};
  const chapterIndex = Math.max(0, chapters.findIndex((c) => c.slug === 'risks')) + 1;
  const chapterTitle = `${locale.startsWith('de') ? 'Kapitel' : 'Chapter'} ${chapterIndex} – ${tBp('sections.risks')}`;
  const theme = getChapterTheme('risks');
  // Checklist entfernt
  // Einheitliche Unterkapitel-Nummerierung
  let subCounter = 0;
  const sub = () => `${chapterIndex}.${++subCounter}`;

  return (
    <div className="space-y-8">
      <div className="prose prose-sm max-w-none [font-feature-settings:'ss01','ss02','liga','clig','tnum']">
        <h1 className="section-title font-semibold tracking-tight leading-tight text-[--color-foreground-strong]">{chapterTitle}</h1>

        {/* KPI-Stat-Karten (Risks) – optional, mit defensiven Fallbacks analog Business Model */}
        {(() => {
          const de = locale.startsWith('de');
          const kpi = (br?.kpi as any) ?? {};
          const cards = [
            {
              label: de ? 'Top-Risiken' : 'Top Risks',
              value: kpi?.topRisks ?? (de ? '3–5' : '3–5'),
              sub: de ? 'priorisiert' : 'prioritized',
              chart: 'donut' as const,
            },
            {
              label: de ? 'Mitigation' : 'Mitigation',
              value: kpi?.mitigationCoverage ?? (de ? '70–80%' : '70–80%'),
              sub: de ? 'Abdeckung' : 'coverage',
              chart: 'donut' as const,
            },
            {
              label: de ? 'Regulatorik' : 'Regulatory',
              value: kpi?.regulatoryReadiness ?? (de ? 'EU‑Ready' : 'EU‑Ready'),
              sub: de ? 'EU AI Act' : 'EU AI Act',
              chart: 'spark' as const,
            },
            {
              label: de ? 'Finanzspielraum' : 'Runway',
              value: kpi?.runway ?? (de ? '12–18M' : '12–18M'),
              sub: de ? 'Monate (Ziel)' : 'months (target)',
              chart: 'bar' as const,
            },
          ] as const;
          return (
            <div className="not-prose mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
              {cards.map((s, idx) => (
                <InViewFade key={`${String(s.label)}-${idx}`} delay={idx * 0.05} className="h-full">
                  <ElegantCard
                    className="h-full"
                    innerClassName="relative h-full rounded-[12px] bg-[--color-surface] p-4 md:p-5 lg:p-6"
                    ariaLabel={`${s.label} KPI Card`}
                    role="group"
                  >
                    <div className="text-center">
                      <div className="text-[10px] md:text-[11px] tracking-wide uppercase mb-2 text-[--color-foreground-muted]">
                        <span>{s.label}</span>
                      </div>
                      <div className="mb-3 kpi-visual">
                        {s.chart === 'bar' ? (
                          <MiniBar
                            data={[24, 30, 28, 26, 22]}
                            color={theme.warning}
                            bg={`${theme.warning}15`}
                            delay={0.12 + idx * 0.08}
                            duration={3.2}
                            className="w-full h-4"
                          />
                        ) : s.chart === 'spark' ? (
                          <MiniSparkline
                            data={[40, 44, 46, 49, 52]}
                            height={16}
                            delay={0.12 + idx * 0.08}
                            duration={3.2}
                            className="w-full"
                            colorStart={theme.info}
                            colorEnd={theme.primary}
                            showArea={false}
                            showDot
                          />
                        ) : (
                          <MiniDonut
                            value={0.72}
                            gradient
                            colorStart={theme.primary}
                            colorEnd={theme.info}
                            bg={`${theme.primary}20`}
                            strokeWidth={3.5}
                            size={24}
                            glow
                            showValue
                            valueColor={"var(--color-foreground)"}
                            delay={0.12 + idx * 0.08}
                            duration={1.6}
                            className="mx-auto"
                          />
                        )}
                      </div>
                      <div className="kpi-value-row [font-feature-settings:'tnum'] [font-variant-numeric:tabular-nums]">
                        <span className="whitespace-normal break-words" title={String(s.value)}>{String(s.value)}</span>
                      </div>
                      <div className="mx-auto mt-2 h-px w-8/12 bg-[--color-border-subtle]/25" aria-hidden />
                      <div className="mt-1.5 text-[12px] md:text-[12.5px] text-[--color-foreground] opacity-85 one-line">{s.sub}</div>
                    </div>
                  </ElegantCard>
                </InViewFade>
              ))}
            </div>
          );
        })()}

        

        <InViewFade as="section" delay={0.04}>
          <SectionCard id="tech-risk">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${t('tech.title')}`}</h3>
            <div className="text-[13px] md:text-[14px] leading-relaxed">
              <ul className="list-none pl-0 space-y-1.5 text-[--color-foreground]">
                <li>
                  <span className="flex items-start gap-2">
                    <span className="text-[--color-foreground] font-medium text-xs">{`${chapterIndex}.1.1`}</span>
                    <span>
                      <strong>{t('tech.complexity.title')}:</strong> {br?.tech?.complexity?.risk}
                      <br />
                      <span className="text-[--color-foreground-muted]">{t('mitigation.title')}: {br?.tech?.complexity?.mitigation}</span>
                    </span>
                  </span>
                </li>
                <li>
                  <span className="flex items-start gap-2">
                    <span className="text-[--color-foreground] font-medium text-xs">{`${chapterIndex}.1.2`}</span>
                    <span>
                      <strong>{t('tech.aiSafety.title')}:</strong> {br?.tech?.aiSafety?.risk}
                      <br />
                      <span className="text-[--color-foreground-muted]">{t('mitigation.title')}: {br?.tech?.aiSafety?.mitigation}</span>
                    </span>
                  </span>
                </li>
                <li>
                  <span className="flex items-start gap-2">
                    <span className="text-[--color-foreground] font-medium text-xs">{`${chapterIndex}.1.3`}</span>
                    <span>
                      <strong>{t('tech.vendors.title')}:</strong> {br?.tech?.vendors?.risk}
                      <br />
                      <span className="text-[--color-foreground-muted]">{t('mitigation.title')}: {br?.tech?.vendors?.mitigation}</span>
                    </span>
                  </span>
                </li>
              </ul>
            </div>
          </SectionCard>
        </InViewFade>

        <InViewFade as="section" delay={0.06}>
          <SectionCard id="market-risk">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${t('market.title')}`}</h3>
            <div className="text-[13px] md:text-[14px] leading-relaxed">
              <ul className="list-none pl-0 space-y-1.5 text-[--color-foreground]">
                <li>
                  <span className="flex items-start gap-2">
                    <span className="text-[--color-foreground] font-medium text-xs">{`${chapterIndex}.2.1`}</span>
                    <span>
                      <strong>{t('market.adoption.title')}:</strong> {br?.market?.adoption?.risk}
                      <br />
                      <span className="text-[--color-foreground-muted]">{t('mitigation.title')}: {br?.market?.adoption?.mitigation}</span>
                    </span>
                  </span>
                </li>
                <li>
                  <span className="flex items-start gap-2">
                    <span className="text-[--color-foreground] font-medium text-xs">{`${chapterIndex}.2.2`}</span>
                    <span>
                      <strong>{t('market.competition.title')}:</strong> {br?.market?.competition?.risk}
                      <br />
                      <span className="text-[--color-foreground-muted]">{t('mitigation.title')}: {br?.market?.competition?.mitigation}</span>
                    </span>
                  </span>
                </li>
                <li>
                  <span className="flex items-start gap-2">
                    <span className="text-[--color-foreground] font-medium text-xs">{`${chapterIndex}.2.3`}</span>
                    <span>
                      <strong>{t('market.pricing.title')}:</strong> {br?.market?.pricing?.risk}
                      <br />
                      <span className="text-[--color-foreground-muted]">{t('mitigation.title')}: {br?.market?.pricing?.mitigation}</span>
                    </span>
                  </span>
                </li>
              </ul>
            </div>
          </SectionCard>
        </InViewFade>

        <InViewFade as="section" delay={0.08}>
          <SectionCard id="finance-risk">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${t('finance.title')}`}</h3>
            <div className="text-[13px] md:text-[14px] leading-relaxed">
              <ul className="list-none pl-0 space-y-1.5 text-[--color-foreground]">
                <li>
                  <span className="flex items-start gap-2">
                    <span className="text-[--color-foreground] font-medium text-xs">{`${chapterIndex}.3.1`}</span>
                    <span>
                      <strong>{t('finance.grants.title')}:</strong> {br?.finance?.grants?.risk}
                      <br />
                      <span className="text-[--color-foreground-muted]">{t('mitigation.title')}: {br?.finance?.grants?.mitigation}</span>
                    </span>
                  </span>
                </li>
                <li>
                  <span className="flex items-start gap-2">
                    <span className="text-[--color-foreground] font-medium text-xs">{`${chapterIndex}.3.2`}</span>
                    <span>
                      <strong>{t('finance.cashflow.title')}:</strong> {br?.finance?.cashflow?.risk}
                      <br />
                      <span className="text-[--color-foreground-muted]">{t('mitigation.title')}: {br?.finance?.cashflow?.mitigation}</span>
                    </span>
                  </span>
                </li>
              </ul>
            </div>
          </SectionCard>
        </InViewFade>

        <InViewFade as="section" delay={0.1}>
          <SectionCard id="regulatory">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${t('regulatory.title')}`}</h3>
            <div className="text-[13px] md:text-[14px] leading-relaxed">
              <ul className="list-none pl-0 space-y-1.5 text-[--color-foreground]">
                <li>
                  <span className="flex items-start gap-2">
                    <span className="text-[--color-foreground] font-medium text-xs">{`${chapterIndex}.4.1`}</span>
                    <span>
                      <strong>{t('regulatory.eu.title')}:</strong> {br?.regulatory?.eu?.risk}
                      <br />
                      <span className="text-[--color-foreground-muted]">{t('mitigation.title')}: {br?.regulatory?.eu?.mitigation}</span>
                    </span>
                  </span>
                </li>
                <li>
                  <span className="flex items-start gap-2">
                    <span className="text-[--color-foreground] font-medium text-xs">{`${chapterIndex}.4.2`}</span>
                    <span>
                      <strong>{t('regulatory.cert.title')}:</strong> {br?.regulatory?.cert?.risk}
                      <br />
                      <span className="text-[--color-foreground-muted]">{t('mitigation.title')}: {br?.regulatory?.cert?.mitigation}</span>
                    </span>
                  </span>
                </li>
              </ul>
            </div>
          </SectionCard>
        </InViewFade>

        <InViewFade as="section" delay={0.12}>
          <SectionCard id="operations">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${t('operations.title')}`}</h3>
            <div className="text-[13px] md:text-[14px] leading-relaxed">
              <ul className="list-none pl-0 space-y-1.5 text-[--color-foreground]">
                <li>
                  <span className="flex items-start gap-2">
                    <span className="text-[--color-foreground] font-medium text-xs">{`${chapterIndex}.5.1`}</span>
                    <span>
                      <strong>{t('operations.talent.title')}:</strong> {br?.operations?.talent?.risk}
                      <br />
                      <span className="text-[--color-foreground-muted]">{t('mitigation.title')}: {br?.operations?.talent?.mitigation}</span>
                    </span>
                  </span>
                </li>
                <li>
                  <span className="flex items-start gap-2">
                    <span className="text-[--color-foreground] font-medium text-xs">{`${chapterIndex}.5.2`}</span>
                    <span>
                      <strong>{t('operations.keyPeople.title')}:</strong> {br?.operations?.keyPeople?.risk}
                      <br />
                      <span className="text-[--color-foreground-muted]">{t('mitigation.title')}: {br?.operations?.keyPeople?.mitigation}</span>
                    </span>
                  </span>
                </li>
              </ul>
            </div>
          </SectionCard>
        </InViewFade>

        {/* Mitigation anchor */}
        <InViewFade as="section" delay={0.14}>
          <SectionCard id="mitigation">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – ${t('mitigation.title')}`}</h3>
            <div className="space-y-3">
              <div>
                <h3 className="text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">Technologie-Absicherung</h3>
                <ul className="list-none pl-0 space-y-1.5 text-[--color-foreground]">
                  {(((br?.mitigation?.tech as string[]) ?? []).map((x, i) => (
                    <li key={i}>{x}</li>
                  )))}
                </ul>
              </div>
              <div>
                <h3 className="text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">Markt- und Kundenfokus</h3>
                <ul className="list-none pl-0 space-y-1.5 text-[--color-foreground]">
                  {(((br?.mitigation?.market as string[]) ?? []).map((x, i) => (
                    <li key={i}>{x}</li>
                  )))}
                </ul>
              </div>
              <div>
                <h3 className="text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">Finanzielle Absicherung</h3>
                <ul className="list-none pl-0 space-y-1.5 text-[--color-foreground]">
                  {(((br?.mitigation?.finance as string[]) ?? []).map((x, i) => (
                    <li key={i}>{x}</li>
                  )))}
                </ul>
              </div>
              <div>
                <h3 className="text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">Rechtliche & regulatorische Absicherung</h3>
                <ul className="list-none pl-0 space-y-1.5 text-[--color-foreground]">
                  {(((br?.mitigation?.legal as string[]) ?? []).map((x, i) => (
                    <li key={i}>{x}</li>
                  )))}
                </ul>
              </div>
            </div>
          </SectionCard>
        </InViewFade>

        {/* Hidden anchor for contingency planning (FFG) */}
        <span id="ffg-contingency" className="sr-only" aria-hidden="true" />

        <InViewFade as="section" delay={0.16}>
          <SectionCard id="chances">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – Chancen durch aktives Risikomanagement`}</h3>
            <ul className="list-none pl-0 space-y-1.5 text-[--color-foreground]">
              {(((br?.benefits as string[]) ?? []).map((x, i) => (
                <li key={i}>
                  <span className="flex items-start gap-2">
                    <span className="text-[--color-foreground] font-medium text-xs">{`${chapterIndex}.7.${i + 1}`}</span>
                    <span>{x}</span>
                  </span>
                </li>
              )))}
            </ul>
          </SectionCard>
        </InViewFade>
      </div>

      {/* Checklist entfernt gemäß Vorgabe */}
    </div>
  );
}
