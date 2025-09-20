"use client";
import React from "react";

export type SectionBodyProps = {
  children: React.ReactNode;
  className?: string;
};

export default function SectionBody({ children, className }: SectionBodyProps) {
  return (
    <div className={(className ? className + " " : "") + "mb-5 md:mb-7"}>
      {children}
    </div>
  );
}
