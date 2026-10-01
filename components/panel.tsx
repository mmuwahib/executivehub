import { ReactNode } from "react";

// The console's standard section container: a flat bordered panel with an
// optional title row. Used by every page so spacing and headings stay uniform.
export default function Panel({
  title,
  aside,
  children,
  className = "",
  id,
}: {
  title?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`glass-card rounded-xl p-6 flex flex-col gap-5 min-w-0 ${className}`}>
      {(title || aside) && (
        <div className="flex justify-between items-baseline gap-4">
          {title && <h2 className="m-0 text-lg font-bold text-ink">{title}</h2>}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}
