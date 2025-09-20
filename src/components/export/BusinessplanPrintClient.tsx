"use client";

import React from 'react';

export default function BusinessplanPrintClient() {
  const onPrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };
  return (
    <>
      {/* Header nur für Bildschirmansicht */}
      <header className="mb-6 print:hidden">
        <h1 className="text-2xl font-semibold">Businessplan – PDF Export</h1>
        <p className="text-[--color-foreground-muted]">
          Diese Seite ist für den Druck/PDF‑Export optimiert. Klicke auf „Als PDF herunterladen“.
        </p>
        <p className="text-sm text-[--color-foreground-muted]">Datum: {new Date().toLocaleDateString()}</p>
        <div className="mt-3">
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-2 rounded-md border border-[--color-border] px-3 py-2 text-sm hover:bg-[--color-bg-elevated] no-underline"
          >
            Als PDF herunterladen
          </button>
        </div>
      </header>

      {/* Globale Druck-Styles (auf diese Seite begrenzt) */}
      <style jsx global>{`
        @media print {
          /* Entferne Navigation, Buttons, Interaktives */
          header, nav, .no-print { display: none !important; }
          a { text-decoration: none !important; color: black !important; }
          /* Bessere Seitenumbrüche für Überschriften/Abschnitte */
          h1, h2, h3, h4, h5, h6 { break-after: avoid-page; break-inside: avoid-page; }
          section, article, .avoid-break-inside, .avoid-break-inside * { break-inside: avoid-page; }
          .page-break-after { break-after: page; }
          @page { margin: 12mm; }
          body { background: white !important; }
        }
      `}</style>
    </>
  );
}
