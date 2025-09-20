import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { getMessages } from '@/i18n/messages';
import { chapters } from '../chapters.config';
import { buildLocalePath } from '@/i18n/path';
import RevenueMixChart from './RevenueMixChart';
import MultiLineEuroChartClient from './MultiLineEuroChartClient';
import WaterfallEuroChartClient from './WaterfallEuroChartClient';
import TableSimple from '@/components/ui/TableSimple';
import SectionDelay from '@/components/animation/SectionDelay';
import { CardTitle } from '@/components/ui/card';
import ElegantCard from '@/components/ui/ElegantCard';
import CountUp from '@/components/charts/CountUp';
import { CheckCircle2, TrendingUp, BarChart3, CircleDollarSign } from 'lucide-react';
import MiniSparkline from '@/components/charts/MiniSparkline';
import MiniBar from '@/components/charts/MiniBar';
import { KPI_ANIM_DURATION, KPI_BAR_HEIGHT, KPI_SPARK_HEIGHT, getKpiDelay, COUNTUP_DURATION_MS, getCountUpDelayMs } from '@/components/charts/kpiAnimation';
import SectionHeader from '@/components/sections/SectionHeader';
import SectionBody from '@/components/sections/SectionBody';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const index = Math.max(0, chapters.findIndex((c) => c.slug === 'finance')) + 1;
  return {
    robots: { index: false, follow: true },
    alternates: { canonical: buildLocalePath(locale, `/chapters/${index}`) },
  };
}


export default async function FinancePage() {
  const locale = await getLocale();
  const tBp = await getTranslations('bp');
  const tFin = await getTranslations('finance');
  const chapterIndex = Math.max(0, chapters.findIndex((c) => c.slug === 'finance')) + 1;
  const chapterTitle = `${locale.startsWith('de') ? 'Kapitel' : 'Chapter'} ${chapterIndex} – ${tBp('sections.finance')}`;
  // Einheitliche Unterkapitel-Nummerierung (nicht verwendet)

  const { bp } = await getMessages(locale.startsWith('de') ? 'de' : 'en');
  const bpAny = bp as any;
  const messages: any = { bp: bpAny, content: (bpAny as any).content ?? {} };
  const fin = (bpAny?.finance as any) ?? {};
  const financeIntro: string | undefined = typeof bpAny?.financeIntro === 'string' ? (bpAny.financeIntro as string) : undefined;

  // Helper & aggregates for submissions plan (localized)
  const parseEuroRangeToMidpoint = (s?: string | null): number | null => {
    if (!s || typeof s !== 'string') return null;
    const lower = s.toLowerCase();
    if (/(programmabhängig|program dependent)/.test(lower)) return null;
    const match = s.match(/([€$])?\s*([0-9]+(?:[.,][0-9]+)?)\s*[–-]\s*([0-9]+(?:[.,][0-9]+)?)\s*([kmmb]?)/i);
    if (!match) {
      const single = s.match(/([€$])?\s*([0-9]+(?:[.,][0-9]+)?)\s*([kmmb]?)/i);
      if (!single) return null;
      const v = parseFloat(single[2].replace(',', '.'));
      const unit = (single[3] || '').toLowerCase();
      const factor = unit === 'k' ? 1_000 : unit === 'm' ? 1_000_000 : unit === 'b' ? 1_000_000_000 : 1;
      return v * factor;
    }
    const a = parseFloat(match[2].replace(',', '.'));
    const b = parseFloat(match[3].replace(',', '.'));
    const unit = (match[4] || '').toLowerCase();
    const factor = unit === 'k' ? 1_000 : unit === 'm' ? 1_000_000 : unit === 'b' ? 1_000_000_000 : 1;
    const mid = (a + b) / 2;
    return mid * factor;
  };
  const submissionsPlan: any[] = Array.isArray(fin?.submissionsPlan) ? (fin.submissionsPlan as any[]) : [];
  const totalGrantsMid = (() => {
    try {
      const nums = submissionsPlan
        .map((p: any) => parseEuroRangeToMidpoint(p?.requestedAmount))
        .filter((n) => typeof n === 'number' && isFinite(n)) as number[];
      return nums.reduce((s, n) => s + n, 0);
    } catch { return 0; }
  })();
  const mix = (fin?.fundingMix as any) ?? {};
  const equityPct = Number(mix?.equityPct ?? 0);
  const investorPct = Number(mix?.investorPct ?? 0);
  const grantsPct = Number(mix?.grantsPct ?? 0);
  const grantsRatio = grantsPct > 0 ? (grantsPct / 100) : 0;
  const estTotalBudget = grantsRatio > 0 ? Math.round(totalGrantsMid / grantsRatio) : 0;
  const estEquity = Math.round(estTotalBudget * (equityPct / 100));
  const estInvestors = Math.round(estTotalBudget * (investorPct / 100));

  // Revenue by stream (lokalisierte content.finance bevorzugen, Fallback i18n finance.revenueComposition)
  const revBy = (messages?.content?.finance?.revenueByStream as { labels?: Array<string|number>; series?: Array<{ name: string; values: number[] }>; } | undefined)
    ?? (fin?.revenueByStream as { labels?: Array<string|number>; series?: Array<{ name: string; values: number[] }>; } | undefined);
  let revLabels: Array<string|number> = Array.isArray(revBy?.labels) ? revBy!.labels! : [];
  let revSeries: Array<{ name: string; values: number[] }> = Array.isArray(revBy?.series)
    ? revBy!.series!.map((s: any) => ({ name: String(s?.name ?? ''), values: Array.isArray(s?.values) ? s.values.map(Number) : [] }))
    : [];
  // Fallback zu i18n finance.revenueComposition
  if (revLabels.length === 0 || revSeries.length === 0) {
    try {
      const rc = tFin.raw('revenueComposition') as unknown as { labels?: Array<string|number>; series?: Array<{ name: string; color?: string; values: number[] }> } | undefined;
      if (rc && Array.isArray(rc.labels) && Array.isArray(rc.series)) {
        revLabels = rc.labels;
        revSeries = rc.series.map((s) => ({ name: String((s as any).name ?? ''), values: Array.isArray(s.values) ? s.values.map(Number) : [] }));
      }
    } catch {}
  }
  const total = revLabels.map((_, idx) => revSeries.reduce((sum, s) => sum + (Number(s.values[idx] ?? 0)), 0));
  const revenueNarrative: string | undefined = (messages?.content?.finance?.revenueNarrative as string | undefined)
    ?? (messages?.bp?.finance?.revenueNarrative as string | undefined);

  // Optional: Annahmenliste (finance.assumptions) aus i18n – nur anzeigen, wenn vorhanden
  const finAssumptions: string[] = (() => {
    try {
      const raw = tFin.raw('assumptions') as unknown;
      return Array.isArray(raw) ? (raw as string[]) : [];
    } catch { return []; }
  })();
  // Optional: Annahmentabelle (finance.assumptionsTable) aus i18n – nur anzeigen, wenn vorhanden
  const finAssumptionsTable: { headers?: string[]; rows?: (string|number)[][] } = (() => {
    try {
      const raw = tFin.raw('assumptionsTable') as any;
      const headers = Array.isArray(raw?.headers) ? raw.headers as string[] : [];
      const rows = Array.isArray(raw?.rows) ? raw.rows as (string|number)[][] : [];
      return { headers, rows };
    } catch { return { headers: [], rows: [] }; }
  })();

  // Hinweis: Formatter werden in Client-Wrappern gekapselt, damit keine Funktionen von Server zu Client gereicht werden

  // Branding-Palette für Charts
  const brandPalette = [
    'var(--color-emerald-500)',
    'var(--color-rose-500)',
    'var(--color-sky-500)',
    'var(--color-violet-500)',
    'var(--color-amber-500)',
    'var(--color-teal-500)'
  ];

  // Nummernformatierer (lokal), ohne Nachkommastellen
  const nf = new Intl.NumberFormat(locale.startsWith('de') ? 'de' : 'en', { maximumFractionDigits: 0 });

  // Lokalisierte Seriennamen
  const sRevenue = tBp('series.revenue');
  const sCosts = tBp('series.costs');
  const sOperating = tBp('series.operating');
  const sInvesting = tBp('series.investing');
  const sFinancing = tBp('series.financing');

  // Helper: parse KPI display strings (e.g., "€40+ Mrd", "45–60%", "€25–40 Mio", "2028") to CountUp props
  // For ranges like 25–40 or 45-60%, we animate to the mean value
  const parseKpiValue = (raw: string): { to: number; prefix?: string; suffix?: string; decimals?: number } => {
    const s = String(raw).trim();
    let prefix = '';
    let suffix = '';
    let decimals = 0;
    // Detect ranges first (supports hyphen '-' or en dash '–')
    const rangeMatch = s.match(/([0-9]+(?:[.,][0-9]+)?)\s*[–-]\s*([0-9]+(?:[.,][0-9]+)?)/);
    // Percent
    const percentMatch = s.match(/([0-9]+(?:[.,][0-9]+)?)\s*%/);
    if (percentMatch) {
      if (rangeMatch) {
        const a = parseFloat(rangeMatch[1].replace(',', '.'));
        const b = parseFloat(rangeMatch[2].replace(',', '.'));
        const mean = (a + b) / 2;
        return { to: mean, suffix: '%', decimals };
      }
      const num = parseFloat(percentMatch[1].replace(',', '.'));
      return { to: num, suffix: '%', decimals };
    }
    // Euro amounts with Mio/Mrd and optional plus sign or range
    if (s.includes('€')) {
      prefix = '€';
      const isMio = /Mio/.test(s);
      const isMrd = /Mrd/.test(s);
      const hasPlus = /\+/.test(s);
      if (isMio) suffix = `${hasPlus ? '+' : ''} Mio`;
      else if (isMrd) suffix = `${hasPlus ? '+' : ''} Mrd`;
      else if (hasPlus) suffix = '+';
      // If range present, use mean; else use last number
      if (rangeMatch) {
        const a = parseFloat(rangeMatch[1].replace(',', '.'));
        const b = parseFloat(rangeMatch[2].replace(',', '.'));
        const mean = (a + b) / 2;
        decimals = /[.,]/.test(rangeMatch[1]) || /[.,]/.test(rangeMatch[2]) ? 1 : 0;
        return { to: mean, prefix, suffix: suffix.trim() ? ` ${suffix.trim()}` : '', decimals };
      }
      const lastNumberMatch = s.match(/([0-9]+(?:[.,][0-9]+)?)(?!.*[0-9])/);
      const num = lastNumberMatch ? parseFloat(lastNumberMatch[1].replace(',', '.')) : 0;
      decimals = /[.,]/.test(lastNumberMatch?.[1] ?? '') ? 1 : 0;
      return { to: num, prefix, suffix: suffix.trim() ? ` ${suffix.trim()}` : '', decimals };
    }
    // Pure year or number
    const yearMatch = s.match(/\b(20[0-9]{2}|19[0-9]{2})\b/);
    if (yearMatch) {
      return { to: parseInt(yearMatch[1], 10) };
    }
    const anyRange = rangeMatch;
    if (anyRange) {
      const a = parseFloat(anyRange[1].replace(',', '.'));
      const b = parseFloat(anyRange[2].replace(',', '.'));
      const mean = (a + b) / 2;
      decimals = /[.,]/.test(anyRange[1]) || /[.,]/.test(anyRange[2]) ? 1 : 0;
      return { to: mean, decimals };
    }
    const anyNumber = s.match(/([0-9]+(?:[.,][0-9]+)?)/);
    if (anyNumber) {
      const num = parseFloat(anyNumber[1].replace(',', '.'));
      decimals = /[.,]/.test(anyNumber[1]) ? 1 : 0;
      return { to: num, decimals };
    }
    return { to: 0 };
  };

  // Revenue vs Costs (multi-line)
  const revCostMsg = (messages?.content?.finance?.revenueVsCost as any) ?? (messages?.bp?.finance?.revenueVsCost as any);
  const revCostSeries = (() => {
    try {
      const toPoints = (arr: any[]) =>
        Array.isArray(arr)
          ? arr.map((it: any) => ({ label: (it?.label ?? it?.[0]) as string | number, value: Number(it?.value ?? it?.[1] ?? 0) }))
          : [];
      const revenue = toPoints(revCostMsg?.revenue ?? []);
      const costs = toPoints(revCostMsg?.costs ?? []);
      const series = [
        { name: sRevenue, color: brandPalette[0], points: revenue },
        { name: sCosts, color: brandPalette[1], points: costs },
      ];
      return series.filter((s) => Array.isArray(s.points) && s.points.length > 0);
    } catch { return [] as any[]; }
  })();

  // Break-even (single-line) – prefer localized content, fallback to bp.tables.finance.breakEven
  const beMsg = (messages?.content?.finance?.breakEven as any) ?? (messages?.bp?.tables?.finance?.breakEven as any) ?? [];
  const breakEvenSeries = (() => {
    try {
      const points = Array.isArray(beMsg)
        ? beMsg.map((it: any) => ({ label: (it?.label ?? it?.[0]) as string | number, value: Number(it?.value ?? it?.[1] ?? 0) }))
        : [];
      return points.length > 0
        ? [{ name: tBp('headings.breakEven', { defaultMessage: 'Break-even' }) as string, color: brandPalette[5], points }]
        : [];
    } catch { return [] as any[]; }
  })();

  // Cash Flow (operating/investing/financing) as multi-line
  const cashFlowMsg = (messages?.content?.finance?.cashFlow as any) ?? (messages?.bp?.finance?.cashFlow as any);
  const cashFlowSeries = (() => {
    try {
      const toPoints = (arr: any[]) =>
        Array.isArray(arr)
          ? arr.map((it: any) => ({ label: (it?.label ?? it?.[0]) as string | number, value: Number(it?.value ?? it?.[1] ?? 0) }))
          : [];
      const operating = toPoints(cashFlowMsg?.operating ?? []);
      const investing = toPoints(cashFlowMsg?.investing ?? []);
      const financing = toPoints(cashFlowMsg?.financing ?? []);
      const series = [
        { name: sOperating, color: brandPalette[2], points: operating },
        { name: sInvesting, color: brandPalette[3], points: investing },
        { name: sFinancing, color: brandPalette[4], points: financing },
      ];
      return series.filter((s) => Array.isArray(s.points) && s.points.length > 0);
    } catch { return [] as any[]; }
  })();

  // Profit Bridge (waterfall)
  const profitBridgeSteps = ((): { label: string | number; value: number; type?: string; color?: string }[] => {
    try {
      const steps = (messages?.content?.finance?.profitBridgeSteps ?? messages?.bp?.finance?.profitBridgeSteps) as any[] | undefined;
      return Array.isArray(steps) ? steps.map((s) => ({
        label: (s?.label ?? s?.[0]) as string | number,
        value: Number(s?.value ?? s?.[1] ?? 0),
        type: typeof s?.type === 'string' ? s.type : undefined,
        color: typeof s?.color === 'string' ? s.color : undefined,
      })) : [];
    } catch { return []; }
  })();

  // Use of Funds (Years)
  const uof = fin?.useOfFundsYears as { headers?: string[]; rows?: (string|number)[][] } | undefined;
  const uofHeaders = Array.isArray(uof?.headers) ? uof.headers! : [];
  const uofRows = Array.isArray(uof?.rows) ? uof.rows! : [];

  // EBITDA by year (from content.financePlanDetailed)
  const ebitda = (messages?.content?.financePlanDetailed?.ebitdaByYear as any) ?? {};
  const ebitdaHeaders = Array.isArray(ebitda?.headers) ? ebitda.headers : [];
  const ebitdaRows = Array.isArray(ebitda?.rows) ? ebitda.rows : [];
  const ebitdaTitle = String(ebitda?.title ?? (locale.startsWith('de') ? 'EBITDA nach Jahr' : 'EBITDA by year'));

  // CAPEX/OPEX (detailliert) aus content.financePlanDetailed
  const capexOpex = (messages?.content?.financePlanDetailed?.capexOpex as any) ?? {};
  const capexRows: (string|number)[][] = Array.isArray(capexOpex?.CAPEX) ? capexOpex.CAPEX as (string|number)[][] : [];
  const opexRows: (string|number)[][] = Array.isArray(capexOpex?.OPEX) ? capexOpex.OPEX as (string|number)[][] : [];
  const capexOpexHeaders = [tBp('tables.headers.category'), tBp('tables.headers.amount')];

  // Hardware-Breakdown aus content.costPlan
  const hardwareBreakdown = (messages?.content?.costPlan?.hardwareBreakdown as any) ?? {};
  const hwHeaders: string[] = Array.isArray(hardwareBreakdown?.headers) ? hardwareBreakdown.headers as string[] : [];
  const hwRows: (string|number)[][] = Array.isArray(hardwareBreakdown?.rows) ? hardwareBreakdown.rows as (string|number)[][] : [];
  const hwTitle: string = typeof hardwareBreakdown?.title === 'string' ? hardwareBreakdown.title as string : (locale.startsWith('de') ? 'Hardware‑Details (k€)' : 'Hardware details (k€)');

  

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="prose prose-sm max-w-none [font-feature-settings:'ss01','ss02','liga','clig','tnum']">
        <h1 className="section-title font-semibold tracking-tight leading-tight text-[--color-foreground-strong]">
          {chapterTitle}
        </h1>
        {financeIntro ? (
          <p className="mt-2 text-[13px] md:text-[14px] leading-relaxed text-[--color-foreground] opacity-90">
            {financeIntro}
          </p>
        ) : null}

        {/* KPI Cards (dezent & edel) – vereinheitlichte kpi-card Optik wie Kap. 1/2 */}
        <SectionDelay delayMs={0}>
          <div className="not-prose mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {[
              { id: 'market2030', t: tBp('kpis.market2030'), v: tBp('kpisValues.market2030'), s: tBp('kpisSub.market2030') },
              { id: 'breakEven', t: tBp('kpis.breakEven'), v: tBp('kpisValues.breakEvenYear'), s: tBp('kpisSub.breakEven') },
              { id: 'cagr', t: tBp('kpis.cagr'), v: tBp('kpisValues.cagr'), s: tBp('kpisSub.cagr') },
              { id: 'revenue2030', t: tBp('kpis.revenue2030'), v: tBp('kpisValues.revenue2030'), s: tBp('kpisSub.revenue2030') },
            ].map((k, i) => (
              <ElegantCard
                key={i}
                className="h-full"
                innerClassName="relative h-full min-h-[156px] rounded-[12px] bg-[--color-surface] p-4 md:p-5 lg:p-6"
                ariaLabel={`${k.t as string} KPI Card`}
                role="group"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-[10px] md:text-[11px] tracking-wide uppercase mb-2 text-[--color-foreground-muted]">
                    {(() => {
                      const Icon = k.id === 'market2030' ? TrendingUp : k.id === 'cagr' ? BarChart3 : k.id === 'revenue2030' ? CircleDollarSign : CheckCircle2;
                      return <Icon className="h-3.5 w-3.5 text-[--color-foreground-muted]" aria-hidden />;
                    })()}
                    <span>{k.t as unknown as string}</span>
                  </div>
                  {/* Visual-Slot */}
                  <div className="mb-3.5 kpi-visual">
                    {k.id === 'cagr' ? (
                      <MiniBar
                        data={[10, 18, 27, 35, 53]}
                        height={KPI_BAR_HEIGHT}
                        color={'var(--color-amber-500)'}
                        bg={'rgba(245,158,11,0.12)'}
                        delay={getKpiDelay(i)}
                        duration={KPI_ANIM_DURATION}
                        className="w-full"
                      />
                    ) : k.id === 'market2030' ? (
                      <MiniSparkline
                        data={[28, 32, 36, 40, 44]}
                        height={KPI_SPARK_HEIGHT}
                        delay={getKpiDelay(i)}
                        duration={KPI_ANIM_DURATION}
                        className="w-full"
                        colorStart={'var(--color-emerald-500)'}
                        colorEnd={'var(--color-sky-500)'}
                        showArea={false}
                        showDot
                      />
                    ) : k.id === 'revenue2030' ? (
                      <MiniSparkline
                        data={[18, 22, 27, 33, 38]}
                        height={KPI_SPARK_HEIGHT}
                        delay={getKpiDelay(i)}
                        duration={KPI_ANIM_DURATION}
                        className="w-full"
                        colorStart={'var(--color-sky-500)'}
                        colorEnd={'var(--color-violet-500)'}
                        showArea={false}
                        showDot
                      />
                    ) : (
                      <div className="h-[18px]" />
                    )}
                  </div>
                  <div className="kpi-value-row [font-feature-settings:'tnum'] [font-variant-numeric:tabular-nums] kpi-value">
                    {(() => {
                      const raw = String(k.v);
                      const { to, prefix, suffix, decimals } = parseKpiValue(raw);
                      const durationMs = COUNTUP_DURATION_MS;
                      const delayMs = getCountUpDelayMs(i);
                      const isPureYear = /^\s*(?:19|20)\d{2}\s*$/.test(raw);
                      return (
                        <span className="whitespace-normal break-words" title={raw}>
                          <CountUp
                            to={to}
                            durationMs={durationMs}
                            delayMs={delayMs}
                            prefix={prefix ?? ''}
                            suffix={suffix ?? ''}
                            decimals={decimals ?? 0}
                            locale={locale.startsWith('de') ? 'de-DE' : 'en-US'}
                            useGrouping={!isPureYear}
                          />
                        </span>
                      );
                    })()}
                  </div>
                  <div className="mx-auto mt-2 h-px w-8/12 bg-[--color-border-subtle]/25" aria-hidden />
                  <div className="mt-1.5 text-[12px] md:text-[12.5px] text-[--color-foreground] opacity-85 one-line" title={k.s as unknown as string}>
                    {k.s as unknown as string}
                  </div>
                </div>
              </ElegantCard>
            ))}
          </div>
          {/* KPI-Badges unter den Karten – harmonisiert mit Kapitel 1 */}
          {(() => {
            try {
              const de = locale.startsWith('de');
              const mv: any = (messages?.bp?.market?.volume ?? {});
              const svcCagr = typeof mv?.service?.cagr === 'string' ? mv.service.cagr : undefined;
              const humCagr = typeof mv?.humanoid?.cagr === 'string' ? mv.humanoid.cagr : undefined;
              const cagrService = svcCagr ? (de ? `CAGR (Service): ${svcCagr}` : `CAGR (Service): ${svcCagr}`) : (de ? 'CAGR (Service): ~16%' : 'CAGR (Service): ~16%');
              const cagrHumanoid = humCagr ? (de ? `CAGR (Humanoide): ${humCagr}` : `CAGR (Humanoids): ${humCagr}`) : (de ? 'CAGR (Humanoide): ~39%' : 'CAGR (Humanoids): ~39%');
              const rev2030Raw = (messages?.bp?.execFacts?.revenue2030 as string | undefined);
              const revBadge = (() => {
                if (!rev2030Raw) return de ? 'Umsatz 2030: €25–40 Mio' : 'Revenue 2030: €25–40M';
                const cleaned = rev2030Raw
                  .replace(/Umsatz\s*2030:\s*/i, '')
                  .replace(/Revenue\s*2030:\s*/i, '')
                  .trim();
                return `${cleaned} (2030)`;
              })();
              const appStoreShare = de ? 'App‑Store Split: 30%/70% (Plattform/Entwickler)' : 'App‑store split: 30%/70% (platform/developers)';
              const badges = [
                cagrService,
                cagrHumanoid,
                de ? 'Break-even 2028' : 'Break-even 2028',
                revBadge,
                appStoreShare,
                de ? 'EU AI Act & DSGVO Ready' : 'EU AI Act & GDPR Ready',
                de ? 'RaaS (Robots-as-a-Service)' : 'RaaS (Robots-as-a-Service)'
              ];
              return (
                <div className="not-prose mt-3 md:mt-4 flex flex-wrap items-center justify-center gap-2.5">
                  {badges.map((k, i) => (
                    <span key={`${i}-${k || 'badge'}`} className="badge leading-none hover:bg-[--muted]/22 transition-colors">
                      {k}
                    </span>
                  ))}
                </div>
              );
            } catch {
              return null;
            }
          })()}
        </SectionDelay>

        {/* Break-even */}
        <span id="breakEven" className="sr-only" aria-hidden="true" />
        {breakEvenSeries.length > 0 && (
          <SectionDelay delayMs={400}>
            <SectionHeader>
              <CardTitle title={locale.startsWith('de') ? 'Indikativ, interne Planung' : 'Indicative, internal planning'} className="not-prose text-[28px] md:text-[32px] leading-tight font-semibold tracking-tight text-[--color-foreground]">
                {`${chapterIndex}.1 – ${tBp('headings.breakEven') as string}`}
              </CardTitle>
            </SectionHeader>
            {(() => {
              const desc = tBp('figures.breakEvenDescription');
              return desc ? (
                <p className="mt-1 text-sm leading-relaxed text-[--color-foreground-muted]">{desc as unknown as string}</p>
              ) : null;
            })()}
            <SectionBody>
              <div className="flex justify-center">
                <MultiLineEuroChartClient
                  series={breakEvenSeries as any}
                  ariaLabel={tBp('headings.breakEven') as string}
                  responsive
                  height={260}
                  locale={locale}
                  yTicksCount={5}
                />
              </div>
            </SectionBody>
          </SectionDelay>
        )}
        {/* Einheitlicher Abstand zwischen Sektionen */}
        <div aria-hidden className="not-prose my-8 md:my-12" />

        {/* Use of Funds (Years) */}
        <span id="useOfFunds" className="sr-only" aria-hidden="true" />

        {/* CAPEX / OPEX (detailliert) */}
        <span id="capexOpex" className="sr-only" aria-hidden="true" />
        {(capexRows.length > 0 || opexRows.length > 0) && (
          <SectionDelay delayMs={1200}>
            <SectionHeader>
              <CardTitle className="not-prose text-[28px] md:text-[32px] leading-tight font-semibold tracking-tight text-[--color-foreground]">
                {`${chapterIndex}.3 – ${tBp('headings.capexOpex') as string}`}
              </CardTitle>
            </SectionHeader>
            <div className="grid gap-3 md:grid-cols-2 mb-4 md:mb-6">
              {capexRows.length > 0 && (
                <div>
                  <h4 className="text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">CAPEX</h4>
                  <TableSimple headers={capexOpexHeaders} rows={capexRows} animateRows stagger={0.03} zebra denseRows emphasizeFirstCol />
                </div>
              )}
              {opexRows.length > 0 && (
                <div>
                  <h4 className="text-[13px] md:text-[14px] font-medium mb-1 text-[--color-foreground]">OPEX</h4>
                  <TableSimple headers={capexOpexHeaders} rows={opexRows} animateRows stagger={0.03} zebra denseRows emphasizeFirstCol />
                </div>
              )}
            </div>
          </SectionDelay>
        )}

        {/* Hardware‑Breakdown (Cost Plan) */}
        <span id="hardwareBreakdown" className="sr-only" aria-hidden="true" />
        {hwRows.length > 0 && (
          <SectionDelay delayMs={1600}>
            <SectionHeader>
              <CardTitle className="not-prose text-[28px] md:text-[32px] leading-tight font-semibold tracking-tight text-[--color-foreground]">
                {`${chapterIndex}.4 – ${hwTitle}`}
              </CardTitle>
            </SectionHeader>
            <SectionBody>
              <TableSimple
                headers={hwHeaders.length > 0 ? hwHeaders : capexOpexHeaders}
                rows={hwRows}
                animateRows
                stagger={0.03}
                zebra
                denseRows
                emphasizeFirstCol
              />
            </SectionBody>
          </SectionDelay>
        )}

        {/* Revenue Mix */}
        <span id="revenueStreams" className="sr-only" aria-hidden="true" />
        {revLabels.length > 0 && revSeries.length > 0 && (
          <SectionDelay delayMs={800}>
            <SectionHeader>
              <CardTitle title={locale.startsWith('de') ? 'Indikativ, interne Planung' : 'Indicative, internal planning'} className="not-prose text-[28px] md:text-[32px] leading-tight font-semibold tracking-tight text-[--color-foreground]">
                {`${chapterIndex}.5 – ${tBp('headings.revenueStreams') as string}`}
              </CardTitle>
            </SectionHeader>
            {revenueNarrative ? (
              <p className="mt-1 text-sm leading-relaxed text-[--color-foreground-muted]">{revenueNarrative}</p>
            ) : null}
            <SectionBody>
              <div className="flex justify-center">
                <RevenueMixChart
                  labels={revLabels}
                  series={revSeries as any}
                  total={total}
                  titleBar={tBp('headings.revenueStreams')}
                  titleLine={locale.startsWith('de') ? 'Gesamtumsatz' : 'Total Revenue'}
                  locale={locale}
                  palette={brandPalette}
                />
              </div>
            </SectionBody>
            {(() => {
              try {
                if (!Array.isArray(revLabels) || revLabels.length === 0 || !Array.isArray(revSeries) || revSeries.length === 0) return null;
                const li = revLabels.length - 1;
                const totals = revSeries.reduce((acc: number, s) => acc + (Number(s.values?.[li] ?? 0)), 0);
                if (!totals) return null;
                const parts = revSeries.map((s) => ({ name: s.name, pct: Math.round(((Number(s.values?.[li] ?? 0)) / totals) * 100) }));
                const line = parts.map((p) => `${p.name}: ${p.pct}%`).join(' • ');
                return (
                  <div className="not-prose mt-1.5 mb-3 md:mb-4 text-[11px] md:text-[11.5px] text-center text-[--color-foreground-muted]">
                    {line}
                  </div>
                );
              } catch { return null; }
            })()}
          </SectionDelay>
        )}

        {/* Use of Funds (Years) */}
        {uofHeaders.length > 0 && uofRows.length > 0 && (
          <SectionDelay delayMs={1200}>
            <SectionHeader>
              <CardTitle className="not-prose text-[28px] md:text-[32px] leading-tight font-semibold tracking-tight text-[--color-foreground]">
                {`${chapterIndex}.2 – ${tBp('headings.useOfFunds') as string}`}
              </CardTitle>
            </SectionHeader>
            <SectionBody>
              <TableSimple
                headers={uofHeaders}
                rows={uofRows.map((r: any[]) => r.map((c) => (typeof c === 'number' ? nf.format(c) : String(c))))}
                className="mt-1.5 min-w-[640px] bg-transparent ring-0 shadow-none"
                animateRows
                rowVariant="fadeInUp"
                stagger={0.04}
                zebra
                denseRows
              />
            </SectionBody>
          </SectionDelay>
        )}

        {/* Revenue vs. Costs */}
        <span id="revenueVsCost" className="sr-only" aria-hidden="true" />
        {/* Großer Abstand vor nächster Sektion */}
        <div aria-hidden className="not-prose my-8 md:my-12" />
        {revCostSeries.length > 0 && (
          <SectionDelay delayMs={1600}>
            <SectionHeader>
              <CardTitle title={locale.startsWith('de') ? 'Indikativ, interne Planung' : 'Indicative, internal planning'} className="not-prose text-[28px] md:text-[32px] leading-tight font-semibold tracking-tight text-[--color-foreground]">
                {`${chapterIndex}.6 – ${tBp('headings.revenueVsCost') as string}`}
              </CardTitle>
            </SectionHeader>
            {(() => {
              const desc = tBp('figures.revenueVsCostDescription');
              return desc ? (
                <p className="mt-1 text-sm leading-relaxed text-[--color-foreground-muted]">{desc as unknown as string}</p>
              ) : null;
            })()}
            <SectionBody>
              <div className="flex justify-center">
                <MultiLineEuroChartClient
                  series={revCostSeries as any}
                  ariaLabel={tBp('headings.revenueVsCost') as string}
                  responsive
                  height={260}
                  locale={locale}
                  yTicksCount={5}
                />
              </div>
            </SectionBody>
          </SectionDelay>
        )}

        {/* Cash Flow */}
        <span id="cashFlow" className="sr-only" aria-hidden="true" />
        {/* Großer Abstand vor nächster Sektion */}
        <div aria-hidden className="not-prose my-8 md:my-12" />
        {cashFlowSeries.length > 0 && (
          <SectionDelay delayMs={2000}>
            <SectionHeader>
              <CardTitle title={locale.startsWith('de') ? 'Indikativ, interne Planung' : 'Indicative, internal planning'} className="not-prose text-[28px] md:text-[32px] leading-tight font-semibold tracking-tight text-[--color-foreground]">
                {`${chapterIndex}.7 – ${tBp('headings.cashFlow') as string}`}
              </CardTitle>
            </SectionHeader>
            {(() => {
              const desc = tBp('figures.cashFlowDescription');
              return desc ? (
                <p className="mt-1 text-sm leading-relaxed text-[--color-foreground-muted]">{desc as unknown as string}</p>
              ) : null;
            })()}
            <SectionBody>
              <div className="flex justify-center">
                <MultiLineEuroChartClient
                  series={cashFlowSeries as any}
                  ariaLabel={tBp('headings.cashFlow') as string}
                  responsive
                  height={260}
                  showArea
                  locale={locale}
                  yTicksCount={5}
                />
              </div>
            </SectionBody>
          </SectionDelay>
        )}

        {/* Profit Bridge (Waterfall) */}
        <span id="profitBridge" className="sr-only" aria-hidden="true" />
        {/* Großer Abstand vor nächster Sektion */}
        <div aria-hidden className="not-prose my-8 md:my-12" />
        {profitBridgeSteps.length > 0 && (
          <SectionDelay delayMs={2400}>
            <SectionHeader>
              <CardTitle title={locale.startsWith('de') ? 'Indikativ, interne Planung' : 'Indicative, internal planning'} className="not-prose text-[28px] md:text-[32px] leading-tight font-semibold tracking-tight text-[--color-foreground]">
                {`${chapterIndex}.8 – ${tBp('headings.profitBridge') as string}`}
              </CardTitle>
            </SectionHeader>
            <SectionBody>
              <div className="flex justify-center">
                <WaterfallEuroChartClient
                  steps={profitBridgeSteps as any}
                  ariaLabel={tBp('headings.profitBridge') as string}
                  responsive
                  height={280}
                  locale={locale}
                  yTicksCount={5}
                />
              </div>
            </SectionBody>
          </SectionDelay>
        )}

        {/* EBITDA by Year */}
        <span id="ebitda" className="sr-only" aria-hidden="true" />
        {/* Großer Abstand vor nächster Sektion */}
        <div aria-hidden className="not-prose my-8 md:my-12" />
        {ebitdaHeaders.length > 0 && ebitdaRows.length > 0 && (
          <SectionDelay delayMs={2800}>
            <div className="mb-2">
              <CardTitle title={locale.startsWith('de') ? 'Indikativ, interne Planung' : 'Indicative, internal planning'} className="not-prose text-[28px] md:text-[32px] leading-tight font-semibold tracking-tight text-[--color-foreground]">
                {`${chapterIndex}.9 – ${ebitdaTitle || (tBp('headings.plOverview') as string)}`}
              </CardTitle>
            </div>
            <div className="mb-4 md:mb-6">
              <TableSimple
                headers={ebitdaHeaders}
                rows={ebitdaRows.map((r: any[]) => r.map((c) => (typeof c === 'number' ? nf.format(c) : String(c))))}
                className="mt-1.5 md:mt-2.5 min-w-[420px] bg-transparent ring-0 shadow-none"
                animateRows
                rowVariant="fadeInUp"
                stagger={0.04}
                zebra
                denseRows
              />
            </div>
          </SectionDelay>
        )}

        {/* Revenue Forecast */}
        <span id="revenueForecast" className="sr-only" aria-hidden="true" />
        {/* Großer Abstand vor nächster Sektion */}
        <div aria-hidden className="not-prose my-8 md:my-12" />
        {Array.isArray(fin?.revenueForecast) && fin.revenueForecast.length > 0 && (
          <SectionDelay delayMs={3200}>
            <div className="mb-2">
              <CardTitle className="not-prose text-[28px] md:text-[32px] leading-tight font-semibold tracking-tight text-[--color-foreground]">
                {`${chapterIndex}.10 – ${locale.startsWith('de') ? 'Umsatzprognose' : 'Revenue Forecast'}`}
              </CardTitle>
            </div>
            <div className="grid gap-2 sm:gap-2.5 lg:gap-3 items-stretch sm:grid-cols-2 lg:grid-cols-3 mb-4 md:mb-6">
              {fin.revenueForecast.map((x: any, i: number) => (
                <ElegantCard
                  key={i}
                  className="h-full"
                  innerClassName="relative h-full min-h-[64px] rounded-[12px] bg-[--color-surface] p-3 md:p-3.5"
                  ariaLabel={`${tBp('headings.revenueForecast') as string} Item`}
                  role="group"
                >
                  <div className="flex items-start gap-2">
                    <span aria-hidden className="h-4 w-4 mt-0.5 inline-flex items-center justify-center text-emerald-600">✓</span>
                    <span className="text-[13px] md:text-[14px] leading-relaxed text-[--color-foreground]">{typeof x === 'string' ? x : String(x)}</span>
                  </div>
                </ElegantCard>
              ))}
            </div>
          </SectionDelay>
        )}

        {/* Revenue Table (simple) */}
        <span id="revenueTable" className="sr-only" aria-hidden="true" />
        {Array.isArray(fin?.revenueTable) && fin.revenueTable.length > 0 && (
          <SectionDelay delayMs={3600}>
            <div className="mb-2">
              <CardTitle className="not-prose text-[28px] md:text-[32px] leading-tight font-semibold tracking-tight text-[--color-foreground]">
                {`${chapterIndex}.11 – ${locale.startsWith('de') ? 'Umsatztabelle' : 'Revenue Table'}`}
              </CardTitle>
            </div>
            <div className="mb-4 md:mb-6">
              <TableSimple
                rows={fin.revenueTable.map((r: any[]) => r.map((c) => (typeof c === 'number' ? nf.format(c) : String(c))))}
                className="mt-1.5 md:mt-2.5 min-w-[520px] bg-transparent ring-0 shadow-none"
                animateRows
                rowVariant="fadeInUp"
                stagger={0.04}
                zebra
                denseRows
                emphasizeFirstCol
              />
            </div>
          </SectionDelay>
        )}

        {/* Capital Needs */}
        <span id="fundraising" className="sr-only" aria-hidden="true" />
        {Array.isArray(fin?.capitalNeeds) && fin.capitalNeeds.length > 0 && (
          <SectionDelay delayMs={4000}>
            <div className="mb-2">
              <CardTitle className="not-prose text-[28px] md:text-[32px] leading-tight font-semibold tracking-tight text-[--color-foreground]">
                {`${chapterIndex}.12 – ${tBp('headings.fundraising') as string}`}
              </CardTitle>
            </div>
            <div className="grid gap-2 sm:gap-2.5 lg:gap-3 items-stretch sm:grid-cols-2 lg:grid-cols-3 mb-4 md:mb-6">
              {fin.capitalNeeds.map((x: any, i: number) => (
                <ElegantCard
                  key={i}
                  className="h-full"
                  innerClassName="relative h-full min-h-[64px] rounded-[12px] bg-[--color-surface] p-3 md:p-3.5"
                  ariaLabel={`${tBp('headings.fundraising') as string} Item`}
                  role="group"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle2 aria-hidden className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                    <span className="text-[13px] md:text-[14px] leading-relaxed text-[--color-foreground]">{typeof x === 'string' ? x : String(x)}</span>
                  </div>
                </ElegantCard>
              ))}
            </div>
          </SectionDelay>
        )}

        {/* Funding */}
        <span id="capTable" className="sr-only" aria-hidden="true" />
        {Array.isArray(fin?.funding) && fin.funding.length > 0 && (
          <SectionDelay delayMs={4400}>
            <div className="mb-2">
              <CardTitle className="not-prose text-[28px] md:text-[32px] leading-tight font-semibold tracking-tight text-[--color-foreground]">
                {`${chapterIndex}.13 – ${tBp('sections.capTable') as string}`}
              </CardTitle>
            </div>
            <div className="grid gap-2 sm:gap-2.5 lg:gap-3 items-stretch sm:grid-cols-2 lg:grid-cols-3 mb-4 md:mb-6">
              {fin.funding.map((x: any, i: number) => (
                <ElegantCard
                  key={i}
                  className="h-full"
                  innerClassName="relative h-full min-h-[64px] rounded-[12px] bg-[--color-surface] p-3 md:p-3.5"
                  ariaLabel={`${tBp('sections.capTable') as string} Item`}
                  role="group"
                >
                  <div className="flex items-start gap-2">
                    <span aria-hidden className="h-4 w-4 mt-0.5 inline-flex items-center justify-center text-emerald-600">✓</span>
                    <span className="text-[13px] md:text-[14px] leading-relaxed text-[--color-foreground]">{typeof x === 'string' ? x : String(x)}</span>
                  </div>
                </ElegantCard>
              ))}
            </div>
          </SectionDelay>
        )}

        {/* Funding Strategy */}
        <span id="projections" className="sr-only" aria-hidden="true" />
        {Array.isArray(fin?.fundingStrategy) && fin.fundingStrategy.length > 0 && (
          <SectionDelay delayMs={4800}>
            <div className="mb-2">
              <CardTitle className="not-prose text-[28px] md:text-[32px] leading-tight font-semibold tracking-tight text-[--color-foreground]">
                {`${chapterIndex}.14 – ${tBp('headings.projections') as string}`}
              </CardTitle>
            </div>
            <div className="grid gap-1.5 sm:gap-2.5 lg:gap-3 items-stretch sm:grid-cols-2 lg:grid-cols-3 mb-4 md:mb-6">
              {fin.fundingStrategy.map((x: any, i: number) => (
                <ElegantCard
                  key={i}
                  className="h-full"
                  innerClassName="relative h-full min-h-[64px] rounded-[12px] bg-[--color-surface] p-3 md:p-3.5"
                  ariaLabel={`${tBp('headings.projections') as string} Item`}
                  role="group"
                >
                  <div className="flex items-start gap-2">
                    <span aria-hidden className="h-4 w-4 mt-0.5 inline-flex items-center justify-center text-emerald-600">✓</span>
                    <span className="text-[13px] md:text-[14px] leading-relaxed text-[--color-foreground]">{typeof x === 'string' ? x : String(x)}</span>
                  </div>
                </ElegantCard>
              ))}
            </div>
          </SectionDelay>
        )}

        {/* Submission Plan (Einreichplan) */}
        <span id="submissionsPlan" className="sr-only" aria-hidden="true" />
        {Array.isArray((bpAny?.finance as any)?.submissionsPlan) && ((bpAny?.finance as any)?.submissionsPlan as any[]).length > 0 && (
          <SectionDelay delayMs={5000}>
            <div className="mb-2">
              <CardTitle className="not-prose text-[28px] md:text-[32px] leading-tight font-semibold tracking-tight text-[--color-foreground]">
                {`${chapterIndex}.15 – ${tBp('headings.submissionsPlan') as string}`}
              </CardTitle>
            </div>
            <div className="mb-4 md:mb-6">
              <TableSimple
                headers={[
                  locale.startsWith('de') ? 'Programm' : 'Program',
                  locale.startsWith('de') ? 'Agentur' : 'Agency',
                  locale.startsWith('de') ? 'Partner?' : 'Partner?',
                  locale.startsWith('de') ? 'Betrag' : 'Amount',
                  locale.startsWith('de') ? 'Co‑Fin (%)' : 'Co‑fin (%)',
                  locale.startsWith('de') ? 'Zeitraum' : 'Timeline',
                  'WPs',
                  locale.startsWith('de') ? 'Unterlagen' : 'Docs',
                ]}
                rows={((bpAny?.finance as any)?.submissionsPlan as any[]).map((p: any) => [
                  String(p?.program ?? ''),
                  String(p?.agency ?? ''),
                  p?.partnerRequired ? (locale.startsWith('de') ? 'Ja' : 'Yes') : (locale.startsWith('de') ? 'Nein' : 'No'),
                  String(p?.requestedAmount ?? ''),
                  String(p?.cofinancingPct ?? ''),
                  String(p?.timeline ?? ''),
                  Array.isArray(p?.workPackages) ? p.workPackages.join(', ') : '',
                  Array.isArray(p?.docs) ? p.docs.slice(0, 2).join(' • ') + (Array.isArray(p?.docs) && p.docs.length > 2 ? ' …' : '') : '',
                ])}
                animateRows
                rowVariant="fadeInUp"
                stagger={0.03}
                zebra
                denseRows
                emphasizeFirstCol
                className="mt-1.5 min-w-[720px] bg-transparent ring-0 shadow-none"
              />
            </div>
          </SectionDelay>
        )}

        {/* Funding Summary (computed) */}
        <span id="fundingSummary" className="sr-only" aria-hidden="true" />
        {Array.isArray((bpAny?.finance as any)?.submissionsPlan) && ((bpAny?.finance as any)?.submissionsPlan as any[]).length > 0 && estTotalBudget > 0 && (
          <SectionDelay delayMs={5200}>
            <div className="mb-2">
              <CardTitle className="not-prose text-[28px] md:text-[32px] leading-tight font-semibold tracking-tight text-[--color-foreground]">
                {`${chapterIndex}.16 – ${locale.startsWith('de') ? 'Finanzierungsübersicht (indikativ)' : 'Funding summary (indicative)'}`}
              </CardTitle>
            </div>
            <div className="grid gap-2.5 sm:gap-3 lg:gap-3.5 items-stretch sm:grid-cols-2 lg:grid-cols-4 mb-4 md:mb-6">
              {[{label: locale.startsWith('de') ? 'Gesamter Zuschuss (Mittelwerte)' : 'Total grants (midpoints)', value: `€${nf.format(totalGrantsMid)}`},
                {label: locale.startsWith('de') ? 'Geschätztes Gesamtbudget' : 'Estimated total budget', value: `€${nf.format(estTotalBudget)}`},
                {label: locale.startsWith('de') ? `Eigenmittel (${equityPct}%)` : `Equity (${equityPct}%)`, value: `€${nf.format(estEquity)}`},
                {label: locale.startsWith('de') ? `Investoren (${investorPct}%)` : `Investors (${investorPct}%)`, value: `€${nf.format(estInvestors)}`}].map((k, i) => (
                <ElegantCard
                  key={`fs-${i}`}
                  className="h-full"
                  innerClassName="relative h-full min-h-[72px] rounded-[12px] bg-[--color-surface] p-3 md:p-3.5"
                  ariaLabel={`Funding Summary ${i+1}`}
                  role="group"
                >
                  <div className="text-[11px] md:text-[12px] text-[--color-foreground-muted]">{k.label}</div>
                  <div className="text-[18px] md:text-[20px] font-semibold">{k.value}</div>
                </ElegantCard>
              ))}
            </div>
            <div className="mt-2 text-[11px] text-[--color-foreground-muted]">
              {locale.startsWith('de')
                ? 'Hinweis: Summen aus Bandbreiten (Mittelwerte), Gesamtbudget aus Zuschussquote abgeleitet.'
                : 'Note: Totals from midpoints of ranges; total budget derived from grants ratio.'}
            </div>
          </SectionDelay>
        )}

        {/* Annahmen (Liste) – optional */}
        <span id="assumptions" className="sr-only" aria-hidden="true" />
        {Array.isArray(finAssumptions) && finAssumptions.length > 0 && (
          <SectionDelay delayMs={5600}>
            <div className="mb-2">
              <CardTitle className="not-prose text-[28px] md:text-[32px] leading-tight font-semibold tracking-tight text-[--color-foreground]">
                {`${chapterIndex}.17 – ${locale.startsWith('de') ? 'Annahmen' : 'Assumptions'}`}
              </CardTitle>
            </div>
            <ul className="list-none pl-0 space-y-1.5 mb-4 md:mb-6">
              {finAssumptions.map((a, i) => (
                <li key={`ass-${i}`} className="text-[13px] md:text-[14px] text-[--color-foreground] opacity-90 leading-relaxed">{a}</li>
              ))}
            </ul>
          </SectionDelay>
        )}

        {/* Annahmen (Tabelle) – optional */}
        <span id="assumptionsTable" className="sr-only" aria-hidden="true" />
        {Array.isArray(finAssumptionsTable?.headers) && finAssumptionsTable.headers!.length > 0 && Array.isArray(finAssumptionsTable?.rows) && finAssumptionsTable.rows!.length > 0 && (
          <SectionDelay delayMs={6000}>
            <div className="mb-2">
              <CardTitle className="not-prose text-[28px] md:text-[32px] leading-tight font-semibold tracking-tight text-[--color-foreground]">
                {`${chapterIndex}.18 – ${locale.startsWith('de') ? 'Annahmen (Tabelle)' : 'Assumptions (Table)'}`}
              </CardTitle>
            </div>
            <div className="mb-4 md:mb-6">
              <TableSimple
                headers={finAssumptionsTable.headers as string[]}
                rows={finAssumptionsTable.rows as (string|number)[][]}
                animateRows
                stagger={0.03}
                zebra
                denseRows
                emphasizeFirstCol
              />
            </div>
          </SectionDelay>
        )}
      </div>
    </div>
  );
}
