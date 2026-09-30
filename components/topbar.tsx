import { Suspense } from "react";
import Link from "next/link";
import { STATUS_CHIPS, FOOTER_TICKER } from "@/lib/nav";
import { TONE_TEXT, TONE_BG } from "@/lib/tone";
import ThemeToggle from "@/components/theme-toggle";
import SearchBox from "@/components/search-box";
import SettingsMenu from "@/components/settings-menu";
import NotificationsMenu from "@/components/notifications-menu";
import FreshnessBadge from "@/components/freshness-badge";
import MobileNav from "@/components/mobile-nav";

export default function Topbar() {
  return (
    <header className="fixed top-0 left-0 lg:left-sidebar right-0 h-16 flex items-center justify-between px-6 z-30 bg-surface border-b border-border">
      <div className="flex items-center gap-4 lg:gap-8">
        <MobileNav
          freshnessSlot={
            <Suspense fallback={<div className="w-24 h-6" />}>
              <FreshnessBadge />
            </Suspense>
          }
        />
        <Suspense fallback={<div className="hidden md:block w-64 h-9" />}>
          <SearchBox />
        </Suspense>
        <nav className="hidden xl:flex items-center gap-6">
          <Link
            href="/#market-data"
            className="font-mono text-ticker-data text-accent hover:underline"
          >
            Markets
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Suspense fallback={<div className="hidden lg:block w-24 h-6" />}>
          <FreshnessBadge />
        </Suspense>
        <div className="hidden xl:flex items-center gap-3 px-3 py-1 bg-panel-high rounded-full border border-border">
          {STATUS_CHIPS.map((chip) => (
            <span key={chip.label} className={`flex items-center gap-1 text-[10px] font-bold uppercase ${TONE_TEXT[chip.tone]}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${TONE_BG[chip.tone]}`} /> {chip.label}
            </span>
          ))}
        </div>
        <ThemeToggle />
        <NotificationsMenu items={FOOTER_TICKER} />
        <SettingsMenu />
        <div className="h-8 w-px bg-border mx-1" />
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="font-mono text-[10px] text-ink-faint uppercase">Chief Executive</div>
            <div className="text-headline-sm text-ink">Gulf Cryo</div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-accent bg-panel-highest flex items-center justify-center text-accent font-bold text-sm">
            GC
          </div>
        </div>
      </div>
    </header>
  );
}
