// PDF-like layout: no animated reveal
import ElegantCard from '@/components/ui/ElegantCard';
import MiniBar from '@/components/charts/MiniBar';
import MiniDonut from '@/components/charts/MiniDonut';
import MiniSparkline from '@/components/charts/MiniSparkline';
import { KPI_ANIM_DURATION, KPI_BAR_HEIGHT, KPI_SPARK_HEIGHT, KPI_DONUT_CLASS, getKpiDelay } from '@/components/charts/kpiAnimation';
import type { Metadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';
import { getMessages } from '@/i18n/messages';
import { chapters } from '../chapters.config';
import { buildLocalePath } from '@/i18n/path';
import InViewFade from '@/components/animation/InViewFade';
import SectionDelay from '@/components/animation/SectionDelay';
import SectionCard from '@components/chapters/SectionCard';
import TableSimple from '@/components/ui/TableSimple';
import BarChartAnimated from '@/components/charts/BarChartAnimated';
import { TrendingUp, PieChart, BarChart3, Globe2, Plus, Minus, ArrowUpRight, AlertCircle, ExternalLink } from 'lucide-react';
import DonutChartAnimated from '@/components/charts/DonutChartAnimated';
import SplitSection from '@components/chapters/shared/SplitSection';
import { getChapterTheme } from '@/app/chapters/chapterTheme';
import { NumberedList, NumberedItem } from '@components/chapters/NumberedList';
 
 

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  // Determine this chapter's index dynamically from config
  const index = Math.max(0, chapters.findIndex((c) => c.slug === 'market')) + 1;
  return {
    robots: { index: false, follow: true },
    alternates: { canonical: buildLocalePath(locale, `/chapters/${index}`) },
  };
}

export default async function MarketAnalysisPage() {
  const tBp = await getTranslations('bp');
  const locale = await getLocale();
  const { bp } = await getMessages(locale.startsWith('de') ? 'de' : 'en');
  const bpAny = bp as any;
  const theme = getChapterTheme('market');
  const palette = [theme.primary, theme.success, theme.warning, theme.accent1, theme.accent2, theme.neutral].filter(Boolean);
  const chapterIndex = Math.max(0, chapters.findIndex((c) => c.slug === 'market')) + 1;
  const chapterTitle = `${locale.startsWith('de') ? 'Kapitel' : 'Chapter'} ${chapterIndex} – ${tBp('sections.market')}`;

  // Checklist entfernt

  // Marktsegmente (content.market.segments)
  // Robustheit: akzeptiere nur valide Strukturen {label, share:number}; alles andere => Fallback (Defaultliste)
  const rawSegments = (bpAny?.market?.segments as any[] | undefined) ?? [];
  const segments = Array.isArray(rawSegments)
    ? rawSegments
        .map((s) => {
          // Normalisierung: unterschiedliche Feldnamen abfedern (z. B. name -> label, growth/size werden ignoriert)
          const label = typeof s?.label === 'string' ? s.label : (typeof s?.name === 'string' ? s.name : undefined);
          const share = typeof s?.share === 'number' && isFinite(s.share) ? s.share : undefined;
          return label && typeof label === 'string' && share !== undefined ? { label, share } : null;
        })
        .filter(Boolean) as Array<{ label: string; share: number }>
    : [];

  // PESTEL-Übersichtspunkte (content.marketCompetitive.overview)
  const pestel = (bpAny?.marketCompetitive?.overview as string[] | undefined) ?? [];

  // Detaillierte Marktübersicht (content.market.details)
  const marketDetails = (bpAny?.market?.details as string[] | undefined) ?? [];

  // Wettbewerber-Listen
  const hardwarePlayers = (bpAny?.marketCompetitive?.hardware as string[] | undefined) ?? [];
  const softwarePlayers = (bpAny?.marketCompetitive?.software as string[] | undefined) ?? [];
  const overviewSources = Array.isArray(bpAny?.marketCompetitive?.overviewSources)
    ? (bpAny.marketCompetitive.overviewSources as string[])
    : [];

  // Differenzierungsmerkmale
  const diffPoints = (bpAny?.marketCompetitive?.differentiation as string[] | undefined) ?? [];

  // SWOT-Listen
  const swotStrengths = (bpAny?.swot?.strengths as string[] | undefined) ?? [];
  const swotWeaknesses = (bpAny?.swot?.weaknesses as string[] | undefined) ?? [];
  const swotOpportunities = (bpAny?.swot?.opportunities as string[] | undefined) ?? [];
  const swotThreats = (bpAny?.swot?.threats as string[] | undefined) ?? [];

  // Go-to-Market Phase 1
  const gtmPhase1 = (bpAny?.gtm?.phase1 as string[] | undefined) ?? [];

  // TAM/SAM/SOM: duale Darstellung (service/humanoid), Fallback auf Legacy-Strings
  const tam = bpAny?.market?.tam as string | undefined;
  const sam = bpAny?.market?.sam as string | undefined;
  const som = bpAny?.market?.som as string | undefined;
  const marketSize = (bpAny?.market?.size as any) ?? {};
  const sizeHumanoid = (marketSize?.humanoid as any) ?? null;
  const sizeService = (marketSize?.service as any) ?? null;

  // KPI-Karten werden nach Berechnung der Volume-/EU-Werte definiert

  // Einheitliche Unterkapitel-Nummerierung (wie team/risks)
  let subCounter = 0;
  const sub = () => `${chapterIndex}.${++subCounter}`;


  // Dual-Track Marktdaten (aus i18n bp.market.volume)
  const marketVolume = (bpAny?.market?.volume as any) ?? {};
  const humanoidVol = (marketVolume?.humanoid as any) ?? {};
  const serviceVol = (marketVolume?.service as any) ?? {};
  const drivers = typeof marketVolume?.drivers === 'string' ? (marketVolume.drivers as string) : undefined;
  const sources: string[] = Array.isArray(marketVolume?.sources) ? (marketVolume.sources as string[]) : [];
  const euShareStr = typeof marketVolume?.eu === 'string' ? (marketVolume.eu as string) : '';
  const euPct = (() => {
    const m = euShareStr?.match?.(/([0-9]+(?:[.,][0-9]+)?)\s*%/);
    return m ? Math.max(0, Math.min(100, parseFloat(m[1].replace(',', '.')))) : NaN;
  })();
  // Quellen-Pointer für Service/Humanoid für später angezeigte Badges
  const srcService = sources.find((s) => s.toLowerCase().includes('service robotics')) || sources[0];
  const srcHumanoid = sources.find((s) => s.toLowerCase().includes('humanoid')) || sources[1] || sources[0];

  // KPI-Karten (Market-spezifisch): Service‑Markt, CAGR Service, Humanoiden‑Markt, EU‑Anteil
  const kpiCards = (() => {
    const de = locale.startsWith('de');
    // Texte aus volume bevorzugen, mit Fallbacks auf bp.tBp keys
    const svcGlobal = typeof serviceVol?.global === 'string' && serviceVol.global.trim()
      ? (serviceVol.global as string)
      : (tBp('market.volume.global') as string);
    const svcCagr = typeof serviceVol?.cagr === 'string' && serviceVol.cagr.trim()
      ? `CAGR (Service): ${serviceVol.cagr}`
      : (tBp('market.volume.cagr') as string);
    const humGlobal = typeof humanoidVol?.global === 'string' && String(humanoidVol.global).trim()
      ? (humanoidVol.global as string)
      : (de ? 'Humanoide: –' : 'Humanoids: –');
    const euShare = euShareStr && euShareStr.trim() ? euShareStr : (de ? 'EU‑Anteil: –' : 'EU share: –');

    return [
      { label: de ? 'Service‑Markt (global)' : 'Service market (global)', value: svcGlobal, sub: de ? 'Quellen siehe unten' : 'see sources below' },
      { label: 'CAGR (Service)', value: svcCagr.replace(/^CAGR \(Service\):\s*/i, (de ? '' : '')), sub: de ? '2024–2029 (indikativ)' : '2024–2029 (indicative)' },
      { label: de ? 'Humanoiden‑Markt (global)' : 'Humanoids market (global)', value: humGlobal, sub: de ? 'falls verfügbar' : 'if available' },
      { label: de ? 'EU‑Anteil' : 'EU share', value: euShare.replace(/^(EU\s*[-‑]?(Anteil|share):\s*)/i, ''), sub: de ? 'EU in %' : 'EU in %' },
    ] as const;
  })();

  // Parser: Marktgrößen-Strings ("~99 Mrd. USD", "~15B", "30 Mio") -> Zahl in Milliarden (number)
  const parseToBillion = (input?: string | null): number | null => {
    if (!input || typeof input !== 'string') return null;
    const s = input.replace(/\s+/g, ' ').trim();
    const numMatch = s.match(/(~?\s*)?([0-9]+(?:[.,][0-9]+)?)/);
    if (!numMatch) return null;
    const raw = numMatch[2].replace(',', '.');
    const n = parseFloat(raw);
    if (!isFinite(n)) return null;
    // Einheit erkennen
    const lower = s.toLowerCase();
    const isBillion = /(mrd\.|mrd|billion|bn|b\b)/.test(lower);
    const isMillion = /(mio\.|mio|million|mn|m\b)/.test(lower);
    if (isBillion) return n;
    if (isMillion) return n / 1000;
    // Kein Hinweis: heuristisch > 1000 => vermutlich Mio, sonst Mrd-Annahme unsicher; konservativ als Mrd behandeln
    return n; // Annahme Milliarden, da Quellen typischerweise B/Mrd für diese Werte nutzen
  };

  const sizeServiceNumbers = {
    tam: parseToBillion(sizeService?.tam ?? null),
    sam: parseToBillion(sizeService?.sam ?? null),
    som: parseToBillion(sizeService?.som ?? null),
  } as const;
  const sizeHumanoidNumbers = {
    tam: parseToBillion(sizeHumanoid?.tam ?? null),
    sam: parseToBillion(sizeHumanoid?.sam ?? null),
    som: parseToBillion(sizeHumanoid?.som ?? null),
  } as const;

  // Format in Milliarden, 1 Dezimal, lokalisierte Einheit
  const unitSuffix = locale.startsWith('de') ? ' Mrd.' : 'B';
  const chartSuffix = locale.startsWith('de') ? 'Mrd.' : 'B';
  const fmtB = (v: number | null | undefined) => {
    if (v === null || v === undefined || !isFinite(v)) return '–';
    const n = Math.round(v * 10) / 10; // 1 Dezimal
    return `${n.toLocaleString(locale.startsWith('de') ? 'de-DE' : 'en-US')} ${unitSuffix}`;
  };

  // Verhältnis-Badges wurden entfernt (kein Prozentvergleich in UI)

  // Quellen/Metadaten für kompakte Badges
  const hasMnM = Array.isArray(sources) && sources.some((s) => s.toLowerCase().includes('marketsandmarkets'));
  const srcShort = hasMnM ? 'M&M' : '';
  const extractYear = (s?: string | null) => {
    if (!s) return null;
    const m = s.match(/\b(20\d{2})\b/);
    return m ? m[1] : null;
  };
  // Datenstand für Badge (lokalisiert)
  const dataAsOf = locale.startsWith('de') ? 'Stand: 13.09.2025' : 'As of: 2025-09-13';

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="prose prose-sm max-w-none [font-feature-settings:'ss01','ss02','liga','clig','tnum']">
        <h1 className="section-title font-semibold tracking-tight leading-tight text-[--color-foreground-strong]">{chapterTitle}</h1>

        {/* KPI-Stat-Karten (Market) – 1:1 Optik wie Kapitel 2 */}
        <SectionDelay delayMs={0}>
          <div className="not-prose mt-6 md:mt-8 grid gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {kpiCards.map((s, idx) => (
              <InViewFade key={`${String(s.label)}-${idx}`} delay={idx * 0.05} className="h-full">
                <ElegantCard
                  className="h-full"
                  innerClassName="relative h-full min-h-[156px] rounded-[12px] bg-[--color-surface] p-4 md:p-5 lg:p-6"
                  ariaLabel={`${s.label} KPI Card`}
                  role="group"
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-[10px] md:text-[11px] tracking-wide uppercase mb-2 text-[--color-foreground-muted]">
                      {(() => {
                        const Icon = idx === 0 ? TrendingUp : idx === 1 ? BarChart3 : idx === 2 ? PieChart : Globe2;
                        return <Icon className="h-3.5 w-3.5 text-[--color-foreground-muted]" aria-hidden />;
                      })()}
                      <span>{s.label}</span>
                    </div>
                    <div className="mb-3.5 kpi-visual">
                      {idx === 1 ? (
                        <MiniBar
                          data={[10, 16, 20, 24, 29]}
                          color={theme.warning}
                          bg={theme.warning ? `${theme.warning}15` : 'rgba(245,158,11,0.08)'}
                          delay={getKpiDelay(idx)}
                          duration={KPI_ANIM_DURATION}
                          className="w-full"
                          height={KPI_BAR_HEIGHT}
                        />
                      ) : idx === 0 || idx === 2 ? (
                        <MiniSparkline
                          data={idx === 0 ? [20, 23, 25, 27, 30] : [1, 2, 4, 8, 16]}
                          height={KPI_SPARK_HEIGHT}
                          delay={getKpiDelay(idx)}
                          duration={KPI_ANIM_DURATION}
                          className="w-full"
                          colorStart={theme.success}
                          colorEnd={theme.primary}
                          showArea={false}
                          showDot
                        />
                      ) : (
                        <div className="w-full flex items-center justify-center">
                          <MiniDonut
                            value={Number.isFinite(euPct) ? (euPct / 100) : 0.5}
                            gradient
                            colorStart={theme.primary}
                            colorEnd={theme.info}
                            glow
                            showValue
                            size={24}
                            strokeWidth={3.5}
                            bg={theme.primary ? `${theme.primary}20` : 'rgba(59,130,246,0.1)'}
                            delay={getKpiDelay(idx)}
                            duration={1.6}
                            className={KPI_DONUT_CLASS}
                          />
                        </div>
                      )}
                    </div>
                    <div className="kpi-value-row [font-feature-settings:'tnum'] [font-variant-numeric:tabular-nums]">
                      <span className="whitespace-normal break-words" title={String(s.value)}>{String(s.value)}</span>
                    </div>
                    <div className="mx-auto mt-2 h-px w-8/12 bg-[--color-border-subtle]/25" aria-hidden />
                    <div className="mt-1.5 text-[12px] md:text-[12.5px] text-[--color-foreground] opacity-85 flex items-center justify-center gap-1" title={s.sub as string}>
                      <span className="one-line">{s.sub as string}</span>
                      {idx === 3 && (
                        <span className="ml-1 inline-flex items-center rounded-sm bg-[--color-surface] px-1 py-[1px] text-[9px] text-[--color-foreground-muted] ring-1 ring-black/5">
                          {locale.startsWith('de') ? 'indikativ' : 'indicative'}
                        </span>
                      )}
                    </div>
                  </div>
                </ElegantCard>
              </InViewFade>
            ))}
          </div>
        </SectionDelay>

        {/* Technische Spezifikationen (Humanoide) – nach Technology verschoben */}

        <span id="size-anchor" className="sr-only" aria-hidden="true" />
        <SectionDelay delayMs={300}>
          <SplitSection
            id="size"
            title={`${sub()} ${tBp('headings.marketVolume')}`}
            left={
              (() => {
                const srcService = sources.find((s) => s.toLowerCase().includes('service robotics')) || sources[0];
                const srcHumanoid = sources.find((s) => s.toLowerCase().includes('humanoid')) || sources[1] || sources[0];
                const svcCagrText = typeof serviceVol?.cagr === 'string' ? `CAGR (Service): ${serviceVol.cagr}` : (tBp('market.volume.cagr') as string);
                const humCagrText = typeof humanoidVol?.cagr === 'string' ? `CAGR (Humanoide): ${humanoidVol.cagr}` : '';
                const svcCagrNode = (
                  <span title={`${locale.startsWith('de') ? 'Quelle' : 'Source'}: ${srcService || 'MarketsandMarkets'}\n${locale.startsWith('de') ? 'Zeitraum' : 'Period'}: 2024–2029`}>
                    {svcCagrText}
                  </span>
                );
                const humCagrNode = humCagrText ? (
                  <span title={`${locale.startsWith('de') ? 'Quelle' : 'Source'}: ${srcHumanoid || 'MarketsandMarkets'}\n${locale.startsWith('de') ? 'Zeitraum' : 'Period'}: 2025–2030`}>
                    {humCagrText}
                  </span>
                ) : null;
                // Immer beide Segmente anzeigen (Service + Humanoid) und treiber anhängen – spaltenbündig nummeriert
                const combined: Array<React.ReactNode> = [
                  ...(Array.isArray([
                    typeof serviceVol?.global === 'string' ? serviceVol.global : (tBp('market.volume.global') as string),
                    svcCagrNode,
                  ]) ? [
                    typeof serviceVol?.global === 'string' ? serviceVol.global : (tBp('market.volume.global') as string),
                    svcCagrNode,
                  ].filter(Boolean) : []),
                  ...(Array.isArray([
                    typeof humanoidVol?.global === 'string' ? humanoidVol.global : '',
                    humCagrNode,
                  ]) ? [
                    typeof humanoidVol?.global === 'string' ? humanoidVol.global : '',
                    humCagrNode,
                  ].filter(Boolean) : []),
                  ...((drivers ? [drivers] : []) as React.ReactNode[]),
                ];
                const humanoidNotes = typeof humanoidVol?.notes === 'string' ? (humanoidVol.notes as string) : '';
                return (
                  <>
                    <NumberedList>
                      {combined.map((node, idx) => (
                        <NumberedItem key={idx} num={`${chapterIndex}.1.${idx + 1}`}>{node}</NumberedItem>
                      ))}
                    </NumberedList>
                    {humanoidNotes && (
                      <p className="mt-2 text-[11px] md:text-[12px] text-[--color-foreground-muted] leading-snug">
                        {humanoidNotes}
                      </p>
                    )}
                  </>
                );
              })()
            }
            right={null}
          />
        </SectionDelay>

        {/* Quellen / References für Marktvolumen */}
        {sources.length > 0 && (
          <SectionDelay delayMs={600}>
            <SectionCard className="border-0">
              <div className="not-prose mb-1 flex items-center gap-2">
                <h3 className="text-[13px] md:text-[14px] font-medium text-[--color-foreground]">{`${sub()} ${locale.startsWith('de') ? '– Quellen (Marktvolumen)' : '– Sources (Market volume)'}`}</h3>
                <span className="inline-flex items-center rounded-sm bg-[--color-surface] px-1 py-[1px] text-[9px] text-[--color-foreground-muted] ring-1 ring-black/5">
                  {locale.startsWith('de') ? 'indikativ' : 'indicative'}
                </span>
              </div>
              <NumberedList>
                {sources.map((s: string, i: number) => (
                  <NumberedItem key={i} num={`${chapterIndex}.2.${i + 1}`}>
                    <a className="link" href={s.split(/\s+/).pop()} target="_blank" rel="noreferrer noopener">{s}</a>
                  </NumberedItem>
                ))}
              </NumberedList>
            </SectionCard>
          </SectionDelay>
        )}
        
        <SectionDelay delayMs={900}>
          <SectionCard className="border-0">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} Einstiegsmärkte`}</h3>
            {Array.isArray(segments) && segments.length > 0 ? (
              <NumberedList>
                {segments.map((s, idx) => (
                  <NumberedItem key={idx} num={`${chapterIndex}.3.${idx + 1}`} title={s.label} />
                ))}
              </NumberedList>
            ) : (
              <NumberedList>
                <NumberedItem num={`${chapterIndex}.3.1`} title="Pflege & Gesundheit">Assistenz für Pfleger, Alltagshilfen für Senioren</NumberedItem>
                <NumberedItem num={`${chapterIndex}.3.2`} title="Hospitality">Servicepersonal für Restaurants & Hotels</NumberedItem>
                <NumberedItem num={`${chapterIndex}.3.3`} title="Bildung & Events">Interaktive humanoide Roboter als Lern- und Entertainment-Assistenten</NumberedItem>
              </NumberedList>
            )}
            {Array.isArray(segments) && segments.length > 0 && (
              <>
                <div className="mt-5 md:mt-6 grid gap-5 md:gap-6 md:grid-cols-2">
                  <InViewFade delay={2.0} duration={1.0} className="overflow-x-auto rounded-xl bg-[--color-surface] p-4 shadow-sm ring-1 ring-black/5">
                    <BarChartAnimated
                      data={segments.map((s) => ({ label: s.label, value: s.share }))}
                      ariaLabel={tBp('headings.segments')}
                      responsive
                      height={220}
                      color={theme.primary}
                      valueSuffix="%"
                    />
                  </InViewFade>
                  <InViewFade delay={2.1} duration={1.0} className="rounded-xl bg-[--color-surface] p-4 shadow-sm ring-1 ring-black/5">
                    <DonutChartAnimated
                      data={segments.map((s, i) => ({ label: `${s.label} – ${s.share}%`, value: s.share, color: palette[i % palette.length] }))}
                      ariaLabel={tBp('headings.segments')}
                      responsive
                      height={220}
                    />
                  </InViewFade>
                </div>
                <div className="mt-4 md:mt-5 flex flex-wrap gap-2.5 text-[12px] text-[--color-foreground-muted]">
                  {segments.map((s, i) => (
                    <span key={`legend-${s.label}`} className="badge inline-flex items-center gap-1.5">
                      <span aria-hidden className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: palette[i % palette.length] }} />
                      <span className="text-[--color-foreground] font-medium">{`${s.label} • ${s.share}%`}</span>
                    </span>
                  ))}
                </div>
                {/* Tabelle entfernt, um Redundanz zu vermeiden – Charts + Legende reichen für kompakte Darstellung */}
              </>
            )}
          </SectionCard>
        </SectionDelay>

        <SectionDelay delayMs={1200}>
          <SectionCard className="border-0">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} Detaillierte Marktübersicht`}</h3>
            {Array.isArray(marketDetails) && marketDetails.length > 0 ? (
              <NumberedList>
                {marketDetails.map((line, idx) => (
                  <NumberedItem key={idx} num={`${chapterIndex}.4.${idx + 1}`}>{line}</NumberedItem>
                ))}
              </NumberedList>
            ) : (
              <NumberedList>
                <NumberedItem num={`${chapterIndex}.4.1`}>Weltweiter Robotik-Markt (Humanoide): 2024: ca. 1,5 Mrd. USD</NumberedItem>
                <NumberedItem num={`${chapterIndex}.4.2`}>Prognose bis 2030: &gt;40 Mrd. USD</NumberedItem>
                <NumberedItem num={`${chapterIndex}.4.3`}>Haupttreiber: Fachkräftemangel, Automatisierung, alternde Gesellschaft, Service-Robotik</NumberedItem>
                <NumberedItem num={`${chapterIndex}.4.4`}>Europa & Österreich: Fokus auf Industrie-4.0, Pflege, Assistenzsysteme</NumberedItem>
                <NumberedItem num={`${chapterIndex}.4.5`}>Österreich: Robotik-Zentren (z. B. TU Wien, Joanneum Research)</NumberedItem>
              </NumberedList>
            )}
          </SectionCard>
        </SectionDelay>

        <SectionDelay delayMs={1500}>
          <SectionCard id="target" className="border-0">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – Zielkundensegmente für RaaS`}</h3>
            {Array.isArray(segments) && segments.length > 0 ? (
              <NumberedList>
                {segments.map((s, idx) => (
                  <NumberedItem key={idx} num={`${chapterIndex}.5.${idx + 1}`} title={s.label} />
                ))}
              </NumberedList>
            ) : (
              <NumberedList>
                <NumberedItem num={`${chapterIndex}.5.1`} title="Healthcare & Pflege">Unterstützung für ältere Menschen, Routineaufgaben im Krankenhaus</NumberedItem>
                <NumberedItem num={`${chapterIndex}.5.2`} title="Office & Hospitality">Empfangs- & Service-Roboter</NumberedItem>
                <NumberedItem num={`${chapterIndex}.5.3`} title="Industrie & Logistik">Assistenz bei repetitiven Prozessen, Human-Robot-Collaboration</NumberedItem>
                <NumberedItem num={`${chapterIndex}.5.4`} title="Education & Research">Plattform für Universitäten und Startups zur Entwicklung neuer Robotik-Apps</NumberedItem>
              </NumberedList>
            )}
          </SectionCard>
        </SectionDelay>

        <SectionDelay delayMs={1800}>
          <SectionCard id="competition" className="border-0">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – Wettbewerbsanalyse & Benchmarks`}</h3>
            <div className="source-note not-prose">
              Quellen: 
              <a href="https://highalpha.com/" target="_blank" rel="noreferrer noopener">High Alpha</a>
              /
              <a href="https://openviewpartners.com/" target="_blank" rel="noreferrer noopener">OpenView</a>
              &nbsp;2024,
              <a href="https://openviewpartners.com/blog/ltv-cac-ratio/" target="_blank" rel="noreferrer noopener">LTV/CAC Benchmarks</a>
            </div>
            <h3 className="text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${chapterIndex}.6.1 Globale Player (Hardware)`}</h3>
            <NumberedList>
              {Array.isArray(hardwarePlayers) && hardwarePlayers.map((line, idx) => (
                <NumberedItem key={idx} num={`${chapterIndex}.6.1.${idx + 1}`}>{line}</NumberedItem>
              ))}
              {(!Array.isArray(hardwarePlayers) || hardwarePlayers.length === 0) && (
                <>
                  <NumberedItem num={`${chapterIndex}.6.1.1`} title="Tesla Bot (Optimus)">Fokus auf humanoide Robotik für Industrie & einfache Tasks</NumberedItem>
                  <NumberedItem num={`${chapterIndex}.6.1.2`} title="Boston Dynamics">Starke Hardware, aber primär Industrie/Defense orientiert</NumberedItem>
                  <NumberedItem num={`${chapterIndex}.6.1.3`} title="PAL Robotics">Europäischer Anbieter humanoider Plattformen, Fokus auf Forschung & Service</NumberedItem>
                </>
              )}
            </NumberedList>
          </SectionCard>
        </SectionDelay>

        <SectionDelay delayMs={2100}>
          <SectionCard className="border-0" title={`${chapterIndex}.6.2 Software & Plattformen`}>
            <NumberedList>
              {Array.isArray(softwarePlayers) && softwarePlayers.map((line, idx) => (
                <NumberedItem key={idx} num={`${chapterIndex}.6.2.${idx + 1}`}>{line}</NumberedItem>
              ))}
              {(!Array.isArray(softwarePlayers) || softwarePlayers.length === 0) && (
                <>
                  <NumberedItem num={`${chapterIndex}.6.2.1`} title="OpenAI / Figure AI">Entwicklung KI-gesteuerter Roboter</NumberedItem>
                  <NumberedItem num={`${chapterIndex}.6.2.2`} title="Agility Robotics">Spezialisierung auf zweibeinige Roboter für Logistik</NumberedItem>
                  <NumberedItem num={`${chapterIndex}.6.2.3`} title="Ubtech Robotics">Fokus auf Consumer & Education-Roboter</NumberedItem>
                </>
              )}
            </NumberedList>
          </SectionCard>
        </SectionDelay>

        <SectionDelay delayMs={2400}>
          <SectionCard className="border-0" title={`${chapterIndex}.6.3 Unser Differenzierungsmerkmal`}>
            <p className="text-[13px] md:text-[14px] text-[--color-foreground] opacity-90 leading-relaxed">
              <strong>Statt nur &quot;Hardware + KI&quot; bieten wir eine Plattform-Ökonomie:</strong>
            </p>
            <NumberedList>
              {Array.isArray(diffPoints) && diffPoints.map((line, idx) => (
                <NumberedItem key={idx} num={`${chapterIndex}.6.3.${idx + 1}`}>{line}</NumberedItem>
              ))}
              {(!Array.isArray(diffPoints) || diffPoints.length === 0) && (
                <>
                  <NumberedItem num={`${chapterIndex}.6.3.1`} title="Roboter-Appstore">Skills, Charaktere, Verhalten wie &quot;Apps&quot; herunterladbar</NumberedItem>
                  <NumberedItem num={`${chapterIndex}.6.3.2`} title="RaaS-Modell">Kunden müssen keinen Roboter kaufen, sondern können Roboter + Software mieten</NumberedItem>
                  <NumberedItem num={`${chapterIndex}.6.3.3`} title="SigmaCode AI Integration">KI-Agenten arbeiten nicht nur im Roboter, sondern auch in der Cloud für komplexe Workflows</NumberedItem>
                </>
              )}
            </NumberedList>
          </SectionCard>
        </SectionDelay>

        <SectionDelay delayMs={2700}>
          <SectionCard className="border-0">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – SWOT-Analyse`}</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card p-5 pb-7">
                <h4 className="font-semibold mb-2">{locale.startsWith('de') ? 'Stärken' : 'Strengths'}</h4>
                <ul className="pl-0 space-y-2 leading-relaxed">
                  {(swotStrengths && swotStrengths.length > 0 ? swotStrengths : [locale.startsWith('de') ? '–' : '–']).map((it: string, idx: number) => (
                    <li key={`s-${idx}`} className="flex items-start gap-2.5 text-[13px] md:text-[14px]">
                      <span className="mt-[2px] h-5 w-5 grid place-items-center flex-shrink-0"><Plus aria-hidden className="h-4 w-4 text-emerald-500" /></span>
                      <span className="flex-1">{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-5 pb-7">
                <h4 className="font-semibold mb-2">{locale.startsWith('de') ? 'Schwächen' : 'Weaknesses'}</h4>
                <ul className="pl-0 space-y-2 leading-relaxed">
                  {(swotWeaknesses && swotWeaknesses.length > 0 ? swotWeaknesses : [locale.startsWith('de') ? '–' : '–']).map((it: string, idx: number) => (
                    <li key={`w-${idx}`} className="flex items-start gap-2.5 text-[13px] md:text-[14px]">
                      <span className="mt-[2px] h-5 w-5 grid place-items-center flex-shrink-0"><Minus aria-hidden className="h-4 w-4 text-rose-500" /></span>
                      <span className="flex-1">{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-5 pb-7">
                <h4 className="font-semibold mb-2">{locale.startsWith('de') ? 'Chancen' : 'Opportunities'}</h4>
                <ul className="pl-0 space-y-2 leading-relaxed">
                  {(swotOpportunities && swotOpportunities.length > 0 ? swotOpportunities : []).map((it: string, idx: number) => (
                    <li key={`o-${idx}`} className="flex items-start gap-2.5 text-[13px] md:text-[14px]">
                      <span className="mt-[2px] h-5 w-5 grid place-items-center flex-shrink-0"><ArrowUpRight aria-hidden className="h-4 w-4 text-amber-500" /></span>
                      <span className="flex-1">{it}</span>
                    </li>
                  ))}
                  {(!swotOpportunities || swotOpportunities.length === 0) && (
                    <li className="flex items-start gap-2.5 text-[13px] md:text-[14px]"><span className="mt-[2px] h-5 w-5 grid place-items-center flex-shrink-0"><ArrowUpRight aria-hidden className="h-4 w-4 text-amber-500" /></span><span className="flex-1">—</span></li>
                  )}
                </ul>
              </div>
              <div className="card p-5 pb-7">
                <h4 className="font-semibold mb-2">{locale.startsWith('de') ? 'Risiken' : 'Threats'}</h4>
                <ul className="pl-0 space-y-2 leading-relaxed">
                  {(swotThreats && swotThreats.length > 0 ? swotThreats : []).map((it: string, idx: number) => (
                    <li key={`t-${idx}`} className="flex items-start gap-2.5 text-[13px] md:text-[14px]">
                      <span className="mt-[2px] h-5 w-5 grid place-items-center flex-shrink-0"><AlertCircle aria-hidden className="h-4 w-4 text-orange-500" /></span>
                      <span className="flex-1">{it}</span>
                    </li>
                  ))}
                  {(!swotThreats || swotThreats.length === 0) && (
                    <li className="flex items-start gap-2.5 text-[13px] md:text-[14px]"><span className="mt-[2px] h-5 w-5 grid place-items-center flex-shrink-0"><AlertCircle aria-hidden className="h-4 w-4 text-orange-500" /></span><span className="flex-1">—</span></li>
                  )}
                </ul>
              </div>
            </div>
          </SectionCard>
        </SectionDelay>
        <SectionDelay delayMs={3000}>
          <SectionCard className="border-0">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – Marktstrategie`}</h3>
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">Go-to-Market (Phase 1 – 2026–2027)</h3>
            {Array.isArray(gtmPhase1) && gtmPhase1.length > 0 ? (
              <NumberedList>
                {gtmPhase1.map((line, idx) => (
                  <NumberedItem key={idx} num={`${chapterIndex}.8.${idx + 1}`}>{line}</NumberedItem>
                ))}
              </NumberedList>
            ) : (
              <NumberedList>
                <NumberedItem num={`${chapterIndex}.8.1`}>Pilotprojekte mit Pflegeheimen, Hotels, Forschungsinstituten</NumberedItem>
                <NumberedItem num={`${chapterIndex}.8.2`}>Kooperationen mit österreichischen Universitäten (TU Wien, FH Hagenberg, JKU Linz)</NumberedItem>
                <NumberedItem num={`${chapterIndex}.8.3`}>Skalierung (Phase 2 – 2028–2029): Aufbau RaaS-Infrastruktur für B2B-Kunden, Launch Roboter-Appstore (Beta), Ziel: 20–30 Kunden in DACH-Region</NumberedItem>
                <NumberedItem num={`${chapterIndex}.8.4`}>Expansion (Phase 3 – 2030): Eintritt in EU-Markt (Healthcare + Office), White-Label-Lösungen für internationale Partner, Appstore als Standard-Ökosystem für humanoide Roboter</NumberedItem>
              </NumberedList>
            )}
          </SectionCard>
        </SectionDelay>

        <SectionDelay delayMs={3300}>
          <SectionCard className="border-0">
            <h3 className="not-prose text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">{`${sub()} – PESTEL-Analyse`}</h3>
            {/* Zusätzliche unsichtbare Anker für Förder-Keys */}
            <span id="ffg-growth" className="sr-only" aria-hidden="true" />
            <span id="aws-innovation" className="sr-only" aria-hidden="true" />
            {Array.isArray(pestel) && pestel.length > 0 ? (
              <NumberedList>
                {pestel.map((line, idx) => (
                  <NumberedItem key={idx} num={`${chapterIndex}.9.${idx + 1}`}>{line}</NumberedItem>
                ))}
              </NumberedList>
            ) : (
              <NumberedList>
                <NumberedItem num={`${chapterIndex}.9.1`}><strong>Politisch:</strong> EU-Förderungen & Strategien, Nationale Förderungen (AWS, FFG), Regulierung der KI & Robotik</NumberedItem>
                <NumberedItem num={`${chapterIndex}.9.2`}><strong>Wirtschaftlich:</strong> Wachstumsmarkt, Förderlandschaft, Industrie 4.0</NumberedItem>
                <NumberedItem num={`${chapterIndex}.9.3`}><strong>Sozial:</strong> Demographischer Wandel, KI-Akzeptanz</NumberedItem>
                <NumberedItem num={`${chapterIndex}.9.4`}><strong>Technologisch:</strong> Durchbrüche in KI & Robotik, Plattform-Ökösysteme, Cybersecurity & Safety</NumberedItem>
                <NumberedItem num={`${chapterIndex}.9.5`}><strong>Ökologisch:</strong> Ressourceneffizienz, Nachhaltige Hardware-Nutzung, Green AI</NumberedItem>
                <NumberedItem num={`${chapterIndex}.9.6`}><strong>Rechtlich:</strong> EU AI Act, Produkthaftung, Datenschutz (DSGVO), Zertifizierungen & Normen</NumberedItem>
              </NumberedList>
            )}
          </SectionCard>
        </SectionDelay>

        {/* Quellen / References für State of the Art */}
        {overviewSources.length > 0 && (
          <SectionDelay delayMs={4600}>
            <SectionCard className="border-0">
              <div className="not-prose mb-1 flex items-center gap-2">
                <h3 className="text-[13px] md:text-[14px] font-medium text-[--color-foreground]">{`${sub()} ${locale.startsWith('de') ? '– Quellen (State of the Art)' : '– Sources (State of the Art)'}`}</h3>
                <span className="inline-flex items-center rounded-sm bg-[--color-surface] px-1 py-[1px] text-[9px] text-[--color-foreground-muted] ring-1 ring-black/5">
                  {locale.startsWith('de') ? 'indikativ' : 'indicative'}
                </span>
              </div>
              <div className="text-[11px] text-[--color-foreground-muted] mb-1.5">
                {locale.startsWith('de')
                  ? 'Indikative Auswahl vertrauenswürdiger Referenzen (nicht abschließend)'
                  : 'Indicative selection of reputable references (non-exhaustive)'}
              </div>
              <NumberedList>
                {overviewSources.map((s: string, i: number) => {
                  const href = s.split(/\s+/).pop() as string;
                  let host = '';
                  try { host = new URL(href).hostname.replace(/^www\./, ''); } catch {}
                  const label = s.replace(href, '').replace(/[\s–-]+$/, '').trim() || href;
                  return (
                    <NumberedItem key={i} num={`${chapterIndex}.7.${i + 1}`}>
                      <a className="link inline-flex items-center gap-1" href={href} target="_blank" rel="noreferrer noopener" title={href}>
                        <ExternalLink aria-hidden className="h-3.5 w-3.5 text-[--color-foreground-muted]" />
                        <span>{label}</span>
                        {host && <span className="text-[10px] text-[--color-foreground-muted]">({host})</span>}
                      </a>
                    </NumberedItem>
                  );
                })}
              </NumberedList>
            </SectionCard>
          </SectionDelay>
        )}

        <SectionDelay delayMs={3600}>
          <SectionCard id="size" className="border-0">
            <div className="not-prose flex items-center justify-between gap-2">
              <h3 className="text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]" id="market-size-heading">{`${sub()} Marktgrößen (TAM/SAM/SOM)`}</h3>
              <span className="shrink-0 rounded-md bg-[--color-surface] px-2 py-0.5 text-[10px] text-[--color-foreground-muted] ring-1 ring-black/5" aria-label={dataAsOf}>{dataAsOf}</span>
            </div>
            <p className="not-prose text-[12.5px] md:text-[13px] text-[--color-foreground] opacity-80 mb-2" aria-describedby="market-size-heading">
              {locale.startsWith('de')
                ? 'Service‑Robotik (gesamt) und Humanoide – kompakt als Liste, Mini‑Charts und Vergleich.'
                : 'Service robotics (total) and humanoids – compact list, mini charts and comparison.'}
            </p>
            {(sizeHumanoid || sizeService) ? (
              <>
              <div className="grid gap-6 md:grid-cols-2" role="group" aria-label={locale.startsWith('de') ? 'Listenansicht der Marktgrößen' : 'List view of market sizes'}>
                {sizeService && (
                  <div className="rounded-xl bg-[--color-surface] p-3.5 shadow-sm ring-1 ring-black/5">
                    <h4 className="text-[13px] md:text-[14px] font-medium text-[--color-foreground] pb-1 border-b border-black/5" id="svc-heading">
                      <span className="inline-flex items-center gap-2">
                        <Globe2 className="h-3.5 w-3.5 text-[--color-foreground-muted]" aria-hidden />
                        <span>Service‑Robotik (gesamt)</span>
                        <span className="ml-1 rounded-md bg-[--color-surface] px-1.5 py-0.5 text-[10px] text-[--color-foreground-muted] ring-1 ring-black/5">TAM/SAM/SOM</span>
                        {srcService && (
                          <a
                            href={(srcService.split(/\s+/).pop() as string) || '#'}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="ml-1 inline-flex items-center gap-1 rounded-md bg-[--color-surface] px-1.5 py-0.5 text-[10px] text-[--color-foreground-muted] ring-1 ring-black/5 hover:text-[--color-foreground]"
                            title={srcService}
                          >
                            <span>{locale.startsWith('de') ? 'Quelle' : 'Source'}</span>
                            <ExternalLink className="h-3 w-3" aria-hidden />
                          </a>
                        )}
                      </span>
                    </h4>
                    <ul className="mt-1.5 text-[13px] md:text-[14px] leading-relaxed text-[--color-foreground] divide-y divide-black/5" aria-labelledby="svc-heading">
                      {typeof sizeService?.tam === 'string' && (
                        <li className="py-1 first:pt-0">
                          <strong>TAM:</strong> {sizeService.tam}
                          {(srcShort || extractYear(sizeService.tam)) && (
                            <span className="ml-2 align-middle rounded-md bg-[--color-surface] px-1.5 py-0.5 text-[10px] text-[--color-foreground-muted] ring-1 ring-black/5">
                              {srcShort}{extractYear(sizeService.tam) ? ` ${extractYear(sizeService.tam)}` : ''}
                            </span>
                          )}
                        </li>
                      )}
                      {typeof sizeService?.sam === 'string' && (
                        <li className="py-1">
                          <strong>SAM:</strong> {sizeService.sam}
                          {(srcShort || extractYear(sizeService.sam)) && (
                            <span className="ml-2 align-middle rounded-md bg-[--color-surface] px-1.5 py-0.5 text-[10px] text-[--color-foreground-muted] ring-1 ring-black/5">
                              {srcShort}{extractYear(sizeService.sam) ? ` ${extractYear(sizeService.sam)}` : ''}
                            </span>
                          )}
                        </li>
                      )}
                      {typeof sizeService?.som === 'string' && (
                        <li className="py-1 last:pb-0">
                          <strong>SOM:</strong> {sizeService.som}
                          {(srcShort || extractYear(sizeService.som)) && (
                            <span className="ml-2 align-middle rounded-md bg-[--color-surface] px-1.5 py-0.5 text-[10px] text-[--color-foreground-muted] ring-1 ring-black/5">
                              {srcShort}{extractYear(sizeService.som) ? ` ${extractYear(sizeService.som)}` : ''}
                            </span>
                          )}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                {sizeHumanoid && (
                  <div className="rounded-xl bg-[--color-surface] p-3.5 shadow-sm ring-1 ring-black/5">
                    <h4 className="text-[13px] md:text-[14px] font-medium text-[--color-foreground] pb-1 border-b border-black/5" id="hum-heading">
                      <span className="inline-flex items-center gap-2">
                        <PieChart className="h-3.5 w-3.5 text-[--color-foreground-muted]" aria-hidden />
                        <span>Humanoide Robotik</span>
                        <span className="ml-1 rounded-md bg-[--color-surface] px-1.5 py-0.5 text-[10px] text-[--color-foreground-muted] ring-1 ring-black/5">TAM/SAM/SOM</span>
                        {srcHumanoid && (
                          <a
                            href={(srcHumanoid.split(/\s+/).pop() as string) || '#'}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="ml-1 inline-flex items-center gap-1 rounded-md bg-[--color-surface] px-1.5 py-0.5 text-[10px] text-[--color-foreground-muted] ring-1 ring-black/5 hover:text-[--color-foreground]"
                            title={srcHumanoid}
                          >
                            <span>{locale.startsWith('de') ? 'Quelle' : 'Source'}</span>
                            <ExternalLink className="h-3 w-3" aria-hidden />
                          </a>
                        )}
                      </span>
                    </h4>
                    <ul className="mt-1.5 text-[13px] md:text-[14px] leading-relaxed text-[--color-foreground] divide-y divide-black/5">
                      {typeof sizeHumanoid?.tam === 'string' && (
                        <li className="py-1 first:pt-0">
                          <strong>TAM:</strong> {sizeHumanoid.tam}
                          {(srcShort || extractYear(sizeHumanoid.tam)) && (
                            <span className="ml-2 align-middle rounded-md bg-[--color-surface] px-1.5 py-0.5 text-[10px] text-[--color-foreground-muted] ring-1 ring-black/5">
                              {srcShort}{extractYear(sizeHumanoid.tam) ? ` ${extractYear(sizeHumanoid.tam)}` : ''}
                            </span>
                          )}
                        </li>
                      )}
                      {typeof sizeHumanoid?.sam === 'string' && (
                        <li className="py-1">
                          <strong>SAM:</strong> {sizeHumanoid.sam}
                          {(srcShort || extractYear(sizeHumanoid.sam)) && (
                            <span className="ml-2 align-middle rounded-md bg-[--color-surface] px-1.5 py-0.5 text-[10px] text-[--color-foreground-muted] ring-1 ring-black/5">
                              {srcShort}{extractYear(sizeHumanoid.sam) ? ` ${extractYear(sizeHumanoid.sam)}` : ''}
                            </span>
                          )}
                        </li>
                      )}
                      {typeof sizeHumanoid?.som === 'string' && (
                        <li className="py-1 last:pb-0">
                          <strong>SOM:</strong> {sizeHumanoid.som}
                          {(srcShort || extractYear(sizeHumanoid.som)) && (
                            <span className="ml-2 align-middle rounded-md bg-[--color-surface] px-1.5 py-0.5 text-[10px] text-[--color-foreground-muted] ring-1 ring-black/5">
                              {srcShort}{extractYear(sizeHumanoid.som) ? ` ${extractYear(sizeHumanoid.som)}` : ''}
                            </span>
                          )}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              {/* Mini‑Charts: Service vs. Humanoid je Kennzahl (in Milliarden) */}
              {(sizeServiceNumbers.tam ?? sizeHumanoidNumbers.tam ?? null) !== null ||
               (sizeServiceNumbers.sam ?? sizeHumanoidNumbers.sam ?? null) !== null ||
               (sizeServiceNumbers.som ?? sizeHumanoidNumbers.som ?? null) !== null ? (
                <div className="mt-3.5 grid gap-3.5 md:grid-cols-3" role="group" aria-label={locale.startsWith('de') ? 'Vergleichende Mini‑Diagramme' : 'Comparative mini charts'}>
                  {(sizeServiceNumbers.sam !== null || sizeHumanoidNumbers.sam !== null) && (
                    <InViewFade delay={0.15} duration={0.9} className="rounded-xl bg-[--color-surface] p-3 shadow-sm ring-1 ring-black/5 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <h5 className="text-[12px] md:text-[13px] font-medium text-[--color-foreground]">SAM</h5>
                      </div>
                      <div className="mb-2 flex gap-3 text-[11px] text-[--color-foreground-muted] justify-center">
                        {sizeServiceNumbers.sam !== null && <span>{`${locale.startsWith('de') ? 'Service' : 'Service'}: ${fmtB(sizeServiceNumbers.sam)}`}</span>}
                        {sizeHumanoidNumbers.sam !== null && <span>{`${locale.startsWith('de') ? 'Humanoid' : 'Humanoid'}: ${fmtB(sizeHumanoidNumbers.sam)}`}</span>}
                      </div>
                      <BarChartAnimated
                        data={[
                          ...(sizeServiceNumbers.sam !== null ? [{ label: locale.startsWith('de') ? 'Service' : 'Service', value: sizeServiceNumbers.sam as number }] : []),
                          ...(sizeHumanoidNumbers.sam !== null ? [{ label: locale.startsWith('de') ? 'Humanoid' : 'Humanoid', value: sizeHumanoidNumbers.sam as number }] : []),
                        ]}
                        ariaLabel={locale.startsWith('de') ? 'SAM Vergleich' : 'SAM comparison'}
                        responsive
                        height={160}
                        color={theme.success}
                        valueSuffix={chartSuffix}
                      />
                    </InViewFade>
                  )}
                  {(sizeServiceNumbers.som !== null || sizeHumanoidNumbers.som !== null) && (
                    <InViewFade delay={0.2} duration={0.9} className="rounded-xl bg-[--color-surface] p-3 shadow-sm ring-1 ring-black/5 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <h5 className="text-[12px] md:text-[13px] font-medium text-[--color-foreground]">SOM</h5>
                      </div>
                      <div className="mb-2 flex gap-3 text-[11px] text-[--color-foreground-muted] justify-center">
                        {sizeServiceNumbers.som !== null && <span>{`${locale.startsWith('de') ? 'Service' : 'Service'}: ${fmtB(sizeServiceNumbers.som)}`}</span>}
                        {sizeHumanoidNumbers.som !== null && <span>{`${locale.startsWith('de') ? 'Humanoid' : 'Humanoid'}: ${fmtB(sizeHumanoidNumbers.som)}`}</span>}
                      </div>
                      <BarChartAnimated
                        data={[
                          ...(sizeServiceNumbers.som !== null ? [{ label: locale.startsWith('de') ? 'Service' : 'Service', value: sizeServiceNumbers.som as number }] : []),
                          ...(sizeHumanoidNumbers.som !== null ? [{ label: locale.startsWith('de') ? 'Humanoid' : 'Humanoid', value: sizeHumanoidNumbers.som as number }] : []),
                        ]}
                        ariaLabel={locale.startsWith('de') ? 'SOM Vergleich' : 'SOM comparison'}
                        responsive
                        height={160}
                        color={theme.warning}
                        valueSuffix={chartSuffix}
                      />
                    </InViewFade>
                  )}
                </div>
               ) : null}
              {/* Kompakte Gegenüberstellung als Tabelle */}
              <div className="mt-3.5 overflow-hidden rounded-xl bg-[--color-surface] ring-1 ring-black/5" role="table" aria-label={locale.startsWith('de') ? 'Vergleichstabelle TAM SAM SOM' : 'Comparison table TAM SAM SOM'}>
                <TableSimple
                  headers={["", "TAM", "SAM", "SOM"]}
                  rows={[
                    ...(sizeService
                      ? [[
                          locale.startsWith('de') ? 'Service' : 'Service',
                          String(sizeService?.tam ?? '–'),
                          String(sizeService?.sam ?? '–'),
                          String(sizeService?.som ?? '–'),
                        ]]
                      : []),
                    ...(sizeHumanoid
                      ? [[
                          (locale.startsWith('de') ? 'Humanoid' : 'Humanoid'),
                          String(sizeHumanoid?.tam ?? '–'),
                          String(sizeHumanoid?.sam ?? '–'),
                          String(sizeHumanoid?.som ?? '–'),
                        ]]
                      : []),
                  ]}
                  className="min-w-full"
                  animateRows
                  rowVariant="fadeInUp"
                  stagger={0.04}
                  zebra
                  denseRows
                  emphasizeFirstCol
                />
              </div>
              {/* Legende entfernt auf Wunsch */}
              </>
            ) : (
              <div className="rounded-xl bg-[--color-surface] p-3 shadow-sm ring-1 ring-black/5">
              <ul className="text-[13px] md:text-[14px] leading-relaxed text-[--color-foreground] divide-y divide-black/5">
                {tam && (
                  <li className="py-1 first:pt-0"><strong>TAM (Total Addressable Market):</strong> {tam}</li>
                )}
                {sam && (
                  <li className="py-1"><strong>SAM (Serviceable Available Market):</strong> {sam}</li>
                )}
                {som && (
                  <li className="py-1 last:pb-0"><strong>SOM (Serviceable Obtainable Market):</strong> {som}</li>
                )}
                {!tam && !sam && !som && (
                  <>
                    <li className="py-1 first:pt-0"><strong>TAM (Total Addressable Market):</strong> Gesamtmarkt für humanoide Robotik weltweit: ~120 Mrd. € (2030)</li>
                    <li className="py-1"><strong>SAM (Serviceable Available Market):</strong> Relevanter Markt in Europa: ~30 Mrd. € (2030)</li>
                    <li className="py-1 last:pb-0"><strong>SOM (Serviceable Obtainable Market):</strong> Realistisch erreichbarer Marktanteil: ~150 Mio. € (5 Jahre), ~600–900 Mio. € (10 Jahre)</li>
                  </>
                )}
              </ul>
              </div>
            )}
            {/* Hinweis-Banner zur Unsicherheit/Spannweiten */}
            <div className="mt-4 md:mt-5 not-prose rounded-xl bg-[--color-surface] p-3 shadow-sm ring-1 ring-black/5" role="note" aria-label={locale.startsWith('de') ? 'Hinweis zu Studien' : 'Note on studies'}>
              <div className="flex items-start gap-2 text-[12px] md:text-[13px] text-[--color-foreground]">
                <AlertCircle className="h-4 w-4 text-[--color-foreground-muted] mt-0.5" aria-hidden />
                <p className="leading-relaxed">
                  {locale.startsWith('de')
                    ? 'Marktgrößen sind indikativ und je nach Studie unterschiedlich. Wir nutzen konservative Werte und ergänzen internes Benchmarking.'
                    : 'Market sizes are indicative and vary by study. We apply conservative figures and supplement with internal benchmarking.'}
                </p>
              </div>
            </div>
            {/* Definitionen & Methodik – visuelle Angleichung an restliche Kapitel */}
            <div className="mt-4 md:mt-5 grid gap-4 md:gap-5 md:grid-cols-2 not-prose" role="group" aria-label={locale.startsWith('de') ? 'Definitionen und Methodik' : 'Definitions and methodology'}>
              <div className="rounded-xl bg-[--color-surface] p-3 shadow-sm ring-1 ring-black/5">
                <h4 className="text-[12px] md:text-[13px] font-medium text-[--color-foreground] mb-1">{locale.startsWith('de') ? 'Definitionen' : 'Definitions'}</h4>
                <ul className="text-[12px] md:text-[13px] leading-relaxed text-[--color-foreground] list-none pl-0">
                  <li><strong>TAM</strong> – {locale.startsWith('de') ? 'Gesamtmarkt (theoretisch adressierbar)' : 'Total market (theoretically addressable)'}</li>
                  <li><strong>SAM</strong> – {locale.startsWith('de') ? 'Serviceable Markt (relevant, erreichbar mit Angebot)' : 'Serviceable market (relevant, reachable with offering)'}</li>
                  <li><strong>SOM</strong> – {locale.startsWith('de') ? 'Erreichbarer Anteil (kurz-/mittelfristig realistisch)' : 'Obtainable share (short-/mid‑term realistically)'}
                  </li>
                </ul>
              </div>
              <div className="rounded-xl bg-[--color-surface] p-3 shadow-sm ring-1 ring-black/5">
                <h4 className="text-[12px] md:text-[13px] font-medium text-[--color-foreground] mb-1">{locale.startsWith('de') ? 'Methodik & Annahmen' : 'Method & Assumptions'}</h4>
                <ul className="text-[12px] md:text-[13px] leading-relaxed text-[--color-foreground] list-none pl-0">
                  <li>{locale.startsWith('de') ? 'DACH/EU‑Fokus; Rollouts über Partner (Integrator/OEM)' : 'DACH/EU focus; rollouts via partners (integrators/OEMs)'}</li>
                  <li>{locale.startsWith('de') ? 'Monetarisierung via RaaS + App‑Store (wiederkehrend, Upsell)' : 'Monetization via RaaS + app store (recurring, upsell)'}</li>
                  <li>{locale.startsWith('de') ? 'Service: vertikale Segmente mit Zahlungsbereitschaft (Healthcare, Hospitality, Education, Logistik)' : 'Service: verticals with willingness to pay (healthcare, hospitality, education, logistics)'}</li>
                  <li>{locale.startsWith('de') ? 'Humanoide: industrienahe Use‑Cases (Logistik/Industrie/Facility)' : 'Humanoids: industrial‑adjacent use cases (logistics/manufacturing/facility)'}</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 md:mt-4 text-[11px] text-[--color-foreground-muted]">
              {locale.startsWith('de')
                ? 'Quellen: MarketsandMarkets (indikativ), interne Ableitungen; Spannweiten je Studie möglich.'
                : 'Sources: MarketsandMarkets (indicative), internal derivations; ranges vary by study.'}
            </div>
          </SectionCard>
        </SectionDelay>
      </div>
      {/* Notizen-Box und Checklist entfernt gemäß Vorgabe */}
    </div>
  );
}
