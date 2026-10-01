"use client";

import { Icon } from "@/lib/icons";

export default function PrintButton({
  label,
  icon = "download",
  className = "flex items-center gap-2 h-10 px-4 rounded-lg border border-border-strong bg-panel-high text-ink text-sm font-semibold hover:bg-panel-highest transition-colors",
}: {
  label: string;
  icon?: string;
  className?: string;
}) {
  return (
    <button onClick={() => window.print()} className={className}>
      <Icon name={icon} size={18} /> {label}
    </button>
  );
}
