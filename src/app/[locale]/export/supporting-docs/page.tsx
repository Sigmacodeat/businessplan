import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import SupportingDocsPrintClient from '@/components/export/SupportingDocsPrintClient';

function readDoc(relPath: string): string | null {
  try {
    const p = path.join(process.cwd(), relPath);
    return fs.readFileSync(p, 'utf-8');
  } catch {
    return null;
  }
}

export default function ExportSupportingDocsPage() {
  // Inhalte, die in das PDF sollen (aus dem Repo)
  const sections = [
    {
      title: 'Einreichkalender (Gantt)',
      rel: 'docs/submissions-gantt.md'
    },
    {
      title: 'Kosten-Allokationsmatrix',
      rel: 'docs/cost-allocation-matrix.md'
    },
    // Checklisten (falls vorhanden)
    { title: 'WAW – Digitalisierung', rel: 'docs/checklists/waw-digitalisierung.md' },
    { title: 'aws – Digitalisierung', rel: 'docs/checklists/aws-digitalisierung.md' },
    { title: 'FFG – Projekt.Start', rel: 'docs/checklists/ffg-projekt-start.md' },
    { title: 'FFG – Basisprogramm (Kleinprojekt)', rel: 'docs/checklists/ffg-basisprogramm-kleinprojekt.md' },
    { title: 'FFG – Innovationsscheck', rel: 'docs/checklists/ffg-innovationsscheck.md' },
    { title: 'KMU.DIGITAL – Umsetzung', rel: 'docs/checklists/kmu-digital-umsetzung.md' },
    { title: 'aws – Preseed / Seedfinancing (optional)', rel: 'docs/checklists/aws-preseed-seedfinancing.md' },
    // Templates (optional)
    { title: 'Template – Architecture v1.0', rel: 'docs/templates/architecture-v1.md' },
    { title: 'Template – SDK Technical Preview', rel: 'docs/templates/sdk-technical-preview.md' },
    { title: 'Template – Safety Evaluation Report', rel: 'docs/templates/safety-eval-report.md' },
    { title: 'Template – TRL Readiness Report', rel: 'docs/templates/trl-report.md' }
  ].map(s => ({ ...s, content: readDoc(s.rel) }));

  return (
    <main className="mx-auto max-w-3xl px-5 py-6 print:px-0 print:py-0">
      <SupportingDocsPrintClient />

      {sections.filter(s => !!s.content).map((s, idx) => (
        <section key={s.rel} className="mb-6 break-inside-avoid-page">
          <h2 className="text-xl font-semibold mb-2">{idx + 1}. {s.title}</h2>
          <pre className="whitespace-pre-wrap leading-relaxed text-sm">
            {s.content}
          </pre>
        </section>
      ))}
    </main>
  );
}
