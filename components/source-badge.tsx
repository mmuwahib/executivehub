import { outletBrand } from "@/lib/outlet-brand";
import { TONE_CHIP } from "@/lib/tone";

export default function SourceBadge({ source, className = "" }: { source: string; className?: string }) {
  const { initials, tone } = outletBrand(source);
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${TONE_CHIP[tone]}`}>
        {initials}
      </span>
      {source}
    </span>
  );
}
