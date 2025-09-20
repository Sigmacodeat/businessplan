"use client";

import React from "react";

export interface DonutGaugeProps {
  value: number; // 0..1000 (wir clampen)
  size?: number | undefined; // px
  stroke?: number | undefined; // px
  color?: string | undefined; // rgba/hex
  trackColor?: string | undefined;
  label?: string | undefined;
  ariaLabel?: string | undefined;
}

/**
 * Leichtgewichtige, animierte Donut-Gauge für Prozent-/Wachstumswerte.
 * Keine externen Abhängigkeiten, reine SVG-Animation via CSS/inline styles.
 */
export default function DonutGauge({ value, size = 120, stroke = 10, color = "#10b981", trackColor = "rgba(148,163,184,0.25)", label, ariaLabel }: DonutGaugeProps) {
  const v = Math.max(0, Math.min(1000, Number.isFinite(value) ? value : 0));
  const pct = v; // 0..1000 möglich; wir mappen >100 auf volle 100% + Badge
  const radius = Math.max(6, (size - stroke) / 2);
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.max(0, Math.min(100, pct));
  const dash = (clampedPct / 100) * circumference;
  const rest = Math.max(0, circumference - dash);
  const over = pct > 100 ? Math.min(900, Math.round(pct - 100)) : 0;

  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={ariaLabel ?? label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block" aria-hidden>
        <g transform={`rotate(-90 ${size/2} ${size/2})`}>
          <circle cx={size/2} cy={size/2} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
          <circle
            cx={size/2}
            cy={size/2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${rest}`}
            style={{ transition: "stroke-dasharray 600ms cubic-bezier(.45,.05,.55,.95)" }}
          />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
        <span className="text-[13px] font-semibold text-[--color-foreground-strong] tracking-[-0.02em]">{Math.round(clampedPct)}%</span>
        {label && <span className="text-[10.5px] text-[--color-foreground]/80 mt-0.5">{label}</span>}
      </div>
      {over > 0 && (
        <span className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/35">
          +{over}
        </span>
      )}
    </div>
  );
}
