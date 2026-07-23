"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/lib/icons";
import { NAV_ITEMS, COUNTRIES } from "@/lib/nav";
import Logo from "@/components/logo";
import CountryBadge from "@/components/country-badge";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  function handleRefresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 800);
  }

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-sidebar flex-col z-40 bg-surface-low border-r border-border">
      <div className="p-6">
        <Logo variant="full" />
      </div>

      <nav className="flex-1 px-2 mt-2 space-y-1 custom-scrollbar overflow-y-auto">
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
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-full py-3 bg-accent/10 border border-accent/30 text-accent font-mono text-[11px] tracking-widest hover:bg-accent/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
        >
          <Icon
            name="sync"
            size={16}
            className={`transition-transform ${refreshing ? "animate-spin" : "group-hover:rotate-180"}`}
          />
          {refreshing ? "REFRESHING..." : "REFRESH FEEDS"}
        </button>
      </div>
    </aside>
  );
}
