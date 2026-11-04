// [mensajes por minuto, mensajes por día] de cada plan
export const PLAN_LIMITS: Record<string, number[]> = {
  free: [10, 40],
  basic: [15, 300],
  pro: [20, 1000],
  max: [30, 3000],
};
export const PLAN_NAMES: Record<string, string> = { free: "Free", basic: "Básico", pro: "Pro", max: "Max" };
