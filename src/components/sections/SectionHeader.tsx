"use client";
import React from "react";

export type SectionHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

export default function SectionHeader({ children, className }: SectionHeaderProps) {
  return (
    <div className={"mt-4 md:mt-5 mb-3 md:mb-4 " + (className ?? "")}>{children}</div>
  );
}
