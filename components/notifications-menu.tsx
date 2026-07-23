"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/lib/icons";
import { LiveIntelItem } from "@/lib/types";

export default function NotificationsMenu({ items }: { items: LiveIntelItem[] }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleToggle() {
    setOpen((o) => !o);
    setUnread(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="text-ink-muted hover:text-accent transition-colors relative"
        aria-label="Notifications"
      >
        <Icon name="notifications" size={20} />
        {unread && <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-danger rounded-full" />}
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-80 glass-card rounded shadow-lg z-50 py-2 max-h-96 overflow-y-auto custom-scrollbar">
          <div className="px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-ink-faint border-b border-border">
            Live Intel Feed
          </div>
          {items.map((item, i) => (
            <div key={i} className="px-4 py-3 border-b border-border last:border-0">
              <p className="text-sm text-ink">{item.title}</p>
              <p className="font-mono text-[10px] text-ink-faint mt-1">{item.time}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
