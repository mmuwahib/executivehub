// sourceUrl values come from model output, so only ever render https links.
// Anything else (javascript:, data:, malformed) becomes an inert "#".
export function safeUrl(url: string | undefined | null): string {
  if (!url) return "#";
  try {
    return new URL(url).protocol === "https:" ? url : "#";
  } catch {
    return "#";
  }
}
