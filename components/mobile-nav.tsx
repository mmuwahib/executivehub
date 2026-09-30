"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/lib/icons";
import { STATUS_CHIPS } from "@/lib/nav";
import { TONE_TEXT, TONE_BG } from "@/lib/tone";
import Logo from "@/components/logo";
import NavList from "@/components/nav-list";

// Off-canvas drawer for the sidebar's nav below the `lg` breakpoint, where
// Sidebar is `hidden`. Reuses NavList so desktop and mobile can't drift on
// which pages/countries link where. `freshnessSlot` is passed in from the
// (server) Topbar since FreshnessBadge is an async Server Component this
// client component can't import directly.
export default function MobileNav({ freshnessSlot }: { freshnessSlot?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        className="lg:hidden text-ink-muted hover:text-accent transition-colors"
        aria-label="Open navigation menu"
        aria-expanded={open}
      >
        <Icon name="menu" size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute left-0 top-0 h-full w-[min(80vw,260px)] bg-surface-low border-r border-border flex flex-col outline-none"
          >
            <div className="p-6 flex items-center justify-between">
              <Logo variant="full" />
              <button
                onClick={close}
                className="text-ink-muted hover:text-accent transition-colors"
                aria-label="Close navigation menu"
              >
                <Icon name="close" size={22} />
              </button>
            </div>

            <nav className="flex-1 px-2 mt-2 space-y-1 custom-scrollbar overflow-y-auto">
              <NavList />
            </nav>

            <div className="p-4 border-t border-border space-y-3">
              <Link
                href="/#market-data"
                className="block font-mono text-ticker-data text-accent hover:underline"
              >
                Markets
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                {STATUS_CHIPS.map((chip) => (
                  <span
                    key={chip.label}
                    className={`flex items-center gap-1 text-[10px] font-bold uppercase ${TONE_TEXT[chip.tone]}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${TONE_BG[chip.tone]}`} /> {chip.label}
                  </span>
                ))}
              </div>
              {freshnessSlot}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
