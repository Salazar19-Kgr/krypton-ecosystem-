export type KryptonCapability = {
  id: string;
  description: string;
  enabled: boolean;
};

export const KRYPTON_CAPABILITIES: KryptonCapability[] = [
  {
    id: "multimodal-understanding",
    description: "Comprensión de texto e imágenes.",
    enabled: true,
  },
  {
    id: "reasoning",
    description: "Razonamiento y generación de respuestas.",
    enabled: true,
  },
  {
    id: "calculation",
    description: "Cálculo determinista y verificación.",
    enabled: true,
  },
  {
    id: "web-information",
    description: "Obtención de información externa.",
    enabled: true,
  },
  {
    id: "technical-analysis",
    description: "Análisis de equipos y situaciones técnicas.",
    enabled: true,
  },
];
