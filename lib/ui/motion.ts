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

const BG_KEY = "krypton.bg";
const UI_KEY = "krypton.ui";

/** Brillo guardado: fondo (50 a 100) e interfaz (100 a 140). */
export function readLook() {
  try {
    const bg = Number(localStorage.getItem(BG_KEY));
    const ui = Number(localStorage.getItem(UI_KEY));
    return { bg: bg >= 50 && bg <= 100 ? bg : 100, ui: ui >= 100 && ui <= 140 ? ui : 100 };
  } catch {
    return { bg: 100, ui: 100 };
  }
}

/** Aplica el brillo a toda la app y lo guarda. */
export function applyLook(bg: number, ui: number) {
  const root = document.documentElement;
  root.style.setProperty("--k-dim", String(((100 - bg) / 100) * 1.2));
  root.style.setProperty("--k-ui", String(ui / 100));
  root.toggleAttribute("data-ui-bright", ui !== 100);
  try {
    localStorage.setItem(BG_KEY, String(bg));
    localStorage.setItem(UI_KEY, String(ui));
  } catch {
    // sin almacenamiento: se aplica solo en esta visita
  }
}
