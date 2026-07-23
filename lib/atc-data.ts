// Real, researched content about the Gulf Cryo x Saudi Aramco ATC program —
// unlike the rest of this app's illustrative mock news, every fact and quote
// here is drawn from the sources listed at the bottom, fetched during this
// session. Source links point to the exact articles read, not homepages.

export interface AtcStat {
  label: string;
  value: string;
  desc: string;
  icon: string;
}

export interface AtcFocusArea {
  icon: string;
  title: string;
  desc: string;
}

export interface AtcMilestone {
  date: string;
  title: string;
  desc: string;
  source: string;
  sourceUrl: string;
}

export interface AtcQuote {
  name: string;
  role: string;
  quote: string;
}

export interface AtcSource {
  title: string;
  url: string;
}

export const atcData = {
  overview: {
    title: "Applications & Technology Center (ATC)",
    subtitle: "Gulf Cryo × Saudi Aramco — King Salman Energy Park (SPARK)",
    description:
      "A dedicated testing facility where Aramco's newly developed lower-carbon hydrogen and carbon capture & utilization (CCU) technologies are assessed at pilot and pre-commercial scale, under real Saudi Arabian climate conditions — described as the first center of its kind in the region.",
  },

  stats: [
    { label: "Technology Readiness", value: "TRL 5–9", desc: "Pilot through pre-commercial scale", icon: "science" },
    { label: "Regional Standing", value: "1st of its kind", desc: "First center of this kind in the region", icon: "target" },
    { label: "Current Phase", value: "Phase 2", desc: "Full lower-carbon hydrogen value chain", icon: "trending_up" },
  ] as AtcStat[],

  focusAreas: [
    {
      icon: "eco",
      title: "Lower-Carbon Hydrogen",
      desc: "Phase 2 expands testing across the full value chain: production, purification, storage, distribution, and end-use application.",
    },
    {
      icon: "factory",
      title: "Carbon Capture & Utilization (CCU)",
      desc: "Testing and assessment of CCU technologies to help scale and standardize a regional CCUS ecosystem.",
    },
  ] as AtcFocusArea[],

  milestones: [
    {
      date: "Nov–Dec 2024",
      title: "Aramco & Gulf Cryo sign collaboration agreement",
      desc: "Agreement establishes testing and assessment of lower-carbon hydrogen and CCU technologies at Gulf Cryo's newly launched ATC at SPARK.",
      source: "gasworld",
      sourceUrl:
        "https://www.gasworld.com/story/aramco-and-gulf-cryo-to-test-low-carbon-hydrogen-and-ccu-at-spark/2147469.article/",
    },
    {
      date: "2026",
      title: "ATC Phase 2 — full hydrogen value chain",
      desc: "Gulf Cryo expands the ATC's scope to cover the complete lower-carbon hydrogen value chain, from production and purification through storage, distribution, and end-use applications.",
      source: "Gulf Cryo",
      sourceUrl: "https://www.gulfcryo.com/ccus-solutions",
    },
  ] as AtcMilestone[],

  quotes: [
    {
      name: "Ali A. Al-Meshari",
      role: "Senior Vice President, Technology Oversight & Coordination, Aramco",
      quote:
        "This collaboration is important in advancing our early stage technologies to the next phase of development and helps create a local ecosystem for accelerating technology deployment.",
    },
    {
      name: "Eng. Abdel Salam Al Mazrooei",
      role: "Vice Chairman, Gulf Cryo",
      quote: "We are very delighted to inaugurate the works of our Applications and Technologies Center.",
    },
  ] as AtcQuote[],

  ccusPortfolio: {
    investment: "$100M",
    investmentDesc: "Committed to green initiatives",
    target: "600,000 metric tons/year",
    targetDesc: "CO₂ recovery target by 2030 (+500%)",
    firstFacility:
      "Gulf Cryo designed, built, and operated the first carbon capture facility in the region — a year before the Paris Agreement.",
    partnerships: [
      { name: "Petro Rabigh", desc: "Aramco / Sumitomo Chemical joint venture" },
      { name: "Ma'aden", desc: "Agreement announced at COP27, Saudi Green Initiative forum" },
    ],
  },

  outlook:
    "Phase 2 positions the ATC to validate lower-carbon hydrogen technologies across the entire value chain — not just production — ahead of commercial-scale deployment. Combined with Gulf Cryo's existing CCUS portfolio and Aramco's Scope 1 & 2 net-zero target for 2050, the center is set to play an expanding role in the Kingdom's industrial decarbonization roadmap, with further technology partners expected to test at SPARK as the facility matures from pilot to pre-commercial operation.",

  sources: [
    {
      title: "Aramco and Gulf Cryo to test low-carbon hydrogen and CCU at SPARK — gasworld",
      url: "https://www.gasworld.com/story/aramco-and-gulf-cryo-to-test-low-carbon-hydrogen-and-ccu-at-spark/2147469.article/",
    },
    {
      title: "Gulf Cryo and Aramco sign a collaboration agreement — Zawya",
      url: "https://www.zawya.com/en/press-release/companies-news/gulf-cryo-and-aramco-sign-a-collaboration-agreement-for-testing-and-assessment-of-lower-carbon-hydrogen-cvtokm8a",
    },
    {
      title: "Aramco Partners with Gulf Cryo to Test Lower-Carbon Hydrogen Technologies — Leaders MENA",
      url: "https://www.leaders-mena.com/aramco-partners-with-gulf-cryo-to-test-lower-carbon-hydrogen-technologies/",
    },
    {
      title: "Gulf Cryo — CCUS Solutions",
      url: "https://www.gulfcryo.com/ccus-solutions",
    },
  ] as AtcSource[],
};
