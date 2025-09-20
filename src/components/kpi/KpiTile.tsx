import React from 'react';
import { cn } from '@/lib/utils';
import ElegantCard from '@/components/ui/ElegantCard';

export type KpiTileProps = {
  label: string;
  value?: string | number | undefined;
  subtitle?: string | undefined;
  trend?: string | undefined; // e.g., "+15% MoM" oder "-1%p"
  className?: string | undefined;
  children?: React.ReactNode;
  as?: 'div' | 'li';
  'aria-label'?: string;
};

/**
 * Barrierearme KPI-Kachel ohne Animation, Dark/Light über CSS-Variablen.
 */
export default function KpiTile({ label, value, subtitle, trend, className, children, as = 'div', ...rest }: KpiTileProps) {
  const Comp: any = as;
  return (
    <Comp className={cn('text-[--color-foreground] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary] h-full', className)} {...rest}>
      <ElegantCard innerClassName="rounded-[12px] bg-[--color-surface] p-3 md:p-4 h-full min-h-[156px]">
        <div className="h-full flex flex-col justify-between gap-1">
          <div className="text-[10px] md:text-[11px] font-medium uppercase tracking-wide opacity-85 one-line">{label}</div>
          <div className="text-[15px] md:text-[16px] font-semibold [font-feature-settings:'tnum'] [font-variant-numeric:tabular-nums] leading-snug">
            {value != null && value !== '' ? value : '—'}
          </div>
          <div className="mt-1 space-y-0.5">
            {subtitle ? (
              <div className="text-[10.5px] md:text-[11.5px] opacity-75 one-line">{subtitle}</div>
            ) : null}
            {trend ? (
              <div className="text-[10.5px] md:text-[11.5px] opacity-75 one-line" aria-live="polite">{trend}</div>
            ) : null}
            {children}
          </div>
        </div>
      </ElegantCard>
    </Comp>
  );
}
