"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/lib/icons";

// Re-runs the server components so the page picks up the latest published
// dispatch. It does not trigger a new Claude refresh (those run on a schedule).
export default function RefreshButton() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  function handleRefresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 800);
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={refreshing}
      className="text-ink-muted hover:text-accent transition-colors disabled:opacity-60"
      aria-label="Reload latest data"
      title="Reload latest data"
    >
      <Icon name="sync" size={18} className={refreshing ? "animate-spin" : undefined} />
    </button>
  );
}
