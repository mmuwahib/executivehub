export const NAV_ITEMS = [
  { href: "/", label: "Main Dashboard", icon: "dashboard" },
  { href: "/geopolitical", label: "Geopolitical", icon: "public" },
  { href: "/industry-summary", label: "Industry Summary", icon: "factory" },
  { href: "/project-tracker", label: "Project Tracker", icon: "analytics" },
  { href: "/tech-innovation", label: "Tech Innovation", icon: "precision_manufacturing" },
  { href: "/atc-program", label: "ATC Program", icon: "science" },
] as const;

export const COUNTRIES = [
  "UAE",
  "Saudi Arabia",
  "Kuwait",
  "Bahrain",
  "Qatar",
  "Oman",
  "Jordan",
  "Iraq",
  "Turkey",
  "Egypt",
] as const;

export const STATUS_CHIPS = [
  { label: "GEO HIGH", tone: "danger" as const },
  { label: "INDUSTRY STABLE", tone: "accent" as const },
  { label: "PROJECTS GROWTH", tone: "cyan" as const },
];

export const HEADER_TICKER = [
  { label: "BRENT", value: "$84.12", change: "-0.8%", direction: "down" as const },
  { label: "TTF GAS", value: "€28.45", change: "+1.2%", direction: "up" as const },
  { label: "HELIUM", value: "114.2", change: "0.0%", direction: "flat" as const },
  { label: "LOGISTICS TENSION", value: "6.8", change: "+2.1", direction: "up" as const },
  { label: "USD/AED", value: "3.674", direction: "flat" as const },
  { label: "ATC NETWORK", value: "OPERATIONAL", direction: "flat" as const },
];

export const FOOTER_TICKER = [
  { time: "08:20:06 Z", title: "Strait of Hormuz: Escalated Naval Presence" },
  { time: "08:14:22 Z", title: "UAE Hosts Emergency Energy Summit" },
  { time: "07:58:11 Z", title: "Red Sea: Houthi Maritime Disruptions Persist" },
  { time: "07:45:00 Z", title: "Saudi Arabia Calls for Unified Response" },
  { time: "07:30:41 Z", title: "Technology Cuts Industrial Gas Losses by 28%" },
  { time: "07:12:05 Z", title: "Helium Storage Facilities at Max Capacity in KSA" },
];
