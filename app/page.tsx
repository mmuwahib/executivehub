import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import KpiCockpit from "@/components/kpi-cockpit";
import AlertPanel from "@/components/alert-panel";
import MarketPanel from "@/components/market-panel";
import BusinessPanel from "@/components/business-panel";
import IndustryPanel from "@/components/industry-panel";
import ProjectTracker from "@/components/project-tracker";
import SourceList from "@/components/source-list";
import SectionDivider from "@/components/section-divider";
import FooterBar from "@/components/footer-bar";
import { mockDispatchData } from "@/lib/mock-data";
import { formatWeekOf } from "@/lib/utils";
import { DispatchData } from "@/lib/types";

async function getDispatchData(): Promise<DispatchData> {
  // Phase 2: fetch from /api/dispatch (Azure Functions + Blob Storage).
  // Using mock data for local development until the backend is wired up.
  return mockDispatchData;
}

export default async function DashboardPage() {
  const data = await getDispatchData();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
          <section id="dashboard">
            <KpiCockpit
              geopolitical={data.kpi.geopolitical}
              industry={data.kpi.industry}
              projects={data.kpi.projects}
            />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <AlertPanel
                id="geopolitical"
                title="Intelligence Alerts"
                items={data.alerts}
                badge="Priority 1"
              />
            </div>
            <div className="lg:col-span-4">
              <MarketPanel id="markets" markets={data.markets} energy={data.energy} />
              <div id="energy" />
            </div>
            <div className="lg:col-span-4">
              <BusinessPanel
                businessId="business"
                gulfcryoId="gulfcryo"
                business={data.business}
                gulfcryo={data.gulfcryo}
              />
            </div>
          </div>

          {data.weekly && (
            <>
              <SectionDivider weekOf={formatWeekOf(new Date(data.date))} />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-6">
                  <IndustryPanel id="industry-summary" items={data.weekly.industry} />
                </div>
                <div className="lg:col-span-6">
                  <ProjectTracker id="project-tracker" items={data.weekly.projects} />
                </div>
              </div>
            </>
          )}

          <div className="mt-8">
            <SourceList id="sources" sources={data.sources} />
          </div>
        </main>
        <FooterBar generatedAt={data.generated_at} strategicAlert={data.strategic_alert} />
      </div>
    </div>
  );
}
