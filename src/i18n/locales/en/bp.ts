// bp.en.ts
import sections from './sections'
import technology from './technology'
import risks from './risks'
import exit from './exit'
import gtm from './gtm'

import businessModel from './businessModel'
import market from './market'
import impact from './impact'
import finance from './finance'
import products from './products'
import operations from './operations'
import mlops from './mlops'
import responsibleAI from './responsibleAI'
import teamOrg from './teamOrg'
import capTable from './capTable'
import costPlan from './costPlan'
import financePlanDetailed from './financePlanDetailed'
import marketCompetitive from './marketCompetitive'
import dissemination from './dissemination'
import company from './company'
import cta from './cta'
import workPackagesDetailed from './workPackagesDetailed'

const exitAug = {
  ...exit,
  options: {
    ...(exit as any).options,
    a: { ...((exit as any).options?.a ?? {}), chartTitle: 'Trade Sale – Valuation range' },
    b: { ...((exit as any).options?.b ?? {}), chartTitle: 'PE/Growth Buyout – Valuation range' },
    c: { ...((exit as any).options?.c ?? {}), chartTitle: 'IPO (long-term) – Valuation range' },
  },
} as const

const bp = {
  sections,
  technology,
  risks,
  exit: exitAug,
  gtm,
  finance: {
    fundingStrategy: 'Funding mix: equity (30%), investors (25%) and public grants (45%; aws/FFG/Wirtschaftsagentur/KMU.DIGITAL). Sequenced submissions of multiple sub‑projects (WP‑bound) to optimize approval probability and cash flow.',
    fundingMix: {
      equityPct: 30,
      investorPct: 25,
      grantsPct: 45,
      notes: [
        'Investor range 20–30% → planned conservatively at 25%.',
        'Grants diversified across aws/FFG/Wirtschaftsagentur/KMU.DIGITAL; Innovation cheque requires research partner.',
      ],
    },
    runway: '18–24 months (indicative) after approvals and co‑financing; objective: >12 months minimum runway per tranche.',
    submissionsPlan: [
      {
        program: 'Wirtschaftsagentur Vienna – Digitalization',
        agency: 'Wirtschaftsagentur Wien',
        partnerRequired: false,
        requestedAmount: '€100k',
        cofinancingPct: '20–40% (program dependent)',
        timeline: 'Q4/2025 – Q2/2026',
        workPackages: ['WP1', 'WP2 (parts: architecture/SDK)'],
        docs: ['Project description', 'Cost/Timeline plan', 'SME proof', 'Financials'],
      },
      {
        program: 'aws Digitalization',
        agency: 'aws',
        partnerRequired: false,
        requestedAmount: '€200k',
        cofinancingPct: 'typ. 20–50%',
        timeline: 'Q1/2026 – Q4/2026',
        workPackages: ['WP2 (finalize architecture)', 'WP3 (core development, CI/CD, observability)'],
        docs: ['Business plan', 'Budget/Quotes', 'Milestones', 'Timeline', 'Company data'],
      },
      {
        program: 'FFG Projekt.Start',
        agency: 'FFG',
        partnerRequired: false,
        requestedAmount: '€15k',
        cofinancingPct: 'none/low',
        timeline: 'Q4/2025 – Q1/2026',
        workPackages: ['WP1 (preparation)', 'WP2 (pre‑studies)'],
        docs: ['Short description', 'Costs', 'Timeline'],
      },
      {
        program: 'FFG Basis program / Small project',
        agency: 'FFG',
        partnerRequired: false,
        requestedAmount: '€250k (grant share)',
        cofinancingPct: 'project dependent (e.g., 40–55%)',
        timeline: 'Q2/2026 – Q2/2027',
        workPackages: ['WP3 (AI/Controls/FS core development)', 'WP4 (quality, tests, safety)'],
        docs: ['Detailed description', 'R&D share/TRL', 'Risks/Mitigation', 'Budget/Milestones'],
      },
      {
        program: 'FFG Innovation cheque',
        agency: 'FFG',
        partnerRequired: true,
        requestedAmount: '€12.5k (cheque)',
        cofinancingPct: 'cheque model',
        timeline: 'Q1/2026 – Q3/2026',
        workPackages: ['WP2 (targeted research services: safety evaluation, policy benchmarks)'],
        docs: ['Research partner offer (TU/FH/AIT)', 'Short description', 'Objective/Scope'],
      },
      {
        program: 'KMU.DIGITAL – Implementation',
        agency: 'WKO/Federal',
        partnerRequired: false,
        requestedAmount: '€30k (implementation parts)',
        cofinancingPct: 'program dependent',
        timeline: 'Q3/2026 – Q4/2026',
        workPackages: ['WP5 (rollout, training, enablement materials)'],
        docs: ['Quotes/Statements of work', 'KMU.DIGITAL conditions'],
      },
      {
        program: 'aws Preseed / Seedfinancing (optional)',
        agency: 'aws',
        partnerRequired: false,
        requestedAmount: 'program dependent',
        cofinancingPct: 'program dependent',
        timeline: 'optional from Q2/2026',
        workPackages: ['Scale WP3/WP5, app‑store beta, partner ecosystem'],
        docs: ['Business angels/investors (recommended)', 'Business plan', 'Traction/KPIs'],
      },
    ],
    capitalNeeds: 'Capital Needs',
    funding: 'Funding',
    revenueForecast: 'Revenue Forecast',
    revenueTable: 'Revenue Table',
  },
  team: {
    esopDetails: [
      'Initial pool size 12%, optional increase to 15% after Series A',
      'Vesting 4 years with 1 year cliff, then monthly',
      'Double‑trigger acceleration: 50% upon change of control + termination without cause',
      'FMV/annual valuation (EU 409A equivalent); strike price = FMV at grant',
    ],
  },
  // Top-level reference for competitive data (for Market page)
  marketCompetitive,
  execFacts: {
    cagr: 'CAGR >60% until 2030',
    breakEven: 'Break-even: 2028',
    revenue2030: 'Revenue 2030: €25–40M',
    compliance: '99.99% uptime, <10ms latency',
    model: 'Basketball arbitrage, AI-driven',
  },
  tractionKpis: {
    kpis: [
      { label: 'Units (robots)', value: 50, unit: '', delta: 15 },
      { label: 'MRR', value: 175, unit: 'k€', delta: 22 },
      { label: 'NRR', value: 118, unit: '%', delta: 4 },
      { label: 'Churn', value: 8, unit: '%', delta: -1 },
      { label: 'Uptime', value: 99.99, unit: '%', delta: 0.02 },
      { label: 'Adoption (MoM)', value: 45, unit: '%', delta: 8 },
    ],
    trendsSeries: [
      { name: 'Units', data: [10, 20, 30, 40, 50, 65], color: '#22c55e' },
      { name: 'MRR (k€)', data: [40, 70, 100, 130, 175, 230], color: '#3b82f6' },
      { name: 'Churn (%)', data: [14, 12, 11, 10, 9, 8], color: '#ef4444' },
    ],
    highlights: [
      'RaaS rollouts with partners (OEM/integrators) accelerate units & MRR',
      'App‑store share at 5–15% of revenue from year 3 (upsell)',
      'Payback ~3 months (CAC ~€6k), LTV (contribution) ~€50k, LTV/CAC > 7x',
    ],
    kpisExplain: [
      'Units = active robots in the field; MRR in k€ (RaaS). NRR incl. upsell/expansion, churn monthly.',
    ],
    methodology: [
      'Cohort analysis and 28‑day rolling averages for ARPU/CAC.',
      'Mix of paid and organic channels; attribution via UTMs.',
    ],
    evidence: [
      'Product logs, payment receipts (Stripe), CRM exports (HubSpot).',
    ],
    deliverables: [
      'Q4: >10 arbs/day, viral coefficient >1.2, churn <10%'
    ],
    captions: {
      kpis: 'Live metrics (indicative, directional trends)',
      trends: 'Trend series (ARPU/LTV up; CAC down)'
    },
    benchmarks: {
      title: 'Benchmarks (SoA vs. Our Approach)',
      headers: ['Metric', 'SoA', 'Our approach'],
      rows: [
        ['Gross margin', '65–75%', '70–80%'],
        ['LTV/CAC', '3–4x', '>5x'],
        ['Uptime', '99.9%', '99.99%'],
      ],
    },
  },
  labels: {
    back: 'Back',
    next: 'Next',
    seeAlso: 'See also',
    euShare: 'EU share of global market',
    // Parity additions to match DE
    operating: 'Operating',
    investing: 'Investing',
    financing: 'Financing',
    innovationTech: 'Innovation & Tech',
    euFocusPrivacy: 'EU focus & privacy',
    exposure: 'Exposure',
    coverage: 'Coverage',
  },
  links: {
    tech: 'Chapter 6 – Technology',
    responsibleAI: 'Compliance & Responsible AI',
  },
  emptyNotice: 'No data available yet',
  headings: {
    valueProp: 'Value Proposition',
    pricing: 'Pricing',
    revenueStreams: 'Revenue Streams',
    unitEconomics: 'Unit Economics',
    salesChannels: 'Sales Channels',
    partnerships: 'Partnerships',
    breakEven: 'Break-even',
    revenueVsCost: 'Revenue vs. Cost',
    cashFlow: 'Cash Flow',
    kpis: 'KPIs',
    tractionKpis: 'Traction & KPIs',
    esop: 'ESOP',
    stack: 'Stack',
    overview: 'Overview',
    team: 'Team',
    workPackages: 'Work Packages',
    timeline: 'Timeline',
    roadmap: 'Roadmap',
    trl: 'TRL',
    safety: 'Safety',
    ipMoat: 'IP & Moat',
    innovation: 'Innovation',
    awsCompliance: 'aws Compliance',
    teamOrg: 'Team & Organization',
    teamOrgCoreEngineering: 'Core Engineering',
    teamOrgPlatformCloud: 'Platform & Cloud',
    teamOrgProduct: 'Product & Design',
    teamOrgGtmPartnerships: 'GTM & Partnerships',
    roles: 'Roles',
    profitBridge: 'Profit Bridge',
    founders: 'Founders',
    roleSkillMatrix: 'Role/Skill Matrix',
    teamPlan: 'Team Plan',
    marketVolume: 'Market Volume & Trends',
    segments: 'Segments',
    phases: 'Phases',
    funnel: 'Funnel',
    channelMix: 'Channel Mix',
    tactics: 'Tactics',
    // Parity additions used across chapters
    technical: 'Technical',
    legal: 'Legal',
    risks: 'Risks',
    financing: 'Financing',
    fundraising: 'Fundraising',
    useOfFunds: 'Use of funds',
    fundingStrategy: 'Funding strategy',
    submissionsPlan: 'Submission plan',
    projections: 'Projections',
    revenueForecast: 'Revenue Forecast',
    revenueTable: 'Revenue Table',
    fundingSummary: 'Funding summary',
    runway: 'Runway',
    plOverview: 'P&L overview',
    competition: 'Competition',
    traction: 'Traction',
    businessModelKPIs: 'Business Model KPIs',
    successFactors: 'Success factors',
    capexOpex: 'CAPEX / OPEX',
    revenueComposition: 'Revenue composition',
    capTableCurrent: 'Cap table – current',
    capTablePostRound: 'Cap table – post round',
    mitigation: 'Mitigation',
    riskMatrix: 'Risk matrix',
    aws: 'AWS',
    privacy: 'Privacy',
    safetyStandards: 'Safety standards',
    aiAct: 'AI Act',
    securityProgram: 'Security program',
    evaluations: 'Evaluations',
    redTeam: 'Red team',
    provenance: 'Provenance',
    practices: 'Best Practices',
    slas: 'SLAs',
    supportingDocs: 'Supporting documents',
    references: 'References',
    // Add SWOT headings
    strengths: 'Strengths',
    weaknesses: 'Weaknesses',
    opportunities: 'Opportunities',
    threats: 'Threats',
  },
  tables: {
    headers: {
      deliverables: 'Deliverables',
      teamSize: 'Team size',
      focus: 'Focus',
      roles: 'Roles',
      year: 'Year',
      role: 'Role',
      ai: 'AI',
      controls: 'Controls',
      cloud: 'Cloud',
      product: 'Product',
      safety: 'Safety',
      sdk: 'SDK',
      gtm: 'GTM',
      segment: 'Segment',
      share: 'Share',
      stage: 'Stage',
      metric: 'Metric',
      target: 'Target',
      notes: 'Notes',
      channel: 'Channel',
      category: 'Category',
      amount: 'Amount',
      name: 'Name',
      workPackage: 'WP',
      timeline: 'Timeline',
      quarter: 'Quarter',
      revenue: 'Revenue',
      cogs: 'COGS',
      grossProfit: 'Gross profit',
      opex: 'OPEX',
      ebitda: 'EBITDA',
      strengths: 'Strengths',
      weaknesses: 'Weaknesses',
    },
    captions: {
      useOfFundsY1: 'Use of funds year 1',
    },
  },
  figures: {
    revenueVsCostDescription: 'Model comparison of revenue and costs across the planning period.',
    breakEvenDescription: 'Break-even trajectory over planning years – cumulative contribution margin vs. fixed costs.',
    cashFlowDescription: 'Simplified cash flow focusing on operating inflows/outflows (indicative).',
    // Parity additions
    revenueDescription: 'Explanation of revenue development over the planning period (indicative).',
    ebitdaDescription: 'EBITDA development over the years incl. key drivers (indicative).',
    revenueCompositionDescription: 'Revenue composition by products/segments (stacked).',
    profitBridgeDescription: 'Waterfall from revenue to EBITDA (profit bridge).',
    marketVolumeAlt: 'Chart: market volume (global/EU) – alt text',
    revenueBarsAlt: 'Chart: revenue bars by segment – alt text',
    marketVolumeCaption: 'Market volume & EU share (source: internal analysis)',
    revenueBarsCaption: 'Revenue by products/segments (indicative)',
    scenariosDescription: 'Scenario analysis (base/bull/bear) with impact on revenue and profitability.',
    runwayDescription: 'Runway visualization based on cash balance and monthly burn.',
    capexOpexDescription: 'Breakdown of CAPEX and OPEX over the planning period.',
    totalsDescription: 'Totals view of key financial metrics over the period.',
  },
  series: {
    revenue: 'Revenue',
    costs: 'Costs',
    operating: 'Operating',
    investing: 'Investing',
    financing: 'Financing',
  },
  kpis: {
    breakEven: 'Break-even',
    cagr: 'CAGR',
    revenue2030: 'Revenue 2030',
    market2030: 'Market 2030',
  },
  kpisValues: {
    breakEvenYear: '2028',
    cagr: '45–60%',
    revenue2030: '€25–40M',
    market2030: '€40+ B',
  },
  kpisSub: {
    breakEven: 'Contribution margin = fixed costs',
    cagr: 'annual growth',
    revenue2030: 'target range',
    market2030: 'global market volume',
  },
  impactKpi: {
    co2PerTask: 'CO₂ per task',
    incidents: 'Incidents',
    productivity: 'Productivity',
    uptime: 'Uptime',
  },
  impactKpiDesc: {
    co2PerTask: 'CO₂ emissions per completed task',
    incidents: 'Safety-relevant incidents',
    productivity: 'Productivity gain per employee',
    uptime: 'System availability',
  },
  impactHeadings: {
    economic: 'Economic impact',
    environmental: 'Environmental impact',
    policy: 'Policy & regulation',
    societal: 'Societal impact',
    sustainability: 'Sustainability',
  },
  notes: {
    esop: 'ESOP to incentivize and retain the core team; market-standard pool size 10–15%.',
    roleSkillLegend: 'Legend: ● strong, ○ good, - basics',
  },
  market: {
    traction: market.traction,
    // Keep legacy volume keys for compatibility, but add humanoid/service detail blocks.
    volume: {
      global: 'Global market volume (service total): 2024: ~$47.10B → 2029: ~$98.65B (MarketsandMarkets)',
      // EU share indicative until a verifiable public source is added
      eu: 'EU share: ~25–35% (indicative; source required)',
      cagr: 'CAGR (service 2024–2029): 15.9%',
      drivers: 'Main drivers: labor shortage, automation, demographics',
      humanoid: {
        global: 'Humanoids: 2025: ~$2.92B → 2030: ~$15.26B (MarketsandMarkets)',
        cagr: '39.2% (2025–2030)',
        notes: 'Ranges vary by source; some ~$38B by 2035 (Goldman Sachs)'
      },
      service: {
        global: 'Service robotics total: 2024: ~$47.10B → 2029: ~$98.65B (MarketsandMarkets)',
        cagr: '15.9% (2024–2029)'
      },
      sources: [
        'MarketsandMarkets – Service Robotics Market (2024–2029): https://www.marketsandmarkets.com/Market-Reports/service-robotics-market-681.html',
        'MarketsandMarkets – Humanoid Robot Market (2025–2030): https://www.marketsandmarkets.com/Market-Reports/humanoid-robot-market-99567653.html',
        'Goldman Sachs (Humanoids ~2035): https://www.goldmansachs.com/insights/articles/the-global-market-for-robots-could-reach-38-billion-by-2035',
        'Statista – Service Robotics Europe (2019–2029): https://www.statista.com/outlook/tmo/robotics/service-robotics/europe'
      ]
    },
    // Optional dual market sizes for humanoids vs. service; UI renders dual when present
    size: {
      humanoid: {
        tam: 'TAM (Humanoids): ~$15B (2030, M&M)',
        sam: 'SAM (Humanoids): industrial-adjacent use cases (logistics/manufacturing/facility) in DACH/EU',
        som: 'SOM (Humanoids): pilot regions (DACH/EU) with enterprise rollouts and partner ecosystem'
      },
      service: {
        tam: 'TAM (Service total): ~$99B (2029, M&M)',
        sam: 'SAM (Service): verticals with willingness to pay (healthcare, hospitality, education, logistics)',
        som: 'SOM (Service): target segments in DACH/EU via RaaS & app store, scalable via partners'
      }
    },
  },
  content: {
    businessModel,
    market,
    impact,
    finance,
    gtm,
    products,
    operations,
    mlops,
    responsibleAI,
    teamOrg,
    technology,
    risks,
    exit,
    capTable,
    costPlan,
    workPackagesDetailed,
    financePlanDetailed,
    marketCompetitive,
    dissemination,
    company,
    cta,
  },
  // SWOT data for chapter 3.7 – standardized bullet points
  swot: {
    strengths: [
      'Unique combination of AI agents & humanoid robotics',
      'Platform model with app store (high scalability)',
      'Strong team with software expertise',
      'EU positioning with grants/funding',
    ],
    weaknesses: [
      'Hardware dependency on third‑party vendors',
      'High capital requirements for R&D',
      'Certification processes can be lengthy',
    ],
    opportunities: [
      'EU regulation & trust: advantage via compliance‑by‑design (AI Act/CE)',
      'Demographic change drives demand for assistance & automation',
      'Ecosystem building via app store (third‑party skills, rev share)',
      'Partnerships with OEMs/integrators accelerate RaaS rollouts',
    ],
    threats: [
      'Rapid SoA progress by large players (OpenAI/Figure, NVIDIA stacks)',
      'Supply chain/hardware bottlenecks and price volatility',
      'Vendor lock‑ins with proprietary platforms',
      'Privacy/liability risks in case of malfunction (product liability)',
    ],
  },
} as const

export default bp
