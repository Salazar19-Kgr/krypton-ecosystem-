export type MotionMode = "on" | "off" | "auto";

const KEY = "krypton.motion";

/** Lee la preferencia de animaciones (por defecto: activadas). */
export function readMotion(): MotionMode {
  try {
    const value = localStorage.getItem(KEY);
    return value === "off" || value === "auto" ? value : "on";
  } catch {
    return "on";
  }
}

/** Aplica la preferencia a toda la app y la guarda. */
export function applyMotion(mode: MotionMode) {
  const root = document.documentElement;
  root.classList.toggle("k-motion", mode === "on");
  root.classList.toggle("k-lite", mode === "off");
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    // sin almacenamiento: se aplica solo en esta visita
  }
}
