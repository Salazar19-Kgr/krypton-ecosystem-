export type KryptonCapability = {
  id: string;
  description: string;
  enabled: boolean;
  requiresKey: boolean;
};

export const KRYPTON_CAPABILITIES: KryptonCapability[] = [
  {
    id: "vision",
    description: "Comprensión multimodal de imágenes y contenido visual.",
    enabled: true,
    requiresKey: true,
  },
  {
    id: "calculator",
    description: "Cálculo determinista y verificación matemática.",
    enabled: true,
    requiresKey: false,
  },
  {
    id: "web-search",
    description: "Búsqueda de información externa y actual.",
    enabled: true,
    requiresKey: true,
  },
  {
    id: "wikipedia",
    description: "Consulta de conocimiento enciclopédico.",
    enabled: true,
    requiresKey: false,
  },
  {
    id: "reasoning",
    description: "Razonamiento y generación mediante el cerebro principal.",
    enabled: true,
    requiresKey: true,
  },
];
