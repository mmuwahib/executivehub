import { getDataFreshness } from "@/lib/api";
import { TONE_CHIP } from "@/lib/tone";

const STALE_AFTER_MS = 36 * 60 * 60 * 1000;

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default async function FreshnessBadge() {
  const { live, generatedAt } = await getDataFreshness();

  if (live && generatedAt) {
    const generatedLabel = new Date(generatedAt).toLocaleString("en-GB", {
      timeZone: "UTC",
      dateStyle: "medium",
      timeStyle: "short",
    });
    // The daily refresh runs every 24h; past 36h at least one run has failed
    // or been rejected by validation, so don't keep claiming the data is live.
    const stale = Date.now() - new Date(generatedAt).getTime() > STALE_AFTER_MS;
    if (stale) {
      return (
        <span
          title={`Last successful refresh ${generatedLabel} UTC — newer refreshes have failed or been rejected`}
          className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${TONE_CHIP.warning}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-warning" />
          Stale &middot; {formatRelativeTime(generatedAt)}
        </span>
      );
    }
    return (
      <span
        title={`Live data refreshed ${generatedLabel} UTC`}
        className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${TONE_CHIP.accent}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-glow" />
        Live &middot; {formatRelativeTime(generatedAt)}
      </span>
    );
  }

  return (
    <span
      title="No successful data refresh yet — showing preview content"
      className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${TONE_CHIP.warning}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-warning" />
      Preview data
    </span>
  );
}
