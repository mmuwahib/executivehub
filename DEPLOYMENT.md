# Deployment Runbook — Azure App Service + Azure Function App

This app deploys as **two separate Azure resources** (Next.js hybrid SSR on Azure
Static Web Apps does not support a linked custom Functions API — confirmed via
Microsoft Learn docs — so SWA is not used here):

| Resource | Hosts | Deploy workflow |
|---|---|---|
| Azure App Service (Linux, Node 20) | `app/`, `components/`, `lib/` — the Next.js dashboard | `.github/workflows/deploy-web.yml` |
| Azure Function App (Node 20) | `api/` — timer refreshes + `getDispatch` + `authenticate` | `.github/workflows/deploy-api.yml` |

Both workflows trigger on push to `main` (path-filtered, so an `api/`-only
commit doesn't rebuild the web app and vice versa) and can also be run
manually via the **Run workflow** button (`workflow_dispatch`).

You'll need to create the Azure resources yourself (no Azure CLI is
installed in this environment, and I don't have an Azure resource-creation
tool available) — the steps below use the Azure Portal, with an equivalent
`az` CLI command under each step if you'd rather script it.

## 1. Create the Function App first

The App Service needs to know the Function App's URL, so create this one first.

**Portal:** Create a resource → **Function App** →
- Runtime stack: **Node.js 20 LTS**, OS: **Linux**, Plan: **Flex Consumption**
  (or Premium). **Not the classic Consumption plan**: a research refresh took
  about 14 minutes in testing, and classic Consumption stops any function at
  10 minutes. `api/host.json` sets `functionTimeout` to 30 minutes, which the
  classic plan rejects.
- It will ask you to create a **Storage Account** alongside it — required,
  this is where `writeJsonBlob`/`getDispatch` read and write
  `current-daily.json` / `current-weekly.json` / `current-tech.json` /
  `markets-latest.json`.

```bash
az functionapp create \
  --resource-group <rg> \
  --flexconsumption-location <region> \
  --runtime node --runtime-version 20 \
  --name <function-app-name> \
  --storage-account <storage-account-name>
```

**Application Settings** (Function App → Configuration → Application settings):

| Name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your real key from console.anthropic.com — the local `api/local.settings.json` value is currently a placeholder and must be replaced with a real key for the daily/weekly refresh functions to work at all |
| `DASHBOARD_PASSWORD` | The login password for the dashboard |
| `AzureWebJobsStorage` | Set automatically to the Storage Account's connection string when created via the portal flow above |
| `MARKET_API_KEY` / `MARKET_API_URL` | Only once you've picked a market-data provider (see the open item below — not yet decided) |

Note the Function App's default hostname, e.g. `https://<function-app-name>.azurewebsites.net` — you'll need it in step 2.

## 2. Create the App Service for the Next.js app

**Portal:** Create a resource → **Web App** →
- Runtime stack: **Node 20 LTS**, OS: **Linux**, Plan: any tier (B1 is enough to start)

```bash
az webapp create \
  --resource-group <rg> \
  --plan <app-service-plan> \
  --name <webapp-name> \
  --runtime "NODE:20-lts"
```

**Application Settings** (Web App → Configuration → Application settings):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_API_BASE` | `https://<function-app-name>.azurewebsites.net` — the Function App's URL from step 1 |

This is read server-side only in this codebase (`lib/api.ts`'s `getBaseUrl()`
and the new `app/api/auth/route.ts` proxy), so despite the `NEXT_PUBLIC_`
prefix it does **not** need to be baked in at CI build time — setting it as
an App Service Application Setting and restarting the app is enough. It
only actually reaches the browser if some future client-side code reads
`process.env.NEXT_PUBLIC_API_BASE` directly — nothing does today.

**Startup Command** (Web App → Configuration → General settings → Startup
Command) — required because `next start` doesn't read Azure's injected
`$PORT` automatically:

```
next start -p $PORT
```

## 3. Why login still works cross-origin-free

`app/login/page.tsx`'s client-side `fetch("/api/auth", ...)` now goes
through [`app/api/auth/route.ts`](app/api/auth/route.ts), a Next.js Route
Handler that forwards the request server-side to the Function App and
re-attaches its `Set-Cookie` on the App Service's own origin. The browser
only ever talks to the App Service — no CORS configuration is needed on the
Function App for login. `/api/logout` (a plain filesystem route) and the
sidebar's "Refresh Feeds" button (`router.refresh()`, no direct fetch) were
already unaffected by the split.

If you add any *new* client-side `fetch()` call straight to
`NEXT_PUBLIC_API_BASE` in the future, either proxy it the same way or add
CORS on the Function App (`Function App → CORS → allowed origins`) —
otherwise the browser will block it.

## 4. Get publish profiles and set GitHub secrets

For each resource: **Overview → Get publish profile** (downloads an XML
file), or:

```bash
az webapp deployment list-publishing-profiles --name <webapp-name> --resource-group <rg> --xml
az functionapp deployment list-publishing-profiles --name <function-app-name> --resource-group <rg> --xml
```

In the GitHub repo ([mmuwahib/executivehub](https://github.com/mmuwahib/executivehub)) →
**Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|---|---|
| `AZURE_WEBAPP_NAME` | `<webapp-name>` |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | contents of the Web App's publish profile XML |
| `AZURE_FUNCTIONAPP_NAME` | `<function-app-name>` |
| `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` | contents of the Function App's publish profile XML |

## 5. First deployment

Push to `main`, or trigger each workflow manually from the **Actions** tab
(**Run workflow**). Watch the run logs; `azure/webapps-deploy@v3` and
`Azure/functions-action@v1` both print the live site URL on success.

## Managing live sources

Every daily/weekly refresh is checked before it is published
(`api/src/validation.ts`). If a run fails any check, the previous
`current-*.json` stays live — a bad night never blanks or corrupts the site.

- **Which outlets can appear**: edit `ALLOWED_SOURCE_DOMAINS` in
  `api/src/outlets.ts` (also injected into the Claude prompt). Add a domain to
  allow an outlet; remove it to stop publishing links from it. Redeploy the
  Function App.
- **What gets dropped**: non-https links, hosts off the allow-list,
  homepage-only links, duplicate links, and links that return 404/410 or a
  dead DNS name. Each drop is logged as a warning
  (`dailyRefresh dropped ... : reason (url)`) in Function App logs /
  Application Insights. A run is rejected outright (logged as an error) if the
  structure is broken or a section falls below its minimum item count.
- **Known limit**: sites that block automated requests (403/timeouts, e.g.
  gasworld.com) can't be link-checked, so those links are kept if they pass
  the host/format checks. Spot-check them after the first live run.
- **Refresh schedule** (UTC): `dailyRefresh` 03:00 every day (dashboard
  news, KPIs, opportunity radar); `weeklyRefresh` Sundays 03:00 (competitor
  heatmap, growth opportunities, white space, project tracker);
  `techRefresh` Sundays 04:00 (Tech & Innovation articles). The weekly work
  is split in two so each run stays well inside the 30-minute function limit
  and a slow tech search can't block the industry analysis.
- **Why and how**: every rating, score, tier and KPI carries a `basis` (the
  evidence) and `sources` (articles), applying the scale in
  `api/src/methodology.ts` (mirrored in `lib/methodology.ts` for the UI).
  Sources get the same link checks as articles; bad ones are removed, the
  rating is kept, and a missing basis is logged rather than invented. The
  dashboard shows this on hover or tap.
- **Rolling back**: every successful run also writes a dated copy
  (`daily/YYYY-MM-DD.json`, `weekly/YYYY-Www.json`, `tech/YYYY-Www.json`) in
  the `dispatch` container. To roll back, copy a dated blob over
  `current-daily.json` / `current-weekly.json` / `current-tech.json` in the
  Azure Portal.
- **Freshness**: the topbar badge shows Live, then Stale once the last good
  daily refresh is over 36 hours old. `generated_at` is stamped by the
  function, not taken from Claude.
- **Cost control**: each daily/weekly run logs its usage
  (`dailyRefresh usage: N API call(s), X input + Y output tokens, S web
  searches, est. $Z`). Locally, refreshes are skipped unless
  `ALLOW_LOCAL_REFRESH` is `true` in `api/local.settings.json`, because the
  timers also fire whenever the Functions host starts. Set it to `true` only
  when you want a paid test run, then set it back. In Azure the guard is off
  automatically.
- **Geopolitical section**: hidden by default. To show it again, set the
  GitHub repo variable `NEXT_PUBLIC_SHOW_GEOPOLITICAL` to `true`
  (Settings → Secrets and variables → Actions → Variables) and redeploy the
  web app; locally, set it in `.env.local` and restart `npm run dev`.

## Still open (not blocking this workflow, but unresolved)

- **Real Anthropic API key** — `api/local.settings.json`'s key is a
  placeholder; the daily/weekly refresh functions can't authenticate until
  you add a real one (locally *and* as the Function App's Application
  Setting in prod).
- **Market data provider** — `marketRefresh.ts` needs a real source decided
  for Brent Crude (EIA API, free) and S&P Industrial (no exact free
  equivalent — nearest proxy is an industrials-sector ETF via Alpha
  Vantage/Twelve Data's free tier); USD/AED and USD/SAR are pegged
  currencies and can just be hardcoded; Helium Spot Index has no known free
  public API (sits behind paid industry subscriptions).
