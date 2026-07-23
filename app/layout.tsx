import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Self-hosted at build time by next/font (no runtime request to Google) —
// gives numeric/data displays a genuine monospace face instead of the
// Segoe UI fallback, which isn't actually monospaced.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gulf Cryo Executive Intelligence",
  description: "Executive intelligence dashboard for GulfCryo",
  icons: {
    icon: "/favicon.png",
  },
};

// Runs before hydration so the correct theme class is set pre-paint —
// avoids a flash of the wrong theme on load.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("gc-theme");
    var theme = stored === "light" ? "light" : "dark";
    document.documentElement.classList.add(theme);
  } catch (e) {
    document.documentElement.classList.add("dark");
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`font-sans bg-canvas text-ink antialiased ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
