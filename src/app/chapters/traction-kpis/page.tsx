import type { Metadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';
import { chapters } from '../chapters.config';
import { buildLocalePath } from '@/i18n/path';
import SectionNote from '@components/chapters/shared/SectionNote';
import KpiTile from '@components/kpi/KpiTile';
import { tractionData, fmtCurrencyEUR, fmtPercent, computeLtvCacMultiple, computePaybackMonths } from '@/app/data/metrics';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const index = Math.max(0, chapters.findIndex((c) => c.slug === 'traction-kpis')) + 1;
  return {
    robots: { index: false, follow: true },
    alternates: { canonical: buildLocalePath(locale, `/chapters/${index}`) },
  };
}

export default async function TractionKPIsPage() {
  const tBp = await getTranslations('bp');
  const locale = await getLocale();
  const chapterIndex = Math.max(0, chapters.findIndex((c) => c.slug === 'traction-kpis')) + 1;
  const chapterTitle = `${locale.startsWith('de') ? 'Kapitel' : 'Chapter'} ${chapterIndex} – ${tBp('sections.tractionKpis', { defaultMessage: 'Traction & KPIs' })}`;

  // Zentral gepflegte, reale/indikative Daten
  const td = tractionData;
  const live = td.live;
  const econ = td.economics;
  const ltvCac = econ ? computeLtvCacMultiple(econ) : undefined;
  const payback = econ ? computePaybackMonths(econ) : undefined;

  return (
    <div className="space-y-6">
      <div className="prose prose-sm max-w-none [font-feature-settings:'ss01','ss02','liga','clig','tnum'] px-3 sm:px-0">
        <h1 className="section-title font-semibold tracking-tight leading-tight text-[--color-foreground-strong]">
          {chapterTitle}
        </h1>
        <span id="traction" className="sr-only" aria-hidden="true" />

        {/* Einleitung */}
        {td.intro ? (
          <p className="mt-3 text-[14px] sm:text-[13px] md:text-[14px] text-[--color-foreground] opacity-90 leading-relaxed">{td.intro}</p>
        ) : null}

        {/* Highlights */}
        {Array.isArray(td.highlights) && td.highlights.length > 0 ? (
          <section aria-labelledby="highlights-heading" className="mt-4">
            <span id="highlights" className="sr-only" aria-hidden="true" />
            <h2 id="highlights-heading" className="sr-only">Highlights</h2>
            <ul className="not-prose list-disc pl-5 space-y-2 sm:space-y-1 text-[14px] sm:text-[13px] md:text-[14px] text-[--color-foreground]">
              {td.highlights.map((h, i) => (
                <li key={i} className="leading-relaxed -ml-1 pl-1">{h}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Live-Kennzahlen – nur wenn Daten vorhanden */}
        {live ? (
          <section aria-labelledby="live-metrics-heading" className="mt-5">
            <span id="live-metrics" className="sr-only" aria-hidden="true" />
            <div className="not-prose text-[13px] sm:text-[12px] md:text-[13px] text-[--color-foreground-muted] mb-2">Live-Kennzahlen</div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3" role="list" aria-labelledby="live-metrics-heading">
              <KpiTile as="li" aria-label="Units" label="Units" value={live.units != null ? live.units : undefined} subtitle="aktive Roboter" trend={fmtPercent(live.unitsMoM, { sign: true })} />
              <KpiTile as="li" aria-label="MRR" label="MRR" value={fmtCurrencyEUR(live.mrrEur)} subtitle="monatlich" trend={fmtPercent(live.mrrMoM, { sign: true })} />
              <KpiTile as="li" aria-label="NRR" label="NRR" value={live.nrrPct != null ? `${live.nrrPct}%` : undefined} subtitle={live.nrrTrend ? (live.nrrTrend === 'good' ? 'Gut (≥105%)' : live.nrrTrend) : undefined} />
              <KpiTile as="li" aria-label="Churn" label="Churn" value={live.churnPct != null ? `${live.churnPct}%` : undefined} subtitle="monatlich" trend={live.churnDeltaPct != null ? `${live.churnDeltaPct > 0 ? '+' : ''}${live.churnDeltaPct}%p` : undefined} />
              <KpiTile as="li" aria-label="Uptime" label="Uptime" value={live.uptimePct != null ? `${live.uptimePct}%` : undefined} subtitle="SLO" trend={live.uptimeDeltaPct != null ? `${live.uptimeDeltaPct > 0 ? '+' : ''}${live.uptimeDeltaPct}%` : undefined} />
              <KpiTile as="li" aria-label="Adoption" label="Adoption" value={live.adoptionPct != null ? `${live.adoptionPct}%` : undefined} subtitle="aktive Skills/Kunde (MoM)" trend={fmtPercent(live.adoptionMoM, { sign: true })} />
            </ul>
          </section>
        ) : null}

        {/* Methodik */}
        {Array.isArray(td.methodology) && td.methodology.length > 0 ? (
          <section aria-labelledby="methodology-heading" className="mt-5">
            <span id="kpi-explainer" className="sr-only" aria-hidden="true" />
            <span id="methodology" className="sr-only" aria-hidden="true" />
            <div className="not-prose text-[12px] md:text-[13px] text-[--color-foreground-muted] mb-2">Methodik</div>
            <ul id="methodology-heading" className="not-prose list-disc pl-5 space-y-2 sm:space-y-1 text-[14px] sm:text-[13px] md:text-[14px] text-[--color-foreground]">
              {td.methodology.map((m, i) => <li key={i} className="leading-relaxed -ml-1 pl-1">{m}</li>)}
            </ul>
          </section>
        ) : null}

        {/* Evidenzen */}
        {Array.isArray(td.evidence) && td.evidence.length > 0 ? (
          <section aria-labelledby="evidence-heading" className="mt-4">
            <span id="evidence" className="sr-only" aria-hidden="true" />
            <div className="not-prose text-[13px] sm:text-[12px] md:text-[13px] text-[--color-foreground-muted] mb-2">Evidenzen</div>
            <ul id="evidence-heading" className="not-prose list-disc pl-5 space-y-2 sm:space-y-1 text-[14px] sm:text-[13px] md:text-[14px] text-[--color-foreground]">
              {td.evidence.map((e, i) => <li key={i} className="leading-relaxed -ml-1 pl-1">{e}</li>)}
            </ul>
          </section>
        ) : null}

        {/* Deliverables */}
        {Array.isArray(td.deliverables) && td.deliverables.length > 0 ? (
          <section aria-labelledby="deliverables-heading" className="mt-4">
            <span id="deliverables" className="sr-only" aria-hidden="true" />
            <div className="not-prose text-[13px] sm:text-[12px] md:text-[13px] text-[--color-foreground-muted] mb-2">Deliverables bis Q4</div>
            <ul id="deliverables-heading" className="not-prose list-disc pl-5 space-y-1 text-[13px] md:text-[14px] text-[--color-foreground]">
              {td.deliverables.map((d, i) => <li key={i} className="leading-relaxed">{d}</li>)}
            </ul>
          </section>
        ) : null}

        {/* Economics – Payback & LTV/CAC */}
        {econ && (payback != null || ltvCac != null) ? (
          <section aria-labelledby="economics-heading" className="mt-5">
            <span id="economics" className="sr-only" aria-hidden="true" />
            <div className="not-prose text-[12px] md:text-[13px] text-[--color-foreground-muted] mb-2">Economics</div>
            <p className="not-prose text-[11px] md:text-[12px] text-[--color-foreground] opacity-75 mb-2">Plan (indikativ) – Herleitung siehe Methodik.</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list">
              {payback != null ? (
                <KpiTile as="li" aria-label="Payback" label="Payback" value={`${payback} Monate`} subtitle={econ.cacEur ? `CAC ${fmtCurrencyEUR(econ.cacEur)}` : undefined} />
              ) : null}
              {ltvCac != null ? (
                <KpiTile as="li" aria-label="LTV/CAC" label="LTV/CAC" value={`${ltvCac}x`} subtitle={econ.ltvContributionEur ? `LTV (Beitrag) ${fmtCurrencyEUR(econ.ltvContributionEur)}` : undefined} />
              ) : null}
            </ul>
          </section>
        ) : null}

        {/* Owner & Aktualisierung */}
        {td.owner ? (
          <div className="not-prose mt-5 text-[11px] md:text-[12px] text-[--color-foreground] opacity-75">
            <span id="owner" className="sr-only" aria-hidden="true" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-start gap-1.5 md:gap-3">
              <span><strong>Owner:</strong> {td.owner.team}</span>
              <span className="hidden md:inline">•</span>
              <span><strong>Aktualisierung:</strong> {td.owner.update}</span>
            </div>
          </div>
        ) : null}

        {/* Benchmarks/Quellen – nur Quellen, keine Dummy-Werte */}
        <span id="benchmarks" className="sr-only" aria-hidden="true" />
        <SectionNote
          useDe={locale.startsWith('de')}
          size="xs"
          className="max-w-4xl"
          de={(
            <span>
              Benchmarks (SaaS, indikativ): Bruttomarge typ. 70–80%, LTV/CAC Ziel &gt;5x, CAC kanalabhängig. Quellen: {' '}
              <a className="text-blue-600 dark:text-blue-400 hover:underline" href="https://www.highalpha.com/2024-saas-benchmarks-report" target="_blank" rel="noreferrer noopener">High Alpha/OpenView 2024</a>,{' '}
              <a className="text-blue-600 dark:text-blue-400 hover:underline" href="https://wundertalent.co.uk/saas-ltvcac-benchmark/" target="_blank" rel="noreferrer noopener">LTV/CAC Benchmarks</a>.
            </span>
          )}
          en={(
            <span>
              Benchmarks (SaaS, indicative): gross margin typically 70–80%, LTV/CAC target &gt;5x, CAC depends on channel. Sources: {' '}
              <a className="text-blue-600 dark:text-blue-400 hover:underline" href="https://www.highalpha.com/2024-saas-benchmarks-report" target="_blank" rel="noreferrer noopener">High Alpha/OpenView 2024</a>,{' '}
              <a className="text-blue-600 dark:text-blue-400 hover:underline" href="https://wundertalent.co.uk/saas-ltvcac-benchmark/" target="_blank" rel="noreferrer noopener">LTV/CAC benchmarks</a>.
            </span>
          )}
        />
      </div>

      {/* Print is handled globally in chapters layout */}
    </div>
  );
}
