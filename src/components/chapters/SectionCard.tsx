"use client";

import React from "react";

export type SectionCardProps = {
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  id?: string;
};

/**
 * Einheitlicher, edler Karten-Wrapper für Kapitel-Sektionen.
 * - Ruhige Border/Fläche
 * - Konsistente Typografie für Titel
 */
export default function SectionCard({
  title,
  children,
  className,
  headerClassName,
  contentClassName,
  id,
}: SectionCardProps) {
  const headerId = id ? `${id}-title` : undefined;
  return (
    <div
      id={id}
      aria-labelledby={headerId}
      tabIndex={-1}
      className={["scroll-mt-24 subchapter-block", className || ""].join(" ")}
      role="group"
    >
      {title !== undefined ? (
        <div className={["p-4 md:p-5", headerClassName || ""].join(" ")}> 
          <div
            id={headerId}
            className="not-prose subchapter-title"
          >
            {title}
          </div>
        </div>
      ) : null}
      <div className={["p-4 md:p-5", title !== undefined ? "pt-0" : "", contentClassName || ""].join(" ")}> 
        {children}
      </div>
    </div>
  );
}
