let lastActivity = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let installed = false;

function mark() {
  lastActivity = performance.now();
  const root = document.documentElement;
  if (!root.classList.contains("k-busy")) root.classList.add("k-busy");
  clearTimeout(timer);
  timer = setTimeout(() => root.classList.remove("k-busy"), 600);
}

function install() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  for (const type of ["keydown", "input", "scroll", "touchmove"]) {
    document.addEventListener(type, mark, { capture: true, passive: true });
  }
}

/** Verdadero mientras escribes o haces scroll: las animaciones bajan de cuadros para que todo siga fluido. */
export function isBusy() {
  install();
  return performance.now() - lastActivity < 600;
}
