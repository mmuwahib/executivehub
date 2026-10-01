import { SHOW_GEOPOLITICAL } from "./features";

const ALL_NAV_ITEMS = [
  { href: "/", label: "Overview", icon: "dashboard" },
  { href: "/geopolitical", label: "Geopolitical", icon: "public" },
  { href: "/industry-summary", label: "Industry", icon: "factory" },
  { href: "/project-tracker", label: "Projects", icon: "analytics" },
  { href: "/tech-innovation", label: "Tech & Innovation", icon: "precision_manufacturing" },
  { href: "/atc-program", label: "ATC Program", icon: "science" },
] as const;

export const NAV_ITEMS = ALL_NAV_ITEMS.filter(
  (item) => SHOW_GEOPOLITICAL || item.href !== "/geopolitical"
);

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

export const HEADER_TICKER = [
  { label: "BRENT", value: "$84.12", change: "-0.8%", direction: "down" as const },
  { label: "TTF GAS", value: "€28.45", change: "+1.2%", direction: "up" as const },
  { label: "HELIUM", value: "114.2", change: "0.0%", direction: "flat" as const },
  { label: "LOGISTICS TENSION", value: "6.8", change: "+2.1", direction: "up" as const },
  { label: "USD/AED", value: "3.674", direction: "flat" as const },
  { label: "ATC NETWORK", value: "OPERATIONAL", direction: "flat" as const },
];

const ALL_FOOTER_TICKER = [
  { time: "08:20:06 Z", title: "Strait of Hormuz: Escalated Naval Presence", geo: true },
  { time: "08:14:22 Z", title: "UAE Hosts Emergency Energy Summit", geo: true },
  { time: "07:58:11 Z", title: "Red Sea: Houthi Maritime Disruptions Persist", geo: true },
  { time: "07:45:00 Z", title: "Saudi Arabia Calls for Unified Response", geo: true },
  { time: "07:30:41 Z", title: "Technology Cuts Industrial Gas Losses by 28%", geo: false },
  { time: "07:12:05 Z", title: "Helium Storage Facilities at Max Capacity in KSA", geo: false },
];

export const FOOTER_TICKER = ALL_FOOTER_TICKER.filter((item) => SHOW_GEOPOLITICAL || !item.geo).map(
  ({ time, title }) => ({ time, title })
);
