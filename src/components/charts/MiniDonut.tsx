"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import CountUp from "@/components/charts/CountUp";

export type MiniDonutProps = {
  value: number; // 0..1
  size?: number; // px
  strokeWidth?: number; // px
  color?: string; // Fallback-Farbe, wenn kein Gradient
  bg?: string; // Hintergrund-Track
  delay?: number;
  duration?: number; // Sekunden (Animation)
  className?: string;
  rounded?: boolean; // runde Endkappen
  title?: string; // optionaler <title>
  ariaLabel?: string;
  ariaLabelledBy?: string;
  // Premium-Options (neu)
  gradient?: boolean; // verlaufender Stroke
  colorStart?: string; // Startfarbe des Gradients
  colorEnd?: string; // Endfarbe des Gradients
  glow?: boolean; // weicher Glow um den Stroke
  showValue?: boolean; // Prozent im Zentrum rendern
  valueColor?: string;
  valueSize?: number; // px
  formatValue?: (v: number) => string; // z. B. v=>`${Math.round(v*100)}%`
};

export default function MiniDonut({
  value,
  size = 18,
  strokeWidth = 3,
  color = "var(--color-accent-3)",
  bg = "color-mix(in oklab, var(--color-foreground-strong) 10%, transparent)",
  delay = 0,
  duration = 1.6,
  className,
  rounded = true,
  title,
  ariaLabel,
  ariaLabelledBy,
  gradient = true,
  colorStart = "var(--color-primary)",
  colorEnd = "var(--color-primary-dark)",
  glow = true,
  showValue = false,
  valueColor = "var(--color-foreground)",
  valueSize = 10,
  formatValue,
}: MiniDonutProps) {
  const prefersReduced = useReducedMotion();
  const id = React.useId();
  // Guards
  const safeSize = Number.isFinite(size) && size > 0 ? size : 18;
  const safeStroke = Number.isFinite(strokeWidth) && strokeWidth > 0 ? strokeWidth : 3;
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

  const { radius, circ } = React.useMemo(() => {
    const r = Math.max(0, (safeSize - safeStroke) / 2);
    return { radius: r, circ: 2 * Math.PI * r };
  }, [safeSize, safeStroke]);
  const cap = rounded ? "round" : "butt";
  const animDelay = prefersReduced ? 0 : delay;
  const spring = prefersReduced
    ? { duration: 0 }
    : { type: "spring", stiffness: 140, damping: 22, mass: 0.6, delay: animDelay } as const;

  const renderValue = showValue && !prefersReduced;

  return (
    <svg
      width={safeSize}
      height={safeSize}
      viewBox={`0 0 ${safeSize} ${safeSize}`}
      className={className}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        {gradient ? (
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colorStart} />
            <stop offset="100%" stopColor={colorEnd} />
          </linearGradient>
        ) : null}
        {glow ? (
          <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ) : null}
      </defs>

      {/* Hintergrund-Track */}
      <circle
        cx={safeSize / 2}
        cy={safeSize / 2}
        r={radius}
        stroke={bg}
        strokeWidth={safeStroke}
        fill="none"
      />
      {/* Premium feiner Outer-Ring */}
      <circle
        cx={safeSize / 2}
        cy={safeSize / 2}
        r={radius + 0.6}
        stroke={"color-mix(in oklab, var(--color-foreground-strong) 10%, transparent)"}
        strokeWidth={0.8}
        fill="none"
        opacity={0.25}
      />

      {/* Wertbogen */}
      <motion.circle
        cx={safeSize / 2}
        cy={safeSize / 2}
        r={radius}
        stroke={gradient ? `url(#${id}-grad)` : color}
        strokeWidth={safeStroke}
        fill="none"
        strokeLinecap={cap}
        transform={`rotate(-90 ${safeSize / 2} ${safeSize / 2})`}
        style={{ strokeDasharray: circ, filter: glow ? `url(#${id}-glow)` : undefined }}
        initial={prefersReduced ? false : { strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - clamped) }}
        transition={spring}
      />

      {/* Zentraler Wert (optional) */}
      {renderValue ? (
        <motion.g
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: animDelay + 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <text
            x="50%"
            y="50%"
            dominantBaseline="central"
            textAnchor="middle"
            fill={valueColor}
            fontSize={valueSize}
            style={{ fontWeight: 600 }}
          >
            <CountUp
              to={Math.round(clamped * 100)}
              durationMs={Math.round(duration * 1000)}
              delayMs={Math.round(animDelay * 1000)}
              decimals={0}
              prefix=""
              suffix={formatValue ? "" : "%"}
            />
            {formatValue ? formatValue(clamped) : null}
          </text>
        </motion.g>
      ) : null}
    </svg>
  );
}
