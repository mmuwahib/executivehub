"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

// Desktop section tabs in the header. Below `lg` the same items live in the
// MobileNav drawer (via NavList).
export default function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-stretch gap-6 h-16" aria-label="Sections">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center text-sm border-b-2 transition-colors whitespace-nowrap ${
              active
                ? "border-accent text-ink font-semibold"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
