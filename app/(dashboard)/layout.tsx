import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import MarketTicker from "@/components/market-ticker";
import FooterTicker from "@/components/footer-ticker";
import { getMarketTicker, getIntelFeed } from "@/lib/api";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tickerItems = await getMarketTicker();
  const intel = await getIntelFeed();

  return (
    <>
      <Sidebar />
      <Topbar />
      <div className="lg:ml-sidebar pt-16 pb-10 min-h-screen">
        <MarketTicker items={tickerItems} />
        <main className="p-6 md:p-8">{children}</main>
      </div>
      <FooterTicker items={intel.items} live={intel.live} />
    </>
  );
}
