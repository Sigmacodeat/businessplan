"use client";

import React from 'react';

export default function SupportingDocsPrintClient() {
  const onPrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };
  return (
    <>
      <header className="mb-6 print:mb-4">
        <h1 className="text-2xl font-semibold">Supporting Documents – Export</h1>
        <p className="text-[--color-foreground-muted]">Diese Seite ist für den PDF‑Export optimiert. Klicke auf „Als PDF herunterladen“.</p>
        <div className="mt-3 no-print">
          <button
            type="button"
            onClick={onPrint}
            className="rounded-md border border-[--color-border] px-3 py-2 text-sm hover:bg-[--color-bg-elevated] inline-flex items-center gap-2"
          >
            Als PDF herunterladen
          </button>
        </div>
      </header>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          a { text-decoration: none !important; color: black !important; }
          pre { white-space: pre-wrap; }
          .break-inside-avoid-page { break-inside: avoid-page; }
          @page { margin: 12mm; }
          body { background: white !important; }
        }
      `}</style>
    </>
  );
}
