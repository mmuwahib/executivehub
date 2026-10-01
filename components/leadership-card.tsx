import { LeadershipAppointment } from "@/lib/types";
import { TONE_CHIP } from "@/lib/tone";
import { companyTone } from "@/lib/company";
import { safeUrl } from "@/lib/safe-url";

export default function LeadershipCard({ appointment }: { appointment: LeadershipAppointment }) {
  const tone = companyTone(appointment.company);

  return (
    <a
      href={safeUrl(appointment.sourceUrl)}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-lg bg-panel-high p-4 flex gap-4 hover:bg-panel-highest transition-colors group"
    >
      <span
        className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${TONE_CHIP[tone]}`}
      >
        {appointment.initials}
      </span>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-[15px] font-semibold leading-snug text-ink group-hover:text-accent transition-colors">
          {appointment.role}
        </p>
        <p className="eyebrow text-accent">
          {appointment.company} · {appointment.region}
        </p>
        <p className="text-[13px] text-ink-muted leading-relaxed">{appointment.desc}</p>
        <p className="text-[12px] text-ink-faint">{appointment.source}</p>
      </div>
    </a>
  );
}
