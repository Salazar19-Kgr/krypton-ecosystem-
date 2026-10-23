let lastActivity = 0;
let lastTyping = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let installed = false;

function mark(event: Event) {
  const now = performance.now();
  lastActivity = now;
  if (event.type === "keydown" || event.type === "input") lastTyping = now;
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

/** Verdadero mientras haces scroll o escribes: las animaciones bajan de cuadros para que todo siga fluido. */
export function isBusy() {
  install();
  return performance.now() - lastActivity < 600;
}

/** Verdadero mientras escribes: el cielo se queda quieto un instante para que las letras salgan al momento. */
export function isTyping() {
  install();
  return performance.now() - lastTyping < 700;
}
