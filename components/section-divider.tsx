export default function SectionDivider({ weekOf }: { weekOf: string }) {
  return (
    <div className="flex items-center gap-4 my-8">
      <div className="h-px flex-1 bg-outline-variant" />
      <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant whitespace-nowrap">
        Weekly Intelligence — Week of {weekOf}
      </span>
      <div className="h-px flex-1 bg-outline-variant" />
    </div>
  );
}
