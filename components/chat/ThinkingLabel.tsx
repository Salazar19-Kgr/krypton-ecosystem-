"use client";

import { useEffect, useState } from "react";

const WORDS = ["Pensando", "Procesando", "Analizando", "Preparando la respuesta"];

export default function ThinkingLabel() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((n) => n + 1), 450);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="px-1 text-sm text-white/70">
      {WORDS[Math.floor(t / 6) % WORDS.length]}
      {".".repeat(t % 4)}
    </p>
  );
}
