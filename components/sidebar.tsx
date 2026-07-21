"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Globe2,
  LineChart,
  Factory,
  Scale,
  Snowflake,
  BarChart3,
  MapPinned,
  Library,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "geopolitical", label: "Geopolitical", icon: Globe2 },
  { id: "markets", label: "Markets", icon: LineChart },
  { id: "energy", label: "Energy & Industrial", icon: Factory },
  { id: "business", label: "Business & Regulatory", icon: Scale },
  { id: "gulfcryo", label: "GulfCryo Watch", icon: Snowflake },
];

const WEEKLY_NAV_ITEMS = [
  { id: "industry-summary", label: "Industry Summary", icon: BarChart3 },
  { id: "project-tracker", label: "Project Tracker", icon: MapPinned },
  { id: "sources", label: "Sources", icon: Library },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

const ALL_IDS = [...NAV_ITEMS, ...WEEKLY_NAV_ITEMS].map((item) => item.id);

function useActiveSection() {
  const [active, setActive] = useState("dashboard");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-10% 0px -70% 0px" }
    );

    ALL_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return active;
}

export default function Sidebar() {
  const active = useActiveSection();

  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 h-screen sticky top-0 bg-surface-container border-r border-outline-variant py-6">
      <div className="px-4 mb-8">
        <h1 className="text-[20px] font-semibold text-on-surface">Sector Control</h1>
        <p className="text-[12px] text-on-surface-variant mt-1 tracking-tight">
          Vigilance Level: Elevated
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-r-4 ${
              active === item.id
                ? "bg-white text-primary border-primary"
                : "text-on-surface-variant border-transparent hover:text-on-surface hover:bg-white"
            }`}
          >
            <item.icon size={18} />
            <span className="text-[14px] font-medium">{item.label}</span>
          </button>
        ))}

        <div className="border-t border-outline-variant my-3 mx-4" />

        {WEEKLY_NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-r-4 ${
              active === item.id
                ? "bg-white text-primary border-primary"
                : "text-on-surface-variant border-transparent hover:text-on-surface hover:bg-white"
            }`}
          >
            <item.icon size={18} />
            <span className="text-[14px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-4 mt-4">
        <button
          onClick={() => window.print()}
          className="w-full bg-primary text-white text-[14px] py-3 font-medium hover:bg-primary-dark transition-colors"
        >
          Generate Report
        </button>
      </div>
    </aside>
  );
}
