import fs from 'node:fs';
import path from 'node:path';

function readDoc(relPath: string): string | null {
  try {
    const p = path.join(process.cwd(), relPath);
    return fs.readFileSync(p, 'utf-8');
  } catch {
    return null;
  }
}

export default function SupportingDocsPrintPage() {
  const docs = [
    { title: 'Einreichkalender (Gantt)', rel: 'docs/submissions-gantt.md' },
    { title: 'Kosten-Allokationsmatrix', rel: 'docs/cost-allocation-matrix.md' },
  ];
  const checklists = [
    { title: 'WAW – Digitalisierung', rel: 'docs/checklists/waw-digitalisierung.md' },
    { title: 'aws – Digitalisierung', rel: 'docs/checklists/aws-digitalisierung.md' },
    { title: 'FFG – Projekt.Start', rel: 'docs/checklists/ffg-projekt-start.md' },
    { title: 'FFG – Basisprogramm (Kleinprojekt)', rel: 'docs/checklists/ffg-basisprogramm-kleinprojekt.md' },
    { title: 'FFG – Innovationsscheck', rel: 'docs/checklists/ffg-innovationsscheck.md' },
    { title: 'KMU.DIGITAL – Umsetzung', rel: 'docs/checklists/kmu-digital-umsetzung.md' },
    { title: 'aws – Preseed / Seedfinancing (optional)', rel: 'docs/checklists/aws-preseed-seedfinancing.md' },
  ];
  const templates = [
    { title: 'Template – Architecture v1.0', rel: 'docs/templates/architecture-v1.md' },
    { title: 'Template – SDK Technical Preview', rel: 'docs/templates/sdk-technical-preview.md' },
    { title: 'Template – Safety Evaluation Report', rel: 'docs/templates/safety-eval-report.md' },
    { title: 'Template – TRL Readiness Report', rel: 'docs/templates/trl-report.md' },
    { title: 'Template – CI/CD & Observability Proof', rel: 'docs/templates/ci-cd-observability.md' },
    { title: 'Template – Training & Enablement Guide', rel: 'docs/templates/training-enablement-guide.md' },
  ];

  const sections = [
    { title: 'Planung', items: docs },
    { title: 'Checklisten', items: checklists },
    { title: 'Deliverable-Templates', items: templates },
  ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-6 print:px-0 print:py-0">
      <h1 className="text-2xl font-semibold mb-2">Supporting documents (Print)</h1>
      <p className="text-[--color-foreground-muted] mb-6">Druckoptimierte Zusammenstellung aller relevanten Begleitdokumente.</p>
      {sections.map((section) => (
        <section key={section.title} className="mb-8 break-inside-avoid-page">
          <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
          {section.items.map((it) => {
            const content = readDoc(it.rel);
            if (!content) return null;
            return (
              <article key={it.rel} className="mb-6">
                <h3 className="text-lg font-medium">{it.title}</h3>
                <pre className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {content}
                </pre>
              </article>
            );
          })}
        </section>
      ))}
    </main>
  );
}
