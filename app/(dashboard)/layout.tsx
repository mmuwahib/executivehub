import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import MarketTicker from "@/components/market-ticker";
import FooterTicker from "@/components/footer-ticker";
import { FOOTER_TICKER } from "@/lib/nav";
import { getMarketTicker } from "@/lib/api";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tickerItems = await getMarketTicker();

  return (
    <>
      <Sidebar />
      <Topbar />
      <div className="lg:ml-sidebar pt-16 pb-10 min-h-screen">
        <MarketTicker items={tickerItems} />
        <main className="p-6 md:p-8">{children}</main>
      </div>
      <FooterTicker items={FOOTER_TICKER} />
    </>
  );
}
