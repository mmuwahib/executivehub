export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-canvas animate-pulse">
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-sidebar bg-surface-low border-r border-border" />
      <header className="fixed top-0 left-0 lg:left-sidebar right-0 h-16 bg-surface border-b border-border" />

      <div className="lg:ml-sidebar pt-16 pb-10 min-h-screen">
        <main className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-panel-high" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 h-96 rounded-xl bg-panel-high" />
            <div className="lg:col-span-4 h-96 rounded-xl bg-panel-high" />
          </div>
        </main>
      </div>
    </div>
  );
}
