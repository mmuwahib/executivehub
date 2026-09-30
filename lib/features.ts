// Feature flags. NEXT_PUBLIC_ values are inlined at build time, so changing
// one needs a rebuild/redeploy (see .github/workflows/deploy-web.yml).

// Geopolitical section (page, nav entry, dashboard pulse card + KPI, GEO chip,
// geopolitical ticker items) is hidden unless explicitly turned on.
export const SHOW_GEOPOLITICAL = process.env.NEXT_PUBLIC_SHOW_GEOPOLITICAL === "true";
