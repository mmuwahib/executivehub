import { Tone, Region, RiskTier } from "./types";

export const REGION_TONE: Record<Region, Tone> = {
  MENA: "accent",
  Europe: "cyan",
  ASEAN: "warning",
  Americas: "neutral",
};

export const RISK_TONE: Record<RiskTier, Tone> = {
  low: "accent",
  moderate: "warning",
  high: "danger",
};

export const TONE_TEXT: Record<Tone, string> = {
  accent: "text-accent",
  cyan: "text-cyan",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-ink-muted",
};

export const TONE_BG: Record<Tone, string> = {
  accent: "bg-accent",
  cyan: "bg-cyan",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-ink-faint",
};

export const TONE_BORDER: Record<Tone, string> = {
  accent: "border-accent/30",
  cyan: "border-cyan/30",
  warning: "border-warning/30",
  danger: "border-danger/30",
  neutral: "border-border",
};

export const TONE_CHIP: Record<Tone, string> = {
  accent: "bg-accent/10 text-accent border border-accent/30",
  cyan: "bg-cyan/10 text-cyan border border-cyan/30",
  warning: "bg-warning/10 text-warning border border-warning/30",
  danger: "bg-danger/10 text-danger border border-danger/30",
  neutral: "bg-panel-highest text-ink-muted border border-border",
};

export const TONE_FILL: Record<Tone, string> = {
  accent: "fill-accent/75",
  cyan: "fill-cyan/75",
  warning: "fill-warning/75",
  danger: "fill-danger/75",
  neutral: "fill-ink-faint/40",
};

export const TONE_STROKE: Record<Tone, string> = {
  accent: "stroke-accent",
  cyan: "stroke-cyan",
  warning: "stroke-warning",
  danger: "stroke-danger",
  neutral: "stroke-ink-faint",
};

// Solid (full-opacity) top-border accent — used on KPI cards to tie each
// stat to its tone color at a glance, distinct from TONE_BORDER's subtle
// all-round 30%-opacity outline.
export const TONE_BORDER_TOP: Record<Tone, string> = {
  accent: "border-t-accent",
  cyan: "border-t-cyan",
  warning: "border-t-warning",
  danger: "border-t-danger",
  neutral: "border-t-ink-faint",
};
