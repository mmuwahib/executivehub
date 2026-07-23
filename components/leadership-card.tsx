import { LeadershipAppointment } from "@/lib/types";
import { TONE_TEXT, TONE_BORDER, TONE_CHIP, REGION_TONE } from "@/lib/tone";
import { companyTone } from "@/lib/company";
import SourceBadge from "@/components/source-badge";

export default function LeadershipCard({ appointment }: { appointment: LeadershipAppointment }) {
  const tone = companyTone(appointment.company);

  return (
    <a
      href={appointment.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`glass-card rounded p-5 flex gap-4 border-l-4 ${TONE_BORDER[tone]} hover:bg-ink/5 transition-colors group`}
    >
      <div
        className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${TONE_CHIP[tone]}`}
      >
        {appointment.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm font-bold text-ink group-hover:text-accent transition-colors">
            {appointment.role}
          </p>
          <span className={`px-2 py-0.5 font-mono text-[10px] rounded uppercase ${TONE_CHIP[REGION_TONE[appointment.region]]}`}>
            {appointment.region}
          </span>
        </div>
        <p className={`font-mono text-[11px] uppercase tracking-wide mt-0.5 ${TONE_TEXT[tone]}`}>
          {appointment.company}
        </p>
        <p className="text-ink-muted text-[13px] mt-2 leading-relaxed">{appointment.desc}</p>
        <SourceBadge source={appointment.source} className="font-mono text-[10px] text-ink-faint mt-2" />
      </div>
    </a>
  );
}
