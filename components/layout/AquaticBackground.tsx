import type { CSSProperties } from "react";

const bubbles = [
  { left: "8%", size: 10, delay: 0, duration: 16 },
  { left: "24%", size: 6, delay: 4, duration: 13 },
  { left: "38%", size: 14, delay: 9, duration: 19 },
  { left: "55%", size: 8, delay: 2, duration: 15 },
  { left: "68%", size: 12, delay: 7, duration: 18 },
  { left: "82%", size: 6, delay: 11, duration: 14 },
  { left: "93%", size: 10, delay: 5, duration: 17 },
];

const glints = [
  { x: "79%", y: "44%", d: 0 },
  { x: "73%", y: "58%", d: 1.6 },
  { x: "84%", y: "66%", d: 3 },
  { x: "66%", y: "74%", d: 4.2 },
  { x: "20%", y: "52%", d: 2.4 },
];

export default function AquaticBackground() {
  return (
    <>
      <svg
        width="0"
        height="0"
        style={{ position: "absolute" }}
        aria-hidden="true"
      >
        <defs>
          <filter
            id="k-lens"
            x="0"
            y="0"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.018"
              numOctaves="2"
              seed="4"
              result="n"
            />
            <feGaussianBlur in="n" stdDeviation="1.5" result="nb" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="nb"
              scale="22"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div className="kb" aria-hidden="true">
        <div className="kb-photo" />
        <div className="kb-tint" />
        <div className="kb-sheen" />

        {glints.map((glint, index) => (
          <span
            key={index}
            className="kb-glint"
            style={
              {
                left: glint.x,
                top: glint.y,
                animationDelay: `${glint.d}s`,
              } as CSSProperties
            }
          />
        ))}

        {bubbles.map((bubble, index) => (
          <span
            key={index}
            className="kb-bubble"
            style={
              {
                left: bubble.left,
                width: bubble.size,
                height: bubble.size,
                animationDelay: `${bubble.delay}s`,
                animationDuration: `${bubble.duration}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </>
  );
}
