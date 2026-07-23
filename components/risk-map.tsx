import { CountryRiskPoint, HotZone, CriticalIncident } from "@/lib/types";
import { RISK_TONE, TONE_FILL, TONE_STROKE } from "@/lib/tone";
import { MAP_BOUNDS, COUNTRY_PATHS, CONTEXT_PATHS } from "@/lib/mena-geo";

// Real, simplified country border shapes (see lib/mena-geo.ts) projected with
// this exact bounding box, so map math and marker math always agree. Everything
// — country fills, markers, labels — lives in ONE svg sharing one viewBox with
// preserveAspectRatio="xMidYMid slice": it scales uniformly and crops overflow
// instead of stretching, so shapes can never distort at any panel size.
const VB_W = 1000;
const VB_H = (VB_W * (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);

function project(lat: number, lng: number) {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * VB_W;
  const y = VB_H - ((lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * VB_H;
  return { x, y };
}

export default function RiskMap({
  countryRisk,
  hotZone,
  criticalIncident,
}: {
  countryRisk: CountryRiskPoint[];
  hotZone: HotZone;
  criticalIncident: CriticalIncident;
}) {
  const hotZonePos = project(hotZone.lat, hotZone.lng);
  const incidentPos = project(criticalIncident.lat, criticalIncident.lng);

  return (
    <div className="absolute inset-0">
      {/* Ambient region glow, behind everything */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 55% 65% at 65% 55%, rgb(var(--color-accent) / 0.14), transparent 72%)" }}
      />

      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
        {/* Graticule */}
        {[12.5, 25, 37.5, 50, 62.5, 75, 87.5].map((pct) => (
          <line key={`v${pct}`} x1={(pct / 100) * VB_W} y1={0} x2={(pct / 100) * VB_W} y2={VB_H} className="stroke-border" strokeWidth={1} />
        ))}
        {[25, 50, 75].map((pct) => (
          <line key={`h${pct}`} x1={0} y1={(pct / 100) * VB_H} x2={VB_W} y2={(pct / 100) * VB_H} className="stroke-border" strokeWidth={1} />
        ))}

        {/* Neighboring countries — muted, for geographic context only */}
        {Object.entries(CONTEXT_PATHS).map(([name, d]) => (
          <path key={name} d={d} className="fill-ink/[0.06] stroke-border" strokeWidth={1} />
        ))}

        {/* GC territories — filled by risk tier */}
        {countryRisk.map((c) => {
          const d = COUNTRY_PATHS[c.country];
          if (!d) return null;
          const tone = RISK_TONE[c.tier];
          return (
            <path key={c.country} d={d} className={`${TONE_FILL[tone]} ${TONE_STROKE[tone]} transition-opacity hover:opacity-90`} strokeWidth={1.5}>
              <title>
                {c.country} — {c.tier.toUpperCase()} RISK
              </title>
            </path>
          );
        })}

        {/* Critical incident marker */}
        <g>
          <circle cx={incidentPos.x} cy={incidentPos.y} r={26} className="fill-none stroke-warning/40">
            <animate attributeName="r" values="14;30;14" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx={incidentPos.x} cy={incidentPos.y} r={8} className="fill-warning/20 stroke-warning" strokeWidth={2} />
          <circle cx={incidentPos.x} cy={incidentPos.y} r={3} className="fill-warning" />
          <text x={incidentPos.x + 14} y={incidentPos.y + 4} className="fill-warning" style={{ fontSize: 15, fontFamily: "var(--font-mono, monospace)" }}>
            {criticalIncident.title.split(":")[0]}
          </text>
        </g>

        {/* Hot zone marker (primary) */}
        <g>
          <circle cx={hotZonePos.x} cy={hotZonePos.y} r={64} className="fill-none stroke-accent/20">
            <animate attributeName="r" values="40;72;40" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx={hotZonePos.x} cy={hotZonePos.y} r={38} className="fill-none stroke-accent/30">
            <animate attributeName="r" values="24;44;24" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx={hotZonePos.x} cy={hotZonePos.y} r={13} className="fill-accent/15 stroke-accent" strokeWidth={2} />
          <circle cx={hotZonePos.x} cy={hotZonePos.y} r={4.5} className="fill-accent" />
          <text x={hotZonePos.x + 18} y={hotZonePos.y + 4} className="fill-accent font-semibold" style={{ fontSize: 15, fontFamily: "var(--font-mono, monospace)" }}>
            {hotZone.name}
          </text>
        </g>
      </svg>

      {/* Severity legend — top right */}
      <div className="absolute top-4 right-4 glass-card rounded p-3 w-40 z-10">
        <div className="font-mono text-[10px] text-ink-faint tracking-wide mb-2">SEVERITY</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-mono text-ink">
            <span className="w-2.5 h-2.5 rounded-full bg-danger" /> High Risk
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-ink">
            <span className="w-2.5 h-2.5 rounded-full bg-warning" /> Moderate Risk
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-ink">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" /> Low Risk
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-ink">
            <span className="w-2.5 h-2.5 rounded-full bg-warning animate-pulse-glow" /> Incident
          </div>
        </div>
      </div>

      {/* Hot zone detail card — bottom left */}
      <div className="absolute bottom-4 left-4 glass-card p-4 rounded border-accent/30 w-64 z-10">
        <div className="font-mono text-[10px] text-accent mb-1">HOT ZONE DETECTED</div>
        <div className="text-headline-sm text-ink mb-2">{hotZone.name}</div>
        <p className="text-[11px] text-ink-muted leading-relaxed">
          {hotZone.detail} ({hotZone.coords})
        </p>
      </div>
    </div>
  );
}
