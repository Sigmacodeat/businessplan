"use client";
import Chapter from "./Chapter";
import Subsection from "./Subsection";
import FinanceKPIs from "../sections/FinanceKPIs";
import TableSimple from "@ui/TableSimple";
import LineEuroChartClient from "./LineEuroChartClient";
import BarEuroChartClient from "./BarEuroChartClient";
import BreakEvenChartAnimated, { type BEPoint } from "@charts/BreakEvenChartAnimated";
import MultiLineChartAnimated, { type SeriesPoint } from "@charts/MultiLineChartAnimated";
import WaterfallChartAnimated, { type WaterfallStep } from "@charts/WaterfallChartAnimated";
import StackedBarAnimated, { type StackedSeries } from "@charts/StackedBarAnimated";
import { useTranslations } from "next-intl";
import { seriesColors } from "@/components/charts/theme";

export type TableRow = (string | number)[];

export default function FinanceChapter({
  id,
  title,
  summary,
  unitEconomicsTitle,
  useOfFundsTitle,
  useOfFundsCaption,
  useOfFundsHeaders,
  useOfFundsRows,
  useOfFundsOutcomeHeader,
  useOfFundsOutcomes,
  fundraising,
  scenariosTitle,
  scenariosHeaders,
  scenariosRows,
  scenariosDescription,
  runwayTitle,
  runwayHeaders,
  runwayRows,
  runwayDescription,
  plOverviewTitle,
  plHeaders,
  plRows,
  detailedPersonnelTitle,
  detailedPersonnelHeaders,
  detailedPersonnelRows,
  capexOpexTitle,
  capexOpexHeaders,
  capexOpexBreakdown,
  capexOpexDescription,
  totalsTitle,
  totalsHeaders,
  totalsRows,
  totalsDescription,
  revenueTitle,
  revenueHeaders,
  revenueRows,
  revenueDescription,
  ebitdaTitle,
  ebitdaHeaders,
  ebitdaRows,
  ebitdaDescription,
  fundingStrategyTitle,
  fundingStrategy,
  capexOpexSingleTitle,
  capexOpexRows,
  breakEvenTitle,
  breakEvenData,
  breakEvenDescription,
  revenueVsCostTitle,
  revenueVsCost,
  revenueVsCostDescription,
  revenueCompositionTitle,
  revenueComposition,
  revenueCompositionDescription,
  profitBridgeTitle,
  profitBridgeSteps,
  profitBridgeDescription,
  cashFlowTitle,
  cashFlowSeries,
  cashFlowDescription,
  cashFlowLabels,
}: {
  id: string;
  title: string;
  summary: string[];
  unitEconomicsTitle: string;
  useOfFundsTitle: string;
  useOfFundsCaption?: string;
  useOfFundsHeaders: string[];
  useOfFundsRows: TableRow[];
  useOfFundsOutcomeHeader?: string;
  useOfFundsOutcomes?: Array<string | number>;
  fundraising?: Record<string, string>;
  scenariosTitle: string;
  scenariosHeaders: string[];
  scenariosRows: TableRow[];
  scenariosDescription?: string;
  runwayTitle: string;
  runwayHeaders: string[];
  runwayRows: TableRow[];
  runwayDescription?: string;
  plOverviewTitle: string;
  plHeaders: string[];
  plRows: TableRow[];
  detailedPersonnelTitle?: string;
  detailedPersonnelHeaders?: string[];
  detailedPersonnelRows?: TableRow[];
  capexOpexTitle?: string;
  capexOpexHeaders?: string[];
  capexOpexBreakdown?: Record<string, TableRow[]>;
  capexOpexDescription?: string;
  totalsTitle?: string;
  totalsHeaders?: string[];
  totalsRows?: TableRow[];
  totalsDescription?: string;
  revenueTitle?: string;
  revenueHeaders?: string[];
  revenueRows?: TableRow[];
  revenueDescription?: string;
  ebitdaTitle?: string;
  ebitdaHeaders?: string[];
  ebitdaRows?: TableRow[];
  ebitdaDescription?: string;
  fundingStrategyTitle?: string;
  fundingStrategy?: string[] | Record<string, unknown>;
  // Optional: single CAPEX/OPEX table (headers + rows) coming from content.finance.capexOpex
  capexOpexSingleTitle?: string;
  capexOpexRows?: TableRow[];
  // New optional analytics charts
  breakEvenTitle?: string;
  breakEvenData?: BEPoint[];
  breakEvenDescription?: string;
  revenueVsCostTitle?: string;
  revenueVsCost?: { revenue: SeriesPoint[]; costs: SeriesPoint[] };
  revenueVsCostDescription?: string;
  // New optional: revenue composition stacked chart
  revenueCompositionTitle?: string;
  revenueComposition?: { labels: Array<string | number>; series: StackedSeries[] };
  revenueCompositionDescription?: string;
  // New optional: profit bridge (waterfall)
  profitBridgeTitle?: string;
  profitBridgeSteps?: WaterfallStep[];
  profitBridgeDescription?: string;
  // New optional: cash flow by type (operating/investing/financing)
  cashFlowTitle?: string;
  cashFlowSeries?: { operating: SeriesPoint[]; investing: SeriesPoint[]; financing: SeriesPoint[] };
  cashFlowDescription?: string;
  cashFlowLabels?: { operating: string; investing: string; financing: string };
}) {
  const t = useTranslations();
  const tBp = useTranslations('bp');
  // --- helpers for light formatting ---
  const euroShort = (n: number) => {
    const sign = n < 0 ? "-" : "";
    const v = Math.abs(n);
    if (v >= 1_000_000) return `${sign}€${(v / 1_000_000).toFixed(1)}m`;
    if (v >= 1_000) return `${sign}€${(v / 1_000).toFixed(v >= 100_000 ? 0 : 1)}k`;
    return `${sign}€${v}`;
  };
  const isMonthsRow = (label: unknown) =>
    typeof label === 'string' && /(monat|month)/i.test(label);
  const isEuroRow = (label: unknown) =>
    typeof label === 'string' && /(cash|burn|kasse|liquid|bar|budget)/i.test(label);

  // Formatter werden in den Euro-Client-Wrappern gekapselt
  return (
    <Chapter id={id} title={title} subtitle={t('chapters.finance.subtitle', { defaultMessage: 'Finance' })} headingAlign="center" pageBreakBefore avoidBreakInside variant="fadeIn" headingVariant="fadeInUp" contentVariant="fadeInUp" staggerChildren={0.06}>
      <Subsection id="finance-kpis-summary">
        <h3 className="font-semibold">{unitEconomicsTitle}</h3>
        {summary?.length ? (
          <ol className="list-decimal pl-5">
            {summary.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        ) : null}
      </Subsection>

      <Subsection id="finance-kpis" className="mt-6">
        <h3 className="font-semibold">{unitEconomicsTitle}</h3>
        <FinanceKPIs />
      </Subsection>

      <Subsection id="finance-useOfFunds" className="mt-6 max-h-[calc(100dvh-8rem)] overflow-y-auto pr-1 scrollbar-hide">
        <h3 className="font-semibold">{useOfFundsTitle}</h3>
        {Array.isArray(useOfFundsRows) && useOfFundsRows.length > 0 ? (
          (() => {
            const hasOutcomes = Array.isArray(useOfFundsOutcomes) && useOfFundsOutcomes.length === useOfFundsRows.length;
            const headers = hasOutcomes
              ? [...useOfFundsHeaders, useOfFundsOutcomeHeader ?? 'Outcome / Milestone']
              : useOfFundsHeaders;
            const rows = hasOutcomes
              ? useOfFundsRows.map((r, i) => [...r, useOfFundsOutcomes![i]])
              : useOfFundsRows;
            return (
              <TableSimple
                {...(useOfFundsCaption !== undefined ? { caption: useOfFundsCaption } : {})}
                headers={headers}
                rows={rows}
              />
            );
          })()
        ) : null}
      </Subsection>

      <Subsection id="finance-fundraising" className="mt-6">
        <h3 className="font-semibold">Fundraising</h3>
        {fundraising ? (
          <ol className="list-decimal pl-5">
            {Object.entries(fundraising).map(([k, v]) => (
              <li key={k}>
                <strong>{k}:</strong> {v}
              </li>
            ))}
          </ol>
        ) : null}
      </Subsection>

      <Subsection id="finance-detailed" className="mt-6 avoid-break-inside max-h-[calc(100dvh-8rem)] overflow-y-auto pr-1 scrollbar-hide">
        {detailedPersonnelTitle && <h3 className="font-semibold">{detailedPersonnelTitle}</h3>}
        {Array.isArray(detailedPersonnelRows) && detailedPersonnelRows.length > 0 ? (
          <TableSimple
            {...(detailedPersonnelHeaders ? { headers: detailedPersonnelHeaders as (string | number | null)[] } : {})}
            rows={detailedPersonnelRows}
            animateRows
            rowVariant="fadeInUp"
            stagger={0.05}
          />
        ) : null}
      </Subsection>

      <Subsection id="finance-capexOpex" className="mt-6 avoid-break-inside max-h-[calc(100dvh-8rem)] overflow-y-auto pr-1 scrollbar-hide">
        {capexOpexTitle && <h3 className="font-semibold">{capexOpexTitle}</h3>}
        {capexOpexDescription ? (
          <p className="mt-1 text-sm text-[--color-foreground-muted]">{capexOpexDescription}</p>
        ) : null}
        {capexOpexBreakdown && Object.keys(capexOpexBreakdown).length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(capexOpexBreakdown).map(([category, rows]) => (
              <div key={category} className="avoid-break-inside">
                <div className="mb-2 text-sm text-[--color-foreground-muted]">{category}</div>
                <TableSimple
                  {...(capexOpexHeaders ? { headers: capexOpexHeaders as (string | number | null)[] } : {})}
                  rows={rows}
                  animateRows
                  rowVariant="fadeInUp"
                  stagger={0.05}
                />
              </div>
            ))}
          </div>
        ) : null}
      </Subsection>

      {/* Optional single CAPEX/OPEX table */}
      <Subsection id="finance-capexOpex-table" className="mt-6 avoid-break-inside max-h-[calc(100dvh-8rem)] overflow-y-auto pr-1 scrollbar-hide">
        {capexOpexSingleTitle && <h3 className="font-semibold">{capexOpexSingleTitle}</h3>}
        {Array.isArray(capexOpexRows) && capexOpexRows.length > 0 ? (
          <TableSimple
            {...(capexOpexHeaders ? { headers: capexOpexHeaders as (string | number | null)[] } : {})}
            rows={capexOpexRows}
            animateRows
            rowVariant="fadeInUp"
            stagger={0.05}
          />
        ) : null}
      </Subsection>

      <Subsection id="finance-scenarios" className="mt-6 avoid-break-inside max-h-[calc(100dvh-8rem)] overflow-y-auto pr-1 scrollbar-hide">
        <h3 className="font-semibold">{scenariosTitle}</h3>
        {scenariosDescription ? (
          <p className="mt-1 text-sm text-[--color-foreground-muted]">{scenariosDescription}</p>
        ) : null}
        {Array.isArray(scenariosRows) && scenariosRows.length > 0 ? (
          <TableSimple headers={scenariosHeaders} rows={scenariosRows} animateRows rowVariant="fadeInUp" stagger={0.05} />
        ) : null}
      </Subsection>

      <Subsection id="finance-runway" className="mt-6 avoid-break-inside max-h-[calc(100dvh-8rem)] overflow-y-auto pr-1 scrollbar-hide">
        <h3 className="font-semibold">{runwayTitle}</h3>
        {runwayDescription ? (
          <p className="mt-1 text-sm text-[--color-foreground-muted]">{runwayDescription}</p>
        ) : null}
        {Array.isArray(runwayRows) && runwayRows.length > 0 ? (
          <>
            <div className="mt-3 overflow-x-auto">
              <LineEuroChartClient
                ariaLabel={(tBp('figures.runwayDescription') as string) ?? (runwayTitle ?? 'Runway')}
                data={(runwayRows as TableRow[]).map((r) => ({ label: String(r[0]), value: Number(r[1]) }))}
                width={560}
                height={220}
                showArea
                responsive
              />
            </div>
            {(() => {
              const formatted = (runwayRows as TableRow[]).map(([label, value]) => {
                if (typeof value === 'number') {
                  if (isMonthsRow(label)) return [label, `${value} m`];
                  if (isEuroRow(label)) return [label, euroShort(value)];
                }
                return [label, value];
              });
              return (
                <TableSimple headers={runwayHeaders} rows={formatted} animateRows rowVariant="fadeInUp" stagger={0.05} />
              );
            })()}
          </>
        ) : null}
      </Subsection>

      <Subsection id="finance-plOverview" className="mt-8 avoid-break-inside max-h-[calc(100dvh-8rem)] overflow-y-auto pr-1 scrollbar-hide">
        <h3 className="font-semibold">{plOverviewTitle}</h3>
        {Array.isArray(plRows) && plRows.length > 0 ? (
          <TableSimple headers={plHeaders} rows={plRows} animateRows rowVariant="fadeInUp" stagger={0.06} />
        ) : null}
      </Subsection>

      <Subsection id="finance-totals" className="mt-6 avoid-break-inside max-h-[calc(100dvh-8rem)] overflow-y-auto pr-1 scrollbar-hide">
        {totalsTitle && <h3 className="font-semibold">{totalsTitle}</h3>}
        {totalsDescription ? (
          <p className="mt-1 text-sm text-[--color-foreground-muted]">{totalsDescription}</p>
        ) : null}
        {Array.isArray(totalsRows) && totalsRows.length > 0 ? (
          <>
            {/* Animated bar chart for totals */}
            <div className="mt-3 overflow-x-auto">
              <BarEuroChartClient
                ariaLabel={(tBp('figures.totalsDescription') as string) ?? (totalsTitle ?? 'Totals')}
                data={(totalsRows as TableRow[]).map((r) => ({ label: String(r[0]), value: Number(r[1]) }))}
                width={560}
                height={220}
                responsive
              />
            </div>
            <TableSimple
              {...(totalsHeaders ? { headers: totalsHeaders as (string | number | null)[] } : {})}
              rows={totalsRows}
              animateRows
              rowVariant="fadeInUp"
              stagger={0.05}
            />
          </>
        ) : null}
      </Subsection>

      <Subsection id="finance-revenue" className="mt-6 avoid-break-inside max-h-[calc(100dvh-8rem)] overflow-y-auto pr-1 scrollbar-hide">
        {revenueTitle && <h3 className="font-semibold">{revenueTitle}</h3>}
        {revenueDescription ? (
          <p className="mt-1 text-sm text-[--color-foreground-muted]">{revenueDescription}</p>
        ) : null}
        {Array.isArray(revenueRows) && revenueRows.length > 0 ? (
          <>
            {/* Animated line chart for revenue */}
            <div className="mt-3 overflow-x-auto">
              <LineEuroChartClient
                ariaLabel={(tBp('figures.revenueDescription') as string) ?? (revenueTitle ?? 'Revenue')}
                data={(revenueRows as TableRow[]).map((r) => ({ label: String(r[0]), value: Number(r[1]) }))}
                width={560}
                height={220}
                showArea
                responsive
              />
            </div>
            <TableSimple
              {...(revenueHeaders ? { headers: revenueHeaders as (string | number | null)[] } : {})}
              rows={revenueRows}
              animateRows
              rowVariant="fadeInUp"
              stagger={0.05}
            />
          </>
        ) : null}
      </Subsection>

      <Subsection id="finance-ebitda" className="mt-6 avoid-break-inside max-h-[calc(100dvh-8rem)] overflow-y-auto pr-1 scrollbar-hide">
        {ebitdaTitle && <h3 className="font-semibold">{ebitdaTitle}</h3>}
        {ebitdaDescription ? (
          <p className="mt-1 text-sm text-[--color-foreground-muted]">{ebitdaDescription}</p>
        ) : null}
        {Array.isArray(ebitdaRows) && ebitdaRows.length > 0 ? (
          <TableSimple
            {...(ebitdaHeaders ? { headers: ebitdaHeaders as (string | number | null)[] } : {})}
            rows={ebitdaRows}
            animateRows
            rowVariant="fadeInUp"
            stagger={0.05}
          />
        ) : null}
      </Subsection>

      {/* Optional Profit Bridge (Waterfall) */}
      {profitBridgeSteps && profitBridgeSteps.length > 0 && (
        <Subsection id="finance-profitBridge" className="mt-6 avoid-break-inside max-h-[calc(100dvh-8rem)] overflow-y-auto pr-1 scrollbar-hide">
          <h3 className="font-semibold">{profitBridgeTitle ?? "Profit Bridge"}</h3>
          {profitBridgeDescription ? (
            <p className="mt-1 text-sm text-[--color-foreground-muted]">{profitBridgeDescription}</p>
          ) : null}
          <div className="mt-3 overflow-x-auto">
            {(() => {
              const colored = (profitBridgeSteps ?? []).map((s) => ({
                ...s,
                color: s.color ?? (s.type && (seriesColors.waterfall as any)[s.type] ? (seriesColors.waterfall as any)[s.type] : undefined),
              }));
              const aria = (tBp('figures.profitBridgeDescription') as string) ?? (profitBridgeTitle ?? 'Profit Bridge');
              return (
                <WaterfallChartAnimated
                  steps={colored}
                  width={560}
                  height={240}
                  responsive
                  ariaLabel={aria}
                />
              );
            })()}
          </div>
        </Subsection>
      )}

      {/* Optional Cash Flow */}
      {cashFlowSeries && Array.isArray(cashFlowSeries.operating) && cashFlowSeries.operating.length > 0 && (
        <Subsection id="finance-cashFlow" className="mt-6 avoid-break-inside max-h-[calc(100dvh-8rem)] overflow-y-auto pr-1 scrollbar-hide">
          <h3 className="font-semibold">{cashFlowTitle ?? "Cash Flow"}</h3>
          {cashFlowDescription ? (
            <p className="mt-1 text-sm text-[--color-foreground-muted]">{cashFlowDescription}</p>
          ) : null}
          <div className="mt-3 overflow-x-auto">
            <MultiLineChartAnimated
              ariaLabel={(tBp('figures.cashFlowDescription') as string) ?? (cashFlowTitle ?? "Cash Flow")}
              series={[
                { name: cashFlowLabels?.operating ?? (tBp('series.operating') as string), color: seriesColors.operating, points: cashFlowSeries.operating },
                { name: cashFlowLabels?.investing ?? (tBp('series.investing') as string), color: seriesColors.investing, points: cashFlowSeries.investing },
                { name: cashFlowLabels?.financing ?? (tBp('series.financing') as string), color: seriesColors.financing, points: cashFlowSeries.financing },
              ]}
              width={560}
              height={240}
              showArea={false}
              responsive
            />
          </div>
        </Subsection>
      )}

      {/* Optional Break-even chart */}
      <Subsection id="finance-breakEven" className="mt-6 avoid-break-inside max-h-[calc(100dvh-8rem)] overflow-y-auto pr-1 scrollbar-hide">
        {breakEvenTitle && <h3 className="font-semibold">{breakEvenTitle}</h3>}
        {breakEvenDescription ? (
          <p className="mt-1 text-sm text-[--color-foreground-muted]">{breakEvenDescription}</p>
        ) : null}
        {Array.isArray(breakEvenData) && breakEvenData.length > 0 ? (
          <div className="mt-3 overflow-x-auto">
            <BreakEvenChartAnimated ariaLabel={(tBp('figures.breakEvenDescription') as string) ?? (breakEvenTitle ?? 'Break-even')} data={breakEvenData} width={560} height={240} responsive />
          </div>
        ) : null}
      </Subsection>

      {/* Optional Revenue Composition (Stacked) */}
      {revenueComposition && revenueComposition.labels?.length > 0 && revenueComposition.series?.length > 0 && (
        <Subsection id="finance-revenue-composition" className="mt-6 avoid-break-inside max-h-[calc(100dvh-8rem)] overflow-y-auto pr-1 scrollbar-hide">
          <h3 className="font-semibold">{revenueCompositionTitle ?? "Revenue Composition"}</h3>
          {revenueCompositionDescription ? (
            <p className="mt-1 text-sm text-[--color-foreground-muted]">{revenueCompositionDescription}</p>
          ) : null}
          <div className="mt-3 overflow-x-auto">
            <StackedBarAnimated
              labels={revenueComposition.labels}
              series={revenueComposition.series}
              width={560}
              height={240}
              responsive
              ariaLabel={(tBp('figures.revenueCompositionDescription') as string) ?? (revenueCompositionTitle ?? 'Revenue Composition')}
            />
          </div>
        </Subsection>
      )}

      <Subsection id="finance-revenueVsCost" className="mt-6 avoid-break-inside max-h-[calc(100dvh-8rem)] overflow-y-auto pr-1 scrollbar-hide">
        {revenueVsCostTitle && <h3 className="font-semibold">{revenueVsCostTitle}</h3>}
        {revenueVsCostDescription ? (
          <p className="mt-1 text-sm text-[--color-foreground-muted]">{revenueVsCostDescription}</p>
        ) : null}
        {revenueVsCost && Array.isArray(revenueVsCost.revenue) && Array.isArray(revenueVsCost.costs) && revenueVsCost.revenue.length > 0 && revenueVsCost.costs.length > 0 ? (
          <div className="mt-3 overflow-x-auto">
            <MultiLineChartAnimated
              ariaLabel={(tBp('figures.revenueVsCostDescription') as string) ?? (revenueVsCostTitle ?? "Revenue vs Cost")}
              series={[
                { name: (tBp('series.revenue') as string), color: seriesColors.revenue, points: revenueVsCost.revenue },
                { name: (tBp('series.costs') as string), color: seriesColors.costs, points: revenueVsCost.costs },
              ]}
              width={560}
              height={240}
              showArea={false}
              responsive
            />
          </div>
        ) : null}
      </Subsection>

      <Subsection id="finance-fundingStrategy" className="mt-6">
        {fundingStrategyTitle && <h3 className="font-semibold">{fundingStrategyTitle}</h3>}
        {fundingStrategy ? (
          Array.isArray(fundingStrategy) ? (
            <ul className="pl-0">
              {fundingStrategy.map((line, i) => {
                const l = String(line);
                const icon = /seed/i.test(l)
                  ? '🌱'
                  : /bridge/i.test(l)
                  ? '🌉'
                  : /series\s*A/i.test(l)
                  ? '🅰️'
                  : '💡';
                return (
                  <li key={i} className="flex items-start gap-2 py-1">
                    <span aria-hidden>{icon}</span>
                    <span>{l}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="space-y-3">
              {Object.entries(fundingStrategy).map(([k, v]) => (
                <div key={k} className="rounded-lg border border-[--color-border-subtle] p-3">
                  <div className="text-sm font-medium text-[--color-foreground-muted] mb-1">{k}</div>
                  {typeof v === "string" || typeof v === "number" ? (
                    <div>{String(v)}</div>
                  ) : Array.isArray(v) ? (
                    <ul className="pl-0">
                      {v.map((it, i) => (
                        <li key={i} className="flex items-start gap-2 py-1">
                          <span aria-hidden>💡</span>
                          <span>{String(it)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : v && typeof v === "object" ? (
                    <ul className="list-none pl-0">
                      {Object.entries(v as Record<string, unknown>).map(([ik, iv]) => (
                        <li key={ik}><strong>{ik}:</strong> {String(iv)}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          )
        ) : null}
      </Subsection>


      <Subsection id="finance-riskAnalysis" className="mt-6">
        <h3 className="font-semibold">Risk Analysis & Contingency Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Technical Risks', items: [
              'Agent failure: Kubernetes health monitoring',
              'Latency spikes: FPGA acceleration fallback'
            ]},
            { title: 'Market Risks', items: [
              'B2B pilot program with 3 industrial partners',
              'Flexible pricing models'
            ]},
            { title: 'Financial Risks', items: [
              '6-month burn rate buffer',
              'Emergency bridge funding from angels'
            ]}
          ].map((cat, i) => (
            <div key={i} className="border border-[--color-border-subtle] rounded-lg p-3">
              <h4 className="font-medium mb-2">{cat.title}</h4>
              <ul className="list-disc pl-5">
                {cat.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Subsection>

    </Chapter>
  );
}
