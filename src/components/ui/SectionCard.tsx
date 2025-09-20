"use client";

import React from "react";
import ElegantCard from "@/components/ui/ElegantCard";
import clsx from "clsx";

export type SectionCardProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  rounded?: string; // e.g. 'rounded-[14px]'
  gradient?: boolean;
  role?: string;
  ariaLabel?: string;
  headerClassName?: string;
  bodyClassName?: string;
};

/**
 * SectionCard – Wiederverwendbare Card mit Header, Divider und Body-Padding
 * Spiegelt 1:1 die Executive-Summary-Card (Header-Padding, Divider, Body-Padding)
 */
export default function SectionCard({
  title,
  children,
  className,
  innerClassName,
  rounded = "rounded-[14px]",
  gradient = true,
  role,
  ariaLabel,
  headerClassName,
  bodyClassName,
}: SectionCardProps) {
  return (
    <ElegantCard
      className={className}
      innerClassName={clsx("", innerClassName)}
      rounded={rounded}
      gradient={gradient}
      role={role}
      ariaLabel={ariaLabel}
    >
      <div className={clsx("px-4 md:px-5 pt-3.5 md:pt-4", headerClassName)}>
        <h2 className="text-[12px] md:text-[13px] font-medium tracking-[0.02em] text-[--color-foreground-strong]">
          {title}
        </h2>
      </div>
      <div className="mx-4 md:mx-5 mt-2 h-px [background:color-mix(in_oklab,var(--color-border-strong)_72%,transparent)]" aria-hidden />
      <div className={clsx("px-4 md:px-5 py-3.5 md:py-4.5", bodyClassName)}>
        {children}
      </div>
    </ElegantCard>
  );
}
