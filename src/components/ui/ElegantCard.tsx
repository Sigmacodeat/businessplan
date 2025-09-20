"use client";

import React from "react";
import clsx from "clsx";

export type ElegantCardProps = {
  children: React.ReactNode;
  className?: string | undefined;
  innerClassName?: string | undefined;
  as?: React.ElementType | undefined;
  rounded?: string | undefined; // e.g. 'rounded-[14px]'
  gradient?: boolean | undefined;
  role?: string | undefined;
  ariaLabel?: string | undefined;
};

/**
 * ElegantCard – edle Gradient-Border-Card mit feinem Inner-Shadow.
 * - Gradient-Rahmen außen, dezenter Ring + Surface innen
 * - Perfekt für Executive Summary / Highlights
 */
export default function ElegantCard({
  children,
  className,
  innerClassName,
  as = "div",
  rounded = "rounded-[14px]",
  gradient = true,
  role,
  ariaLabel,
}: ElegantCardProps) {
  const OuterTag: any = as ?? 'div';
  return (
    <div
      className={clsx(
        "relative",
        // Use the same rounding on the outer wrapper to align gradient border with inner
        rounded,
        gradient &&
          // Fine gradient border and deeper ambient shadow to match the reference
          "p-[1px] bg-gradient-to-br from-[rgba(255,255,255,0.08)] via-[rgba(255,255,255,0.03)] to-transparent shadow-[0_12px_40px_rgba(0,0,0,0.35),0_2px_8px_rgba(0,0,0,0.2)]",
        className
      )}
    >
      <OuterTag
        className={clsx(
          // Inner surface with subtle ring for structure, as in the original Executive Summary
          "relative ring-1 ring-[color:var(--color-border)]/50 bg-[--color-surface]",
          rounded,
          innerClassName
        )}
        role={role}
        aria-label={ariaLabel}
      >
        {children}
        {/* Subtle inner top highlight (original look) */}
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" />
        {/* Bottom vignette for depth */}
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-transparent via-transparent to-[rgba(0,0,0,0.08)]" />
      </OuterTag>
    </div>
  );
}
