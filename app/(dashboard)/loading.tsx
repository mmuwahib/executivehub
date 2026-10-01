// Shown inside the dashboard shell while a page's data loads. The header,
// markets strip and footer come from layout.tsx, so only the content area
// needs a skeleton here.
export default function DashboardLoading() {
  return (
    <div className="animate-pulse flex flex-col gap-6" aria-label="Loading">
      <div className="h-28 rounded-xl bg-panel-high" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-96 rounded-xl bg-panel-high" />
        <div className="lg:col-span-4 h-96 rounded-xl bg-panel-high" />
      </div>
    </div>
  );
}
