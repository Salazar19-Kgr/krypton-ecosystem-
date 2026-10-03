import type { CSSProperties } from "react";

const bubbles = [
  { left: "8%", size: 10, delay: 0, duration: 16 },
  { left: "22%", size: 6, delay: 4, duration: 13 },
  { left: "37%", size: 14, delay: 9, duration: 19 },
  { left: "52%", size: 8, delay: 2, duration: 15 },
  { left: "66%", size: 12, delay: 7, duration: 18 },
  { left: "79%", size: 6, delay: 11, duration: 14 },
  { left: "91%", size: 10, delay: 5, duration: 17 },
];

export default function AquaticBackground() {
  return (
    <div className="krypton-aquatic-background" aria-hidden="true">
      <div className="krypton-water-rays" />
      <div className="krypton-water-light krypton-water-light-one" />
      <div className="krypton-water-light krypton-water-light-two" />
      <div className="krypton-water-depth" />
      <div className="krypton-water-wave krypton-water-wave-one" />
      <div className="krypton-water-wave krypton-water-wave-two" />
      <div className="krypton-water-reflection" />
      <div className="krypton-bubbles">
        {bubbles.map((bubble, index) => (
          <span
            key={index}
            className="krypton-bubble"
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
      <div className="krypton-water-vignette" />
    </div>
  );
}
