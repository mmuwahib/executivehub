import type { Config } from "tailwindcss";

// Reads a CSS variable holding a space-separated RGB triplet (e.g. "97 129 180")
// and wraps it so Tailwind's opacity modifiers (bg-accent/10) work correctly.
function withOpacity(variable: string) {
  return `rgb(var(${variable}) / <alpha-value>)`;
}

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme-adaptive tokens — RGB triplets defined as CSS variables in
        // app/globals.css (:root = dark, :root.light = light). Wrapped with
        // withOpacity() so both bare classes (bg-accent) and opacity
        // modifiers (bg-accent/10) work and repaint on theme change.
        canvas: withOpacity("--color-canvas"),
        surface: withOpacity("--color-surface"),
        "surface-low": withOpacity("--color-surface-low"),
        panel: withOpacity("--color-panel"),
        "panel-high": withOpacity("--color-panel-high"),
        "panel-highest": withOpacity("--color-panel-highest"),
        floor: withOpacity("--color-floor"),
        bright: withOpacity("--color-bright"),
        // border is a fixed, pre-composed translucent overlay (not opacity-
        // modified from class names), so it stays a literal CSS variable.
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        ink: {
          DEFAULT: withOpacity("--color-ink"),
          muted: withOpacity("--color-ink-muted"),
          faint: withOpacity("--color-ink-faint"),
        },
        // Gulf Cryo brand colours (GC_Corporate Guidelines v1.1), also
        // theme-adaptive so contrast stays correct against light/dark surfaces.
        accent: {
          DEFAULT: withOpacity("--color-accent"),
          soft: withOpacity("--color-accent-soft"),
          on: withOpacity("--color-accent-on"),
        },
        // Static brand swatches — reference palette straight from the guide,
        // not theme-adaptive (used for one-off print-accurate accents).
        brand: {
          DEFAULT: "#365888",
          light: "#9EAECA",
          grey: "#909496",
          "grey-dark": "#5b5e61",
          "grey-light": "#E7EBEF",
        },
        cyan: {
          DEFAULT: withOpacity("--color-cyan"),
          soft: withOpacity("--color-cyan-soft"),
        },
        warning: {
          DEFAULT: withOpacity("--color-warning"),
          deep: withOpacity("--color-warning-deep"),
        },
        danger: {
          DEFAULT: withOpacity("--color-danger"),
          deep: withOpacity("--color-danger-deep"),
        },
        // Up-moves and LIVE states. Deliberately not a `Tone` (the API and the
        // Claude prompt share that union), just a colour.
        positive: withOpacity("--color-positive"),
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Segoe UI",
          "Segoe UI Semilight",
          "-apple-system",
          "BlinkMacSystemFont",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "Segoe UI",
          "-apple-system",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        "display-lg": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-sm": ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "ticker-data": ["13px", { lineHeight: "18px", fontWeight: "500" }],
      },
      borderRadius: {
        none: "0",
        DEFAULT: "2px",
        md: "4px",
        lg: "8px",
        xl: "12px",
        full: "9999px",
      },
      spacing: {
        sidebar: "260px",
        gutter: "16px",
        card: "20px",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-glow": {
          "0%": { boxShadow: "0 0 0 0 var(--color-accent-glow-strong)" },
          "70%": { boxShadow: "0 0 0 10px var(--color-accent-glow-none)" },
          "100%": { boxShadow: "0 0 0 0 var(--color-accent-glow-none)" },
        },
      },
      animation: {
        ticker: "ticker 45s linear infinite",
        "ticker-slow": "ticker 60s linear infinite",
        "pulse-glow": "pulse-glow 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
