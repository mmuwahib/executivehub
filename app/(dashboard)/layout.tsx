import AppHeader from "@/components/app-header";
import MarketTicker from "@/components/market-ticker";
import FooterTicker from "@/components/footer-ticker";
import { ProvenanceLegend } from "@/components/provenance-tag";
import { getMarketTicker, getIntelFeed } from "@/lib/api";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ticker = await getMarketTicker();
  const intel = await getIntelFeed();

  return (
    <>
      <AppHeader />
      <MarketTicker items={ticker.items} live={ticker.live} />
      <main className="max-w-[1360px] mx-auto px-4 md:px-10 pt-5 pb-20 min-h-screen flex flex-col gap-6">
        <ProvenanceLegend />
        <div>{children}</div>
      </main>
      <FooterTicker items={intel.items} live={intel.live} />
    </>
  );
}
