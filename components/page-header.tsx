import { ReactNode } from "react";

// Title block at the top of each section page: cadence eyebrow, title,
// one-line description, optional actions on the right.
export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap justify-between items-end gap-6">
      <div className="flex flex-col gap-1 min-w-0">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="m-0 text-[32px] font-bold leading-tight tracking-tight text-ink">{title}</h1>
        {description && <p className="m-0 text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
