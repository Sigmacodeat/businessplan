export type Subchapter = { id: string; titleKey: string; title?: string };
export type Chapter = {
  id: number;
  slug: string;
  title: string;
  titleKey: string;
  requiredFields: string[];
  subchapters?: Subchapter[];
};

export const chapters: Chapter[] = [
  // High-end investor & FFG/aws friendly order
  { id: 1, slug: 'executive', title: 'Executive Summary', titleKey: 'executive', requiredFields: ['problem','solution','market','businessModel','usps'], subchapters: [
    { id: 'executive', titleKey: 'executive.overview', title: 'Überblick' },
    { id: 'company', titleKey: 'executive.company', title: 'Unternehmen' },
    { id: 'teamOrg', titleKey: 'executive.teamOrg', title: 'Team & Organisation' },
  ] },
  { id: 2, slug: 'business-model', title: 'Business Model', titleKey: 'businessModel', requiredFields: ['valueProp','pricing','revenue','unitEconomics','sales','partnerships'], subchapters: [
    { id: 'businessModel', titleKey: 'businessModel.model', title: 'Geschäftsmodell' },
    { id: 'kpis', titleKey: 'businessModel.kpis', title: 'KPIs' }
  ] },
  { id: 3, slug: 'market', title: 'Market', titleKey: 'market', requiredFields: ['size','target','competition','trends'], subchapters: [
    { id: 'market', titleKey: 'market.overview', title: 'Markt' },
    { id: 'market-details', titleKey: 'market.details', title: 'Wettbewerb' },
    { id: 'size', titleKey: 'market.size', title: 'Marktgröße' },
    { id: 'target', titleKey: 'market.target', title: 'Zielsegmente' },
    { id: 'competition', titleKey: 'market.competition', title: 'Wettbewerb' },
    { id: 'trends', titleKey: 'market.trends', title: 'Trends' }
  ] },
  { id: 4, slug: 'gtm', title: 'Go-to-Market', titleKey: 'gtm', requiredFields: ['phases','tactics','kpis'], subchapters: [
    { id: 'phases', titleKey: 'gtm.phases', title: 'Phasen' },
    { id: 'funnel', titleKey: 'gtm.funnel', title: 'Funnel' },
    { id: 'channelMix', titleKey: 'gtm.channelMix', title: 'Channel Mix' },
    { id: 'tactics', titleKey: 'gtm.tactics', title: 'Taktiken' },
    { id: 'kpis', titleKey: 'gtm.kpis', title: 'KPIs' }
  ] },
  { id: 5, slug: 'finance', title: 'Finance', titleKey: 'finance', requiredFields: ['capital','funding','roi','forecast'], subchapters: [
    { id: 'breakEven', titleKey: 'finance.breakEven', title: '5.1 – Break-even' },
    { id: 'useOfFunds', titleKey: 'finance.useOfFunds', title: '5.2 – Use of Funds' },
    { id: 'capexOpex', titleKey: 'finance.capexOpex', title: '5.3 – CAPEX/OPEX' },
    { id: 'hardwareBreakdown', titleKey: '', title: '5.4 – Hardware Details' },
    { id: 'revenueStreams', titleKey: 'finance.revenueStreams', title: '5.5 – Revenue Streams' },
    { id: 'revenueVsCost', titleKey: 'headings.revenueVsCost', title: '5.6 – Revenue vs. Cost' },
    { id: 'cashFlow', titleKey: 'finance.cashFlow', title: '5.7 – Cash Flow' },
    { id: 'profitBridge', titleKey: 'finance.profitBridge', title: '5.8 – Profit Bridge' },
    { id: 'ebitda', titleKey: 'headings.plOverview', title: '5.9 – EBITDA' },
    { id: 'revenueForecast', titleKey: 'headings.revenueForecast', title: '5.10 – Revenue Forecast' },
    { id: 'revenueTable', titleKey: 'headings.revenueTable', title: '5.11 – Revenue Table' },
    { id: 'fundraising', titleKey: 'headings.fundraising', title: '5.12 – Fundraising' },
    { id: 'capTable', titleKey: 'sections.capTable', title: '5.13 – Cap Table' },
    { id: 'projections', titleKey: 'headings.projections', title: '5.14 – Projections' },
    { id: 'submissionsPlan', titleKey: 'headings.submissionsPlan', title: '5.15 – Submission Plan' },
    { id: 'fundingSummary', titleKey: 'headings.fundingSummary', title: '5.16 – Funding Summary' },
    { id: 'assumptions', titleKey: '', title: '5.17 – Annahmen' },
    { id: 'assumptionsTable', titleKey: '', title: '5.18 – Annahmen (Tabelle)' },
  ] },
  { id: 6, slug: 'technology', title: 'Technology', titleKey: 'technology', requiredFields: ['architecture','robotics','innovation','ip'], subchapters: [
    { id: 'technology', titleKey: 'technology.overview', title: 'Technologie' },
    { id: 'architecture', titleKey: 'technology.architecture', title: 'Architektur' },
    { id: 'workPackages', titleKey: 'technology.workPackages', title: 'Work Packages' },
    { id: 'responsible-ai', titleKey: 'technology.responsibleAi', title: 'Responsible AI' },
    { id: 'ip', titleKey: 'technology.ip', title: 'IP & Moat' },
    { id: 'innovation', titleKey: 'technology.innovation', title: 'Innovation' },
  ] },
  { id: 7, slug: 'team', title: 'Team', titleKey: 'team', requiredFields: ['org','hiring','roles','esop'], subchapters: [
    { id: 'org', titleKey: 'team.org', title: 'Organisation' },
    { id: 'roles', titleKey: 'team.roles', title: 'Rollen' },
    { id: 'hiring', titleKey: 'team.hiring', title: 'Hiring' },
    { id: 'esop', titleKey: 'team.esop', title: 'ESOP' },
  ] },
  { id: 8, slug: 'risks', title: 'Risks', titleKey: 'risks', requiredFields: ['tech-risk','market-risk','finance-risk','mitigation'], subchapters: [
    { id: 'tech-risk', titleKey: 'risks.tech', title: 'Technologie' },
    { id: 'market-risk', titleKey: 'risks.market', title: 'Markt' },
    { id: 'finance-risk', titleKey: 'risks.finance', title: 'Finanzen' },
    { id: 'regulatory', titleKey: 'risks.regulatory', title: 'Regulatorik' },
    { id: 'operations', titleKey: 'risks.operations', title: 'Betrieb' },
    { id: 'mitigation', titleKey: 'risks.mitigation', title: 'Mitigation' },
  ] },
  { id: 9, slug: 'traction-kpis', title: 'Traction / KPIs', titleKey: 'tractionKpis', requiredFields: ['traction','kpis'], subchapters: [
    { id: 'traction', titleKey: 'traction.traction', title: 'Traction' },
    { id: 'highlights', titleKey: 'traction.highlights', title: 'Highlights' },
    { id: 'live-metrics', titleKey: 'traction.liveMetrics', title: 'Live-Kennzahlen' },
    { id: 'kpi-explainer', titleKey: 'traction.kpiExplainer', title: 'KPIs – Erklärung' },
    { id: 'methodology', titleKey: 'traction.methodology', title: 'Methodik' },
    { id: 'evidence', titleKey: 'traction.evidence', title: 'Evidenzen' },
    { id: 'deliverables', titleKey: 'traction.deliverables', title: 'Deliverables' },
    { id: 'economics', titleKey: 'traction.economics', title: 'Economics' },
    { id: 'owner', titleKey: 'traction.owner', title: 'Owner & Aktualisierung' },
    { id: 'benchmarks', titleKey: 'traction.benchmarks', title: 'Benchmarks' },
  ] },
  { id: 10, slug: 'impact', title: 'Impact', titleKey: 'impact', requiredFields: [] },
  { id: 11, slug: 'exit-strategy', title: 'Exit', titleKey: 'exit', requiredFields: [], subchapters: [
    { id: 'scenarios', titleKey: 'exit.scenarios', title: 'Szenarien' },
    { id: 'buyers', titleKey: 'exit.buyers', title: 'Käuferlandschaft' },
    { id: 'timeline', titleKey: 'exit.timeline', title: 'Zeitleiste' },
  ] },
  { id: 12, slug: 'work-packages', title: 'Arbeitspakete', titleKey: 'workPackages', requiredFields: [], subchapters: [
    { id: 'overview', titleKey: 'workPackages.overview', title: 'Übersicht' },
    { id: 'details', titleKey: 'workPackages.details', title: 'Detaillierte Aufstellung' },
    { id: 'timeline', titleKey: 'workPackages.timeline', title: 'Zeitplan' },
  ] },
];

export const totalChapters = chapters.length;
