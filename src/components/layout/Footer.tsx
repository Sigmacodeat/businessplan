import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

export default async function Footer() {
  const locale = await getLocale();
  const tCommon = await getTranslations('common');
  const label = (tCommon('links.pdfExport') as string) || ((locale?.startsWith('de')) ? 'Businessplan als PDF' : 'Export business plan (PDF)');
  return (
    <footer className="mt-16 border-t border-[--color-border] bg-[--color-surface] backdrop-blur">
      <div className="container-gutter py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-[--color-foreground]">
        <p className="text-sm text-[--color-foreground-muted]">© {new Date().getFullYear()} SIGMACODE AI Robotics</p>
        <nav className="flex items-center gap-5 text-sm" aria-label="Footer">
          <Link href="#executive" className="hover:opacity-80 transition">Executive</Link>
          <Link href="#finance" className="hover:opacity-80 transition">Finance</Link>
          <Link href={`/${locale}/export/businessplan`} className="hover:opacity-80 transition no-underline">{label}</Link>
        </nav>
      </div>
    </footer>
  );
}
