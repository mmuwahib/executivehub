"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { safeUrl } from "@/lib/safe-url";
import { SourceRef } from "@/lib/types";

export interface Insight {
  heading: string;
  definition?: string;
  basis?: string;
  sources?: SourceRef[];
}

const PANEL_WIDTH = 320;

// "Why and how" behind a rating, score or KPI. Opens on hover or keyboard
// focus, click/tap pins it open (touch), Escape or an outside click closes.
// Positioned `fixed` from the trigger so scrolling containers (the heatmap
// scrolls sideways on narrow screens) can't clip it, and it stays open while
// the pointer or focus is inside it so the source links can be used.
export default function InsightPopover({
  insight,
  children,
  className = "",
  label,
}: {
  insight: Insight;
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; above: boolean } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.min(PANEL_WIDTH, window.innerWidth - 16);
    const left = Math.min(Math.max(8, r.left + r.width / 2 - width / 2), window.innerWidth - width - 8);
    const above = r.bottom + 260 > window.innerHeight && r.top > 260;
    setPos({ top: above ? r.top - 8 : r.bottom + 8, left, above });
  }, []);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const show = () => {
    cancelClose();
    place();
    setOpen(true);
  };
  const hideSoon = () => {
    if (pinned) return;
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };
  const closeNow = () => {
    cancelClose();
    setOpen(false);
    setPinned(false);
  };

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeNow();
        triggerRef.current?.focus();
      }
    }
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) closeNow();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, place]);

  useEffect(() => () => cancelClose(), []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className={`text-left cursor-help focus-visible:outline-2 ${className}`}
        onMouseEnter={show}
        onMouseLeave={hideSoon}
        onFocus={show}
        onBlur={hideSoon}
        onClick={() => {
          if (pinned) closeNow();
          else {
            show();
            setPinned(true);
          }
        }}
      >
        {children}
      </button>
      {open && pos && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label={insight.heading}
          onMouseEnter={cancelClose}
          onMouseLeave={hideSoon}
          onFocusCapture={cancelClose}
          onBlurCapture={hideSoon}
          className="fixed z-50 rounded-xl border border-border-strong bg-panel-high p-4 shadow-2xl text-left normal-case tracking-normal font-normal"
          style={{
            top: pos.top,
            left: pos.left,
            width: `min(${PANEL_WIDTH}px, calc(100vw - 16px))`,
            transform: pos.above ? "translateY(-100%)" : undefined,
          }}
        >
          <p className="m-0 text-sm font-semibold text-ink">{insight.heading}</p>
          {insight.definition && <p className="mt-1 mb-0 text-[12px] leading-snug text-ink-faint">{insight.definition}</p>}
          <div className="mt-3 flex flex-col gap-1">
            <span className="eyebrow">Why</span>
            {insight.basis ? (
              <p className="m-0 text-[13px] leading-relaxed text-ink-muted">{insight.basis}</p>
            ) : (
              <p className="m-0 text-[12px] text-warning">No sourced reasoning yet. It appears after the next refresh.</p>
            )}
          </div>
          {insight.sources && insight.sources.length > 0 && (
            <div className="mt-3 flex flex-col gap-1">
              <span className="eyebrow">Sources</span>
              {insight.sources.map((s) => (
                <a key={s.url} href={safeUrl(s.url)} target="_blank" rel="noopener noreferrer" className="text-[13px] leading-snug">
                  {s.title} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
