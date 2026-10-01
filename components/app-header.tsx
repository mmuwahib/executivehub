import { Suspense } from "react";
import Link from "next/link";
import { getIntelFeed } from "@/lib/api";
import ThemeToggle from "@/components/theme-toggle";
import SearchBox from "@/components/search-box";
import SettingsMenu from "@/components/settings-menu";
import NotificationsMenu from "@/components/notifications-menu";
import FreshnessBadge from "@/components/freshness-badge";
import MobileNav from "@/components/mobile-nav";
import NavTabs from "@/components/nav-tabs";
import RefreshButton from "@/components/refresh-button";
import ZuluClock from "@/components/zulu-clock";

export default async function AppHeader() {
  const intel = await getIntelFeed();
  return (
    <header className="sticky top-0 z-30 bg-canvas border-b border-border">
      <div className="max-w-[1360px] mx-auto px-4 md:px-10 h-16 flex items-center gap-5 lg:gap-9">
        <MobileNav
          freshnessSlot={
            <Suspense fallback={<div className="w-24 h-6" />}>
              <FreshnessBadge display="inline-flex" />
            </Suspense>
          }
        />
        <Link href="/" className="flex items-center gap-3 shrink-0 hover:no-underline" aria-label="Gulf Cryo — Overview">
          {/* Official logo on a white plate: its blue "Cryo" has too little
              contrast against the dark navy header on its own. */}
          <span className="flex items-center rounded-md bg-white px-2 py-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Gulf Cryo" width={1600} height={782} className="h-8 w-auto" />
          </span>
          <span className="hidden sm:inline text-sm font-medium tracking-[0.06em] text-ink-faint whitespace-nowrap">
            / OPERATIONS
          </span>
        </Link>

        <NavTabs />

        <div className="ml-auto flex items-center gap-4">
          <Suspense fallback={<div className="hidden xl:block w-56 h-9" />}>
            <SearchBox />
          </Suspense>
          <ZuluClock className="hidden xl:inline font-mono text-xs text-ink-faint whitespace-nowrap" />
          <Suspense fallback={<div className="hidden lg:block w-24 h-6" />}>
            <FreshnessBadge />
          </Suspense>
          <RefreshButton />
          <ThemeToggle />
          <NotificationsMenu items={intel.items} live={intel.live} />
          <SettingsMenu />
        </div>
      </div>
    </header>
  );
}
