"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/lib/icons";
import { NAV_ITEMS, COUNTRIES } from "@/lib/nav";
import CountryBadge from "@/components/country-badge";

// Shared nav markup for both the desktop Sidebar and MobileNav's drawer, so
// the two surfaces can't silently drift apart on which pages/countries link
// where.
export default function NavList() {
  const pathname = usePathname();

  return (
    <>
      <div className="px-4 py-2 opacity-40 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
        Core Systems
      </div>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 p-4 transition-all border-l-4 ${
              active
                ? "text-accent font-bold bg-accent/10 border-accent"
                : "text-ink-muted border-transparent hover:text-ink hover:bg-panel-highest/50"
            }`}
          >
            <Icon name={item.icon} size={20} />
            <span className="font-mono text-label-caps">{item.label}</span>
          </Link>
        );
      })}

      <div className="px-4 py-6 opacity-40 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
        Countries of Operation
      </div>
      <div className="grid grid-cols-2 gap-1 px-2 pb-6">
        {COUNTRIES.map((country) => (
          <Link
            key={country}
            href={`/project-tracker?country=${encodeURIComponent(country)}`}
            className="flex items-center gap-2 p-2 text-ink-muted hover:text-accent transition-colors text-[11px] font-mono text-left"
          >
            <CountryBadge country={country} className="w-5 h-5 rounded bg-panel-high border border-border text-[8px] text-ink-muted" /> {country}
          </Link>
        ))}
      </div>
    </>
  );
}
