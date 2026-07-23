import { ReactNode } from "react";
import Image from "next/image";
import { Icon } from "@/lib/icons";
import { Tone } from "@/lib/types";
import { TONE_BG, TONE_TEXT } from "@/lib/tone";

// Shared "hero" visual. With an `image` (a local /public file — never a
// hotlinked external URL), renders that photo with a bottom scrim for depth.
// Without one, falls back to a tone-colored wash + icon treatment so callers
// that don't have a photo yet still look intentional, not broken.
export default function VisualTile({
  icon,
  tone = "neutral",
  className = "h-40",
  image,
  children,
}: {
  icon: string;
  tone?: Tone;
  className?: string;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className={`absolute top-0 left-0 right-0 h-1 z-10 ${TONE_BG[tone]}`} />
      {image ? (
        <>
          <Image src={image} alt="" fill sizes="(max-width: 1024px) 100vw, 500px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/70 via-surface/0 to-black/10" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-panel-high via-panel to-surface" />
          <div
            className={`absolute inset-0 opacity-30 ${TONE_BG[tone]}`}
            style={{ clipPath: "polygon(60% 0, 100% 0, 100% 100%, 85% 100%)" }}
          />
          <div className="absolute inset-0 map-mesh opacity-30" />
          <Icon name={icon} size={96} className="absolute -right-4 -bottom-4 text-ink-faint/10" />
          <div className="relative h-full flex items-center justify-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-panel-highest/80 ${TONE_TEXT[tone]}`}>
              <Icon name={icon} size={28} />
            </div>
          </div>
        </>
      )}
      {children}
    </div>
  );
}
