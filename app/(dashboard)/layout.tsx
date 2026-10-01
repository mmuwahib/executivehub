import AppHeader from "@/components/app-header";
import MarketTicker from "@/components/market-ticker";
import FooterTicker from "@/components/footer-ticker";
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
      <main className="max-w-[1360px] mx-auto px-4 md:px-10 pt-8 pb-20 min-h-screen">{children}</main>
      <FooterTicker items={intel.items} live={intel.live} />
    </>
  );
}
