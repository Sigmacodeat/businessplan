"use client";
import Chapter from "./Chapter";
import TableSimple from "@ui/TableSimple";
import type { WorkPackageItem, WorkPackagesLabels } from "@components/chapters/types/work-packages";
import ElegantCard from "@/components/ui/ElegantCard";

export default function WorkPackagesDetailedChapter({
  id,
  title,
  note,
  headersEffort,
  items,
  labels,
}: {
  id: string;
  title: string;
  note?: string;
  headersEffort: (string | number)[] | undefined;
  items: WorkPackageItem[];
  labels?: WorkPackagesLabels;
}) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const fmtK = (v?: number) => (typeof v === "number" ? `${v.toFixed(0)}k` : v === 0 ? "0" : "-");
  const L: WorkPackagesLabels = labels ?? {
    objectives: "Ziele",
    scope: "Scope",
    deliverables: "Deliverables",
    dependencies: "Abhängigkeiten",
    effort: "FTE",
    personMonths: "PM",
    trl: "TRL",
    risks: "Risiken",
    mitigation: "Mitigation",
    kpis: "KPIs",
    milestones: "Milestones",
    budget: "Budget",
    budgetPersonnel: "Begründung Personal",
    budgetMaterial: "Begründung Sachkosten",
    budgetSubcontracting: "Begründung Fremdleistungen",
    budgetOther: "Begründung Sonstiges",
    wp: "WP",
    role: "Rolle",
    fte: "FTE",
    pm: "PM",
  };

  return (
    <Chapter
      id={id}
      title={title}
      avoidBreakInside
      variant="fadeIn"
      headingVariant="fadeInUp"
      contentVariant="fadeInUp"
      dense
      className="p-0 ring-0 bg-transparent"
      noContainer
      noOuterPadding
      noInnerPadding
      compactHeading
      noBorder
    >
      {typeof note === 'string' && note ? (
        <p className="text-[13px] md:text-sm text-[--color-foreground-muted] mb-3 md:mb-4 leading-relaxed">{note}</p>
      ) : null}
      <div className="space-y-4 md:space-y-5">
        {items.map((wp) => (
          <div key={wp.id} className="avoid-break-inside">
            <ElegantCard innerClassName="rounded-2xl p-5 md:p-6 bg-[--color-surface]">
              <h3
                className="m-0 text-[17px] md:text-lg font-semibold text-[--color-foreground] pb-1 tracking-tight no-accent not-prose"
              >
                {wp.id} – {wp.name}
              </h3>
              <div className="mt-2 h-px w-full bg-slate-300/40 dark:bg-slate-600/30" aria-hidden />
              {wp.timeframe && (
                <div className="text-[12.5px] md:text-xs text-[--color-foreground-muted] mt-1">{wp.timeframe}</div>
              )}

              {/* Ziele & Scope */}
              <div className="mt-3 grid gap-2 md:gap-2.5 md:grid-cols-2">
                {Array.isArray(wp.objectives) && wp.objectives.length > 0 && (
                  <div>
                    <div className="text-[12.5px] md:text-[13px] font-medium mb-1.5 tracking-tight">{L.objectives}</div>
                    <ul className="list-disc pl-5 space-y-1 marker:text-white text-[--color-foreground] opacity-95 text-[12.5px] md:text-[13px]">
                      {wp.objectives.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(wp.scope) && wp.scope.length > 0 && (
                  <div>
                    <div className="text-[12.5px] md:text-[13px] font-medium mb-1.5 tracking-tight">{L.scope}</div>
                    <ul className="list-disc pl-5 space-y-1 marker:text-white text-[--color-foreground] opacity-95 text-[12.5px] md:text-[13px]">
                      {wp.scope.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Deliverables & Dependencies */}
              <div className="mt-4 grid gap-2.5 md:gap-3 md:grid-cols-2">
                {Array.isArray(wp.deliverables) && wp.deliverables.length > 0 && (
                  <div>
                    <div className="text-[12.5px] md:text-[13px] font-medium mb-1.5 tracking-tight">{L.deliverables}</div>
                    <ul className="list-disc pl-5 space-y-1 marker:text-white text-[--color-foreground] opacity-95 text-[12.5px] md:text-[13px]">
                      {wp.deliverables.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(wp.dependencies) && wp.dependencies.length > 0 && (
                  <div>
                    <div className="text-[12.5px] md:text-[13px] font-medium mb-1.5 tracking-tight">{L.dependencies}</div>
                    <div className="text-[12.5px] md:text-[13px] leading-relaxed">{wp.dependencies.join(", ")}</div>
                  </div>
                )}
              </div>

              {/* Effort (FTE) */}
              {Array.isArray(wp.effort) && wp.effort.length > 0 && (
                <div className="mt-4">
                  <TableSimple
                    headers={(headersEffort ?? [L.wp, L.role, L.fte]) as (string | number | null)[]}
                    rows={wp.effort.map((e) => [wp.id, e.role, e.fte])}
                    animateRows
                    rowVariant="fadeInUp"
                    stagger={0.04}
                    denseRows
                    zebra={false}
                    emphasizeFirstCol
                    className="rounded-lg ring-1 ring-slate-300/40 dark:ring-slate-600/30 bg-[--color-surface]/60"
                  />
                </div>
              )}

              {/* Personmonate (PM) */}
              {Array.isArray(wp.personMonths) && wp.personMonths.length > 0 && (
                <div className="mt-4">
                  <TableSimple
                    headers={[L.wp, L.role, L.pm]}
                    rows={wp.personMonths.map((e) => [wp.id, e.role, e.pm])}
                    animateRows
                    rowVariant="fadeInUp"
                    stagger={0.04}
                    denseRows
                    zebra={false}
                    emphasizeFirstCol
                    className="rounded-lg ring-1 ring-slate-300/40 dark:ring-slate-600/30 bg-[--color-surface]/60"
                  />
                </div>
              )}

              {/* TRL Start/Ziel */}
              {wp.trl && typeof wp.trl.start === 'number' && typeof wp.trl.target === 'number' ? (
                <div className="mt-3 text-[13px] md:text-sm text-[--color-foreground-muted]">
                  <span className="font-medium text-[--color-foreground]">{L.trl}:</span>{' '}
                  {`Start TRL ${wp.trl.start} → Ziel TRL ${wp.trl.target}`}
                </div>
              ) : null}

              {/* Risiken & Mitigation */}
              <div className="mt-4 grid gap-2.5 md:gap-3 md:grid-cols-2">
                {Array.isArray(wp.risks) && wp.risks.length > 0 && (
                  <div>
                    <div className="text-[12.5px] md:text-[13px] font-medium mb-1.5 tracking-tight">{L.risks}</div>
                    <ul className="list-disc pl-5 space-y-1 marker:text-white text-[--color-foreground] opacity-95 text-[12.5px] md:text-[13px]">
                      {wp.risks.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(wp.mitigations) && wp.mitigations.length > 0 && (
                  <div>
                    <div className="text-[12.5px] md:text-[13px] font-medium mb-1.5 tracking-tight">{L.mitigation}</div>
                    <ul className="list-disc pl-5 space-y-1 marker:text-white text-[--color-foreground] opacity-95 text-[12.5px] md:text-[13px]">
                      {wp.mitigations.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* KPIs & Milestones */}
              <div className="mt-4 grid gap-2.5 md:gap-3 md:grid-cols-2">
                {Array.isArray(wp.kpis) && wp.kpis.length > 0 && (
                  <div>
                    <div className="text-[12.5px] md:text-[13px] font-medium mb-1.5 tracking-tight">{L.kpis}</div>
                    <ul className="list-disc pl-5 space-y-1 marker:text-white text-[--color-foreground] opacity-95 text-[12.5px] md:text-[13px]">
                      {wp.kpis.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(wp.milestones) && wp.milestones.length > 0 && (
                  <div>
                    <div className="text-[12.5px] md:text-[13px] font-medium mb-1.5 tracking-tight">{L.milestones}</div>
                    <ul className="list-disc pl-5 space-y-1 marker:text-white text-[--color-foreground] opacity-95 text-[12.5px] md:text-[13px]">
                      {wp.milestones.map((m, i) => (
                        <li key={i}>{m.label} – M{m.month}{m.acceptance ? ` (${m.acceptance})` : ''}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Budget */}
              {wp.budget && (
                <div className="mt-3 text-[13px] md:text-sm text-[--color-foreground-muted] leading-relaxed">
                  <span className="font-medium text-[--color-foreground]">{L.budget}: </span>
                  {`Personal ${fmtK(wp.budget.personnel)} | Sachkosten ${fmtK(wp.budget.material)} | Fremdleistungen ${fmtK(wp.budget.subcontracting)} | Sonstiges ${fmtK(wp.budget.other)}`}
                </div>
              )}

              {/* Budget-Begründung */}
              {wp.budgetJustification && (
                <div className="mt-3 grid gap-2.5 md:gap-3 md:grid-cols-2 text-[13px] md:text-sm">
                  {wp.budgetJustification.personnel ? (
                    <div>
                      <div className="font-medium tracking-tight">{L.budgetPersonnel}</div>
                      <p className="mt-1 text-[--color-foreground-muted] leading-relaxed">{wp.budgetJustification.personnel}</p>
                    </div>
                  ) : null}
                  {wp.budgetJustification.material ? (
                    <div>
                      <div className="font-medium tracking-tight">{L.budgetMaterial}</div>
                      <p className="mt-1 text-[--color-foreground-muted] leading-relaxed">{wp.budgetJustification.material}</p>
                    </div>
                  ) : null}
                  {wp.budgetJustification.subcontracting ? (
                    <div>
                      <div className="font-medium tracking-tight">{L.budgetSubcontracting}</div>
                      <p className="mt-1 text-[--color-foreground-muted] leading-relaxed">{wp.budgetJustification.subcontracting}</p>
                    </div>
                  ) : null}
                  {wp.budgetJustification.other ? (
                    <div>
                      <div className="font-medium tracking-tight">{L.budgetOther}</div>
                      <p className="mt-1 text-[--color-foreground-muted] leading-relaxed">{wp.budgetJustification.other}</p>
                    </div>
                  ) : null}
                </div>
              )}
            </ElegantCard>
          </div>
        ))}
      </div>
    </Chapter>
  );
}
