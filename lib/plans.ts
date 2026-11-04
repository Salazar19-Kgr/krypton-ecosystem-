// [mensajes por minuto, mensajes por día] de cada plan
export const PLAN_LIMITS: Record<string, number[]> = {
  free: [10, 40],
  basic: [15, 300],
  pro: [20, 1000],
  max: [30, 3000],
};
export const PLAN_NAMES: Record<string, string> = { free: "Free", basic: "Básico", pro: "Pro", max: "Max" };

// imágenes por día
export const IMAGE_DAILY: Record<string, number> = { free: 2, basic: 5, pro: 12, max: 25 };
// consultas de Krypton Health por día
export const HEALTH_DAILY: Record<string, number> = { free: 10, basic: 60, pro: 150, max: 400 };
