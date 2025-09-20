// Cards werden über SectionCard kapsuliert
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { getMessages } from '@/i18n/messages';
import { chapters } from '../chapters.config';
import { buildLocalePath } from '@/i18n/path';
import InViewFade from '@/components/animation/InViewFade';
import ElegantCard from '@/components/ui/ElegantCard';
import MiniBar from '@/components/charts/MiniBar';
import MiniDonut from '@/components/charts/MiniDonut';
import MiniSparkline from '@/components/charts/MiniSparkline';
import { KPI_ANIM_DURATION, KPI_BAR_HEIGHT, KPI_SPARK_HEIGHT, KPI_DONUT_CLASS, getKpiDelay } from '@/components/charts/kpiAnimation';
import SectionCard from '@components/chapters/SectionCard';
import BadgeList from '@components/chapters/shared/BadgeList';
import { getChapterTheme } from '@/app/chapters/chapterTheme';
import { TrendingUp, CreditCard, CircleDollarSign, Percent } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const index = Math.max(0, chapters.findIndex((c) => c.slug === 'business-model')) + 1;
  return {
    robots: { index: false, follow: true },
    alternates: { canonical: buildLocalePath(locale, `/chapters/${index}`) },
  };
}

export default async function BusinessModelPage() {
  const tBp = await getTranslations('bp');
  const tFin = await getTranslations('finance');
  const locale = await getLocale();
  const chapterIndex = Math.max(0, chapters.findIndex((c) => c.slug === 'business-model')) + 1;
  const chapterTitle = `${locale.startsWith('de') ? 'Kapitel' : 'Chapter'} ${chapterIndex} – ${tBp('sections.businessModel', { defaultMessage: 'Business Model' })}`;
  const theme = getChapterTheme('business-model');

  // Checklist entfernt

  // Inhalte aus TS-i18n (defensiv)
  const { bp } = await getMessages(locale.startsWith('de') ? 'de' : 'en');
  const bpAny = bp as any;
  // Primär aus bp.content.businessModel lesen, fallback auf legacy bp.businessModel
  const bm = (bpAny?.content?.businessModel as any) ?? (bpAny?.businessModel as any) ?? {};
  const market = (bpAny?.market as any) ?? {};
  const valueProp = (bm?.valueProp as string[] | undefined)
    ?? (bm?.description as string[] | undefined)
    ?? [];
  const pricing = (bm?.pricing as string[] | undefined) ?? [];
  // revenueStreams kann in manchen Locale-Dateien als Array von Objekten (type/description) vorliegen → defensiv in Strings umwandeln
  const streamsRaw = (bm?.revenueStreams as unknown) ?? (bm?.streams as unknown) ?? [];
  const streams: string[] = Array.isArray(streamsRaw)
    ? streamsRaw.map((it: any) =>
        typeof it === 'string'
          ? it
          : it && typeof it === 'object' && 'type' in it && 'description' in it
            ? `${String(it.type)}: ${String(it.description)}`
            : String(it)
      )
    : [];
  const unitEconomics = (bm?.unitEconomics as string[] | undefined) ?? [];
  const sales = (bm?.salesChannels as string[] | undefined) ?? [];
  const partnerships = (bm?.partnerships as string[] | undefined)
    ?? (market?.partners as string[] | undefined)
    ?? [];
  const pricingTiers = (bm?.pricingTiers as string[] | undefined) ?? [];
  const revenueStreamsDetailed = (bm?.revenueStreamsDetailed as Array<{ type: string; description: string }> | undefined) ?? [];
  const pricingModel = (bm?.pricingModel as Array<{ model: string; description: string }> | undefined) ?? [];
  const scaling = (bm?.scaling as string[] | undefined) ?? [];

  // Einheitliche Unterkapitel-Nummerierung (wie team/risks)
  let subCounter = 0;
  const sub = () => `${chapterIndex}.${++subCounter}`;

  // Fallback-Listen (zeigen sinnvolle Standardtexte, wenn i18n-Inhalte fehlen)
  const de = locale.startsWith('de');

  // KPI-Kacheln (Beispiele mit defensiven Fallbacks)
  const kpiCards = (() => {
    const de = locale.startsWith('de');
    return [
      {
        label: de ? 'ARPU' : 'ARPU',
        value: bm?.kpi?.arpu ?? (de ? '€3.0k–€4.0k / Roboter / Monat' : '€3.0k–€4.0k / robot / month'),
        sub: de ? 'ø pro Roboter / Monat (RaaS)' : 'avg per robot / month (RaaS)',
        Icon: TrendingUp
      },
      {
        label: de ? 'CAC' : 'CAC',
        value: bm?.kpi?.cac ?? (de ? '€4k–€8k' : '€4k–€8k'),
        sub: de ? 'Customer Acquisition Cost' : 'Customer Acquisition Cost',
        Icon: CreditCard
      },
      {
        label: 'LTV',
        value: bm?.kpi?.ltv ?? (de ? '€40k–€60k' : '€40k–€60k'),
        sub: de ? 'Lebenszeitwert' : 'Lifetime value',
        Icon: CircleDollarSign
      },
      {
        label: de ? 'Bruttomarge' : 'Gross Margin',
        value: bm?.kpi?.grossMargin ?? '62–68%',
        sub: de ? 'indikativ' : 'indicative',
        Icon: Percent
      }
    ] as const;
  })();

  return (
    <div className="space-y-8">
      <div className="prose prose-sm max-w-none [font-feature-settings:'ss01','ss02','liga','clig','tnum']">
        <h1 className="section-title font-semibold tracking-tight leading-tight text-[--color-foreground-strong]">
          {chapterTitle}
        </h1>
        {/* Inhaltsverzeichnis entfernt */}

        {/* KPI-Stat-Karten (Business Model) – edel & zentriert */}
        <h2 id="kpi-heading" className="sr-only">{de ? 'Wichtigste Kennzahlen' : 'Key performance indicators'}</h2>
        <div
          className="not-prose mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch justify-items-stretch"
          role="region"
          aria-labelledby="kpi-heading"
        >
          {kpiCards.map((s, idx) => (
            <InViewFade key={`${String(s.label)}-${idx}`} delay={idx * 0.05} className="h-full">
              <ElegantCard
                className="h-full"
                innerClassName="relative h-full rounded-[12px] bg-[--color-surface] p-4 md:p-5 lg:p-6"
                ariaLabel={`${s.label} KPI Card`}
                role="group"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-[10px] md:text-[11px] tracking-wide uppercase mb-2 text-[--color-foreground-muted]">
                    {('Icon' in s && s.Icon) ? <s.Icon className="h-3.5 w-3.5 text-[--color-foreground-muted]" aria-hidden /> : null}
                    <span>{s.label}</span>
                  </div>
                  {/* Mini‑Visuals */}
                  <div className="mb-3.5 kpi-visual">
                    {s.label === 'CAC' ? (
                      <MiniBar
                        data={[24, 36, 42, 51, 58]}
                        color={theme.warning}
                        bg={theme.warning ? `${theme.warning}15` : 'rgba(245,158,11,0.08)'}
                        delay={getKpiDelay(idx)}
                        duration={KPI_ANIM_DURATION}
                        className="w-full"
                        height={KPI_BAR_HEIGHT}
                      />
                    ) : s.label === 'ARPU' || s.label === 'LTV' ? (
                      <MiniSparkline
                        data={s.label === 'ARPU' ? [40, 46, 49, 51, 55] : [180, 240, 300, 420, 560]}
                        height={KPI_SPARK_HEIGHT}
                        delay={getKpiDelay(idx)}
                        duration={KPI_ANIM_DURATION}
                        className="w-full"
                        colorStart={s.label === 'ARPU' ? theme.success : theme.warning}
                        colorEnd={s.label === 'ARPU' ? theme.success : theme.primary}
                        showArea={false}
                        showDot
                      />
                    ) : (
                      <MiniDonut
                        value={0.7}
                        color={theme.primary}
                        bg={theme.primary ? `${theme.primary}20` : 'rgba(59,130,246,0.1)'}
                        delay={getKpiDelay(idx)}
                        duration={KPI_ANIM_DURATION}
                        className={KPI_DONUT_CLASS}
                      />
                    )}
                  </div>
                  {/* Wert und Subtitel im edlen CV-Stil */}
                  <div className="kpi-value-row [font-feature-settings:'tnum'] [font-variant-numeric:tabular-nums]">
                    <span className="whitespace-normal break-words" title={String(s.value)}>{String(s.value)}</span>
                  </div>
                  <div className="mx-auto mt-2 h-px w-8/12 bg-[--color-border-subtle]/25" aria-hidden />
                  <div className="mt-1.5 text-[12px] md:text-[12.5px] text-[--color-foreground] opacity-85" title={s.sub as string}>
                    {s.sub as string}
                  </div>
                </div>
              </ElegantCard>
            </InViewFade>
          ))}
        </div>

        {/* Value Proposition */}
        <InViewFade as="section" delay={0.02}>
          <SectionCard title={`${sub()} – ${tBp('headings.valueProp', { defaultMessage: 'Value Proposition' })}`} className="border-0">
            {/* Badges sollen oberhalb des Textes erscheinen */}
            {(valueProp?.length ?? 0) > 0 ? (
              <>
                <BadgeList items={valueProp} variant="badge" />
                {/* kurzer Einleitungstext aus Beschreibung */}
                {Array.isArray((bm as any)?.description) && (bm as any).description.length > 0 ? (
                  <p className="text-[13px] md:text-[14px] text-[--color-foreground] mt-2">{(bm as any).description[0]}</p>
                ) : null}
                {/* Fließtext-Erklärung */}
                <p className="text-[13px] md:text-[14px] text-[--color-foreground] mt-2">
                  {de
                    ? 'Unser Wertversprechen kombiniert wiederkehrende Erlösmechaniken mit einer skalierbaren Plattform. Die folgenden Kernpunkte fassen die Vorteile prägnant zusammen:'
                    : 'Our value proposition combines recurring revenue mechanics with a scalable platform. The following highlights summarize the advantages:'}
                </p>
              </>
            ) : (
              <p className="text-[13px] text-[--color-foreground-muted] italic">{de ? 'Wird befüllt.' : 'To be filled.'}</p>
            )}
          </SectionCard>
        </InViewFade>

          {/* Pricing */}
          <InViewFade as="section" delay={0.04}>
            <SectionCard title={`${sub()} – ${tBp('headings.pricing', { defaultMessage: 'Pricing' })}`} id="businessModel-pricing" className="border-0">
              {Array.isArray((bm as any)?.pricingModel) && (bm as any).pricingModel.length > 0 ? (
                <p className="text-[13px] md:text-[14px] text-[--color-foreground] mb-3">{(bm as any).pricingModel[0].description}</p>
              ) : null}
              {(pricing?.length ?? 0) > 0 ? (
                <>
                  <p className="text-[13px] md:text-[14px] text-[--color-foreground] mb-3">
                    {de
                      ? 'Das Preismodell folgt einem klaren Tiering mit optionalen Add-ons und Services. Die Struktur bietet Transparenz für KMU und Enterprise-Kunden:'
                      : 'The pricing model follows a clear tiering with optional add-ons and services, ensuring transparency for SMB and enterprise customers:'}
                  </p>
                  <BadgeList items={pricing} variant="card" />
                </>
              ) : (
                <p className="text-[13px] text-[--color-foreground-muted] italic">{de ? 'Wird befüllt.' : 'To be filled.'}</p>
              )}
            </SectionCard>
          </InViewFade>

          {/* Revenue Streams */}
          <InViewFade as="section" delay={0.06}>
            <SectionCard title={`${sub()} – ${tBp('headings.revenueStreams', { defaultMessage: 'Revenue Streams' })}`} id="businessModel-streams" className="border-0">
              {Array.isArray((bm as any)?.revenueStreamsDetailed) && (bm as any).revenueStreamsDetailed.length > 0 ? (
                <p className="text-[13px] md:text-[14px] text-[--color-foreground] mb-2">{(bm as any).revenueStreamsDetailed[0].description}</p>
              ) : null}
              {(streams?.length ?? 0) > 0 ? (
                <>
                  <p className="text-[13px] md:text-[14px] text-[--color-foreground] mb-3">
                    {de
                      ? 'Die Umsatzkanäle sind diversifiziert, um Planbarkeit und Upside zu verbinden. Die folgenden Streams bilden das Fundament:'
                      : 'Revenue streams are diversified to balance predictability and upside. The following streams form the foundation:'}
                  </p>
                  <BadgeList
                  items={streams}
                  variant="bullets"
                  separators
                  color={"var(--color-border-subtle)"}
                  numbered
                  prefix={`${chapterIndex}.3`}
                />
                </>
              ) : (
                <p className="text-[13px] text-[--color-foreground-muted] italic">{de ? 'Wird befüllt.' : 'To be filled.'}</p>
              )}
            </SectionCard>
          </InViewFade>

          {/* Unit Economics */}
          <InViewFade as="section" delay={0.08}>
            <SectionCard title={`${sub()} – ${tBp('headings.unitEconomics', { defaultMessage: 'Unit Economics' })}`} id="businessModel-unitEconomics" className="border-0">
            {(unitEconomics?.length ?? 0) > 0 ? (
              <>
                <p className="text-[13px] md:text-[14px] text-[--color-foreground] mb-3">
                  {de
                    ? 'Die Unit Economics basieren auf wiederkehrenden Deckungsbeiträgen pro Roboter/Account. Kernparameter im Überblick:'
                    : 'Unit economics focus on recurring contribution margins per robot/account. Core parameters at a glance:'}
                </p>
                <BadgeList items={unitEconomics} variant="card" />
                {/* Annahmen aus Finance (gemeinsame RaaS-Story) */}
                {(() => {
                  try {
                    const raw = tFin.raw('assumptions') as unknown;
                    const list = Array.isArray(raw) ? (raw as string[]) : [];
                    if (list.length === 0) return null;
                    return (
                      <div className="mt-4 not-prose">
                        <div className="mx-auto max-w-3xl rounded-xl bg-[--color-surface]/70 ring-0 p-3 md:p-4">
                          <div className="text-[12px] md:text-[13px] font-medium mb-1.5 text-[--color-foreground]">
                            {de ? 'Annahmen (RaaS & App‑Store)' : 'Assumptions (RaaS & App Store)'}
                          </div>
                          <ul className="list-none pl-0 space-y-1 text-[11.5px] md:text-[13px] text-[--color-foreground]">
                            {list.map((a, i) => (<li key={i}>{a}</li>))}
                          </ul>
                        </div>
                      </div>
                    );
                  } catch { return null; }
                })()}
              </>
            ) : (
              <p className="text-[13px] text-[--color-foreground-muted] italic">{de ? 'Wird befüllt.' : 'To be filled.'}</p>
            )}
          </SectionCard>
          </InViewFade>

          {/* Sales Channels */}
          <InViewFade as="section" delay={0.1}>
            <SectionCard title={`${sub()} – ${tBp('headings.salesChannels', { defaultMessage: 'Sales Channels' })}`} id="businessModel-salesChannels" className="border-0">
              {(sales?.length ?? 0) > 0 ? (
                <>
                  <p className="text-[13px] md:text-[14px] text-[--color-foreground] mb-3">
                    {de
                      ? 'Unser Vertrieb kombiniert direkte Akquise mit Partner-basiertem Rollout, um Time-to-Value zu verkürzen:'
                      : 'Sales combines direct acquisition with partner-driven rollout to shorten time-to-value:'}
                  </p>
                  <BadgeList
                    items={sales}
                    variant="bullets"
                    separators
                    color={"var(--color-border-subtle)"}
                    numbered
                    prefix={`${chapterIndex}.5`}
                  />
                </>
              ) : (
                <p className="text-[13px] text-[--color-foreground-muted] italic">{de ? 'Wird befüllt.' : 'To be filled.'}</p>
              )}
            </SectionCard>
          </InViewFade>

          {/* Partnerships */}
          <InViewFade as="section" delay={0.12}>
            <SectionCard title={`${sub()} – ${tBp('headings.partnerships', { defaultMessage: 'Partnerships' })}`} id="businessModel-partnerships" className="border-0">
              {(partnerships?.length ?? 0) > 0 ? (
                <>
                  <p className="text-[13px] md:text-[14px] text-[--color-foreground] mb-3">
                    {de
                      ? 'Schlüsselpartnerschaften mit OEMs, Integratoren und Entwicklern verstärken den Plattform-Effekt:'
                      : 'Key partnerships with OEMs, integrators and developers reinforce the platform effect:'}
                  </p>
                  <BadgeList
                    items={partnerships}
                    variant="bullets"
                    separators
                    color={"var(--color-border-subtle)"}
                    numbered
                    prefix={`${chapterIndex}.6`}
                  />
                </>
              ) : (
                <p className="text-[13px] text-[--color-foreground-muted] italic">{de ? 'Wird befüllt.' : 'To be filled.'}</p>
              )}
            </SectionCard>
          </InViewFade>

          {/* Pricing Tiers */}
          {pricingTiers.length > 0 && (
            <InViewFade as="section" delay={0.14}>
              <SectionCard title={`${sub()} – ${tBp('headings.pricing', { defaultMessage: 'Pricing' })}`} id="businessModel-pricingTiers" className="border-0">
                <BadgeList items={pricingTiers} variant="card" />
              </SectionCard>
            </InViewFade>
          )}

          {/* Revenue Streams – Detailed */}
          {revenueStreamsDetailed.length > 0 && (
            <InViewFade as="section" delay={0.16}>
              <SectionCard title={`${sub()} – ${tBp('headings.revenueStreams', { defaultMessage: 'Revenue Streams' })}`} id="businessModel-revenueStreamsDetailed" className="border-0">
                <div className="overflow-x-auto">
                  <table className="min-w-[520px] text-[13px] md:text-[14px] w-full border-separate border-spacing-y-1">
                    <caption className="sr-only">{de ? 'Detailansicht der Umsatzströme' : 'Detailed view of revenue streams'}</caption>
                    <thead>
                      <tr>
                        <th scope="col" className="text-left pr-4">Type</th>
                        <th scope="col" className="text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueStreamsDetailed.map((row, i) => (
                        <tr key={i} className="align-top">
                          <td className="pr-4 align-top whitespace-nowrap">{row.type}</td>
                          <td className="align-top">{row.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </InViewFade>
          )}

          {/* Pricing Model – Details */}
          {pricingModel.length > 0 && (
            <InViewFade as="section" delay={0.18}>
              <SectionCard title={`${sub()} – ${tBp('headings.pricing', { defaultMessage: 'Pricing' })}`} id="businessModel-pricingModel" className="border-0">
                <div className="overflow-x-auto">
                  <table className="min-w-[520px] text-[13px] md:text-[14px] w-full border-separate border-spacing-y-1">
                    <caption className="sr-only">{de ? 'Detailansicht der Preismodelle' : 'Detailed view of pricing models'}</caption>
                    <thead>
                      <tr>
                        <th scope="col" className="text-left pr-4">Model</th>
                        <th scope="col" className="text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricingModel.map((row, i) => (
                        <tr key={i} className="align-top">
                          <td className="pr-4 align-top whitespace-nowrap">{row.model}</td>
                          <td className="align-top">{row.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </InViewFade>
          )}

          {/* Scaling Pfad */}
          {scaling.length > 0 && (
            <InViewFade as="section" delay={0.2}>
              <SectionCard title={`${sub()} – Scaling`} id="businessModel-scaling" className="border-0">
                <BadgeList items={scaling} variant="badge" />
              </SectionCard>
            </InViewFade>
          )}

          {/* Cost Structure */}
          {Array.isArray((bm as any)?.costStructure) && (bm as any)?.costStructure?.length > 0 && (
            <InViewFade as="section" delay={0.22}>
              <SectionCard title={`${sub()} – Cost Structure`} id="businessModel-costStructure" className="border-0">
                <p className="text-[13px] md:text-[14px] text-[--color-foreground] mb-3">
                  {de
                    ? 'Unsere Kostenstruktur fokussiert sich auf F&E und Cloud‑Betrieb; GTM‑Aufwände werden phasenweise skaliert. Die Kategorien im Überblick:'
                    : 'Our cost structure focuses on R&D and cloud operations; GTM efforts scale by phase. Categories at a glance:'}
                </p>
                <BadgeList
                  items={((bm as any).costStructure as { category: string; items: string[] }[]).map((row) => `${row.category}: ${row.items.join(', ')}`)}
                  variant="card"
                  color={theme.primary}
                />
              </SectionCard>
            </InViewFade>
          )}

          {/* Key Metrics (detailed) */}
          {Array.isArray((bm as any)?.keyMetrics) && (bm as any)?.keyMetrics?.length > 0 && (
            <InViewFade as="section" delay={0.24}>
              <SectionCard title={`${sub()} – ${tBp('headings.kpis', { defaultMessage: 'KPIs' })}`} id="businessModel-keyMetrics" className="border-0">
                <p className="text-[13px] md:text-[14px] text-[--color-foreground] mb-3">
                  {de
                    ? 'Die operativen KPIs bilden Verlässlichkeit, Performance und Adoption ab. Zielbandbreiten sind indikativ und werden quartalsweise verfeinert:'
                    : 'Operational KPIs capture reliability, performance and adoption. Target ranges are indicative and refined quarterly:'}
                </p>
                <BadgeList
                  items={((bm as any).keyMetrics as { metric: string; target: string }[]).map((x) => `${x.metric}: ${x.target}`)}
                  variant="badge"
                  color={theme.success}
                />
              </SectionCard>
            </InViewFade>
          )}

          {/* Competitive Advantage */}
          {Array.isArray((bm as any)?.competitiveAdvantage) && (bm as any)?.competitiveAdvantage?.length > 0 && (
            <InViewFade as="section" delay={0.26}>
              <SectionCard title={`${sub()} – Competitive Advantage`} id="businessModel-competitiveAdvantage" className="border-0">
                <p className="text-[13px] md:text-[14px] text-[--color-foreground] mb-3">
                  {de
                    ? 'Unser Vorsprung entsteht aus Plattform‑Effekten, Developer‑Ökosystem und auditierbarer Ausführung. Die Hebel in Kürze:'
                    : 'Our edge stems from platform effects, developer ecosystem and auditable execution. The levers in brief:'}
                </p>
                <BadgeList items={((bm as any).competitiveAdvantage as string[])} variant="card" color={theme.accent1} />
              </SectionCard>
            </InViewFade>
          )}

          {/* GTM Points */}
          {Array.isArray((bm as any)?.gtmPoints) && (bm as any)?.gtmPoints?.length > 0 && (
            <InViewFade as="section" delay={0.28}>
              <SectionCard title={`${sub()} – Go-to-Market Highlights`} id="businessModel-gtmPoints" className="border-0">
                <p className="text-[13px] md:text-[14px] text-[--color-foreground] mb-3">
                  {de
                    ? 'Go‑to‑Market priorisiert schnelle Validierung mit Design‑Partnern, gefolgt von Skalierung über Partner‑Netzwerke:'
                    : 'Go‑to‑Market prioritizes fast validation with design partners, followed by scaling via partner networks:'}
                </p>
                <BadgeList items={((bm as any).gtmPoints as string[])} variant="badge" color={theme.warning} />
              </SectionCard>
            </InViewFade>
          )}

          {/* Grant Fit Points */}
          {Array.isArray((bm as any)?.grantFitPoints) && (bm as any)?.grantFitPoints?.length > 0 && (
            <InViewFade as="section" delay={0.3}>
              <SectionCard title={`${sub()} – Grant Fit`} id="businessModel-grantFitPoints" className="border-0">
                <p className="text-[13px] md:text-[14px] text-[--color-foreground] mb-3">
                  {de
                    ? 'Die Inhalte sind mit europäischen Förderlogiken (aws/FFG/EU) kompatibel: DeepTech, Sicherheit, Nachhaltigkeit:'
                    : 'The content aligns with European grant logic (aws/FFG/EU): deep tech, safety and sustainability:'}
                </p>
                <BadgeList items={((bm as any).grantFitPoints as string[])} variant="badge" color={theme.accent2} />
              </SectionCard>
            </InViewFade>
          )}

          {/* Moat Points */}
          {Array.isArray((bm as any)?.moatPoints) && (bm as any)?.moatPoints?.length > 0 && (
            <InViewFade as="section" delay={0.32}>
              <SectionCard title={`${sub()} – Moat`} id="businessModel-moatPoints" className="border-0">
                <p className="text-[13px] md:text-[14px] text-[--color-foreground] mb-3">
                  {de
                    ? 'Der Schutzgraben entsteht über Netzwerkeffekte, Telemetry‑Daten und proprietäre Safety‑/Policy‑Komponenten:'
                    : 'The moat builds through network effects, telemetry data and proprietary safety/policy components:'}
                </p>
                <BadgeList items={((bm as any).moatPoints as string[])} variant="card" color={theme.neutral} />
              </SectionCard>
            </InViewFade>
          )}
        </div>
      </div>
  );
}
