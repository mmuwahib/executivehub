import Link from "next/link";

export interface FilterChip {
  label: string;
  href: string;
  active: boolean;
}

// Link-based filter pills; filters live in the URL so they survive reloads
// and can be shared.
export default function FilterChips({ label, chips }: { label?: string; chips: FilterChip[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {label && <span className="eyebrow mr-1.5">{label}</span>}
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          aria-current={chip.active ? "true" : undefined}
          className={`px-3.5 py-1.5 rounded-full text-[13px] transition-colors hover:no-underline ${
            chip.active ? "bg-accent text-accent-on font-semibold" : "bg-panel-high text-ink-muted hover:text-ink"
          }`}
        >
          {chip.label}
        </Link>
      ))}
    </div>
  );
}
