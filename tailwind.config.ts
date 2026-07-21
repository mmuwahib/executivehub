import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0f62fe",
        "primary-dark": "#0043ce",
        tertiary: "#198038",
        error: "#da1e28",
        "on-surface": "#161616",
        "on-surface-variant": "#525252",
        outline: "#8d8d8d",
        "outline-variant": "#e0e0e0",
        surface: "#ffffff",
        "surface-container": "#f4f4f4",
      },
      fontFamily: {
        sans: ["var(--font-ibm-plex-sans)", "IBM Plex Sans", "sans-serif"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      borderRadius: {
        none: "0",
        DEFAULT: "0",
        sm: "0",
        md: "0",
        lg: "0",
        xl: "0",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
