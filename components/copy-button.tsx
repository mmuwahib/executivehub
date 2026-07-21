"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="font-mono text-[11px] text-on-surface-variant truncate">
        {url}
      </span>
      <button
        onClick={handleCopy}
        className={`flex items-center gap-1 shrink-0 border px-2 py-1 text-[11px] font-medium transition-colors ${
          copied
            ? "border-tertiary text-tertiary"
            : "border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface"
        }`}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
