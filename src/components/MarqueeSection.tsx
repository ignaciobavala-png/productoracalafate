"use client";

const PLACEHOLDERS = [
  "linear-gradient(135deg, #0d4f5c 0%, #1a2a3a 100%)",
  "linear-gradient(135deg, #3d2314 0%, #7a4020 100%)",
  "linear-gradient(135deg, #0a2617 0%, #1d4a2a 100%)",
  "linear-gradient(135deg, #c67c2a 0%, #8b4513 100%)",
  "linear-gradient(135deg, #1a1060 0%, #134e5e 100%)",
  "linear-gradient(135deg, #2c3e50 0%, #3d5a73 100%)",
  "linear-gradient(135deg, #71b280 0%, #1d4a2a 100%)",
  "linear-gradient(135deg, #2d1b69 0%, #134e5e 100%)",
];

interface MarqueeSectionProps {
  slots: string[];
}

export function MarqueeSection({ slots }: MarqueeSectionProps) {
  if (slots.length === 0) return null;

  const track = [...slots, ...slots];
  const dur = Math.max(slots.length * 7, 36);

  return (
    <div className="overflow-hidden py-8" aria-hidden="true">
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee-scroll ${dur}s linear infinite;
          will-change: transform;
        }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>

      <div className="marquee-track flex gap-3">
        {track.map((src, i) => (
          <div
            key={i}
            className="shrink-0 h-[52vh] w-[38rem] overflow-hidden group/card"
            style={
              !src
                ? { background: PLACEHOLDERS[i % PLACEHOLDERS.length] }
                : undefined
            }
          >
            {src && (
              <img
                src={src}
                alt=""
                draggable="false"
                className="h-full w-full object-cover select-none scale-100 group-hover/card:scale-105 transition-transform duration-700 ease-out"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
