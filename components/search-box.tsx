"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/lib/icons";

export default function SearchBox() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
    setMobileOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!mobileOpen) return;
    mobileInputRef.current?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileOpen]);

  function handleChange(next: string) {
    setValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) {
        params.set("q", next);
      } else {
        params.delete("q");
      }
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    }, 300);
  }

  return (
    <>
      <div className="relative hidden xl:block">
        <Icon
          name="search"
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search Intelligence..."
          className="bg-panel-high/50 border-none rounded pl-10 pr-4 py-2 w-56 text-ink text-sm focus:ring-1 focus:ring-accent/50 placeholder:text-ink-faint"
        />
      </div>

      <button
        onClick={() => setMobileOpen(true)}
        className="xl:hidden text-ink-muted hover:text-accent transition-colors"
        aria-label="Search"
      >
        <Icon name="search" size={20} />
      </button>

      {mobileOpen && (
        <div className="fixed inset-x-0 top-16 z-40 xl:hidden bg-surface border-b border-border p-3">
          <div className="relative">
            <Icon
              name="search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              ref={mobileInputRef}
              type="text"
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Search Intelligence..."
              className="bg-panel-high/50 border-none rounded pl-10 pr-10 py-2 w-full text-ink text-sm focus:ring-1 focus:ring-accent/50 placeholder:text-ink-faint"
            />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint hover:text-accent"
              aria-label="Close search"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
