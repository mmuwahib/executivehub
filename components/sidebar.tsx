"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/lib/icons";
import Logo from "@/components/logo";
import NavList from "@/components/nav-list";

export default function Sidebar() {
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
        <NavList />
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
