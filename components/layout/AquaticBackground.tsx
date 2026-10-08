export default function AquaticBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100lvh",
        zIndex: -1,
        pointerEvents: "none",
        background: 'url("/krypton-water.webp") center 40% / cover no-repeat',
        transform: "translateZ(0)",
      }}
    />
  );
}
