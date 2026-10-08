import type { TriageLevel, TriageResult } from "./types";

// Reglas iniciales. DEBEN ser revisadas por un profesional sanitario antes de uso real.
type Rule = { level: TriageLevel; reason: string; re: RegExp; crisis?: boolean };

const RULES: Rule[] = [
  { level: 4, reason: "Dolor u opresión en el pecho", re: /(dolor|opresion|presion).{0,25}pecho|pecho.{0,25}(dolor|opresion|presion)/ },
  { level: 4, reason: "Dificultad para respirar", re: /no puedo respirar|me ahogo|dificultad (para|al) respirar|me falta (el )?aire/ },
  { level: 4, reason: "Posibles signos de ictus", re: /cara caida|boca torcida|no puedo hablar|habla (arrastrada|confusa)|debilidad (en|de) (un|el) (lado|brazo|pierna)/ },
  { level: 4, reason: "Pérdida de conocimiento o convulsiones", re: /desmay|perdi el conocimiento|inconsciente|convulsion|no responde/ },
  { level: 4, reason: "Sangrado intenso", re: /(sangrado|hemorragia).{0,20}(abundante|fuerte|no para|no se detiene)|vomit.{0,15}sangre/ },
  { level: 4, reason: "Posible reacción alérgica grave", re: /(garganta|lengua).{0,20}(hinchad|cerr)|hinchazon.{0,20}(garganta|lengua)/ },
  { level: 4, reason: "Posible intoxicación o sobredosis", re: /sobredosis|envenen|ingeri.{0,20}(veneno|quimico|lejia)/ },
  { level: 4, crisis: true, reason: "Riesgo para la vida o seguridad emocional", re: /quiero morir|quitarme la vida|suicid|hacerme dano|no quiero vivir|acabar con mi vida/ },

  { level: 3, reason: "Fiebre alta o prolongada", re: /fiebre.{0,25}(39|40|41)|(39|40|41).{0,10}fiebre|fiebre.{0,30}(mas de|desde hace) (3|tres|4|cuatro|5|cinco) dias/ },
  { level: 3, reason: "Vómitos o diarrea persistentes", re: /(vomit|diarrea).{0,30}(dias|no para|sin parar|no puedo (tomar|retener))/ },
  { level: 3, reason: "Posible deshidratación", re: /no orino|orina muy oscura|boca muy seca/ },
  { level: 3, reason: "Dolor muy intenso", re: /dolor.{0,15}(muy fuerte|insoportable|intenso|severo)/ },
  { level: 3, reason: "Sangre en heces u orina", re: /sangre.{0,15}(heces|orina|excremento)|heces negras/ },
  { level: 3, reason: "Embarazo con síntomas de alarma", re: /embarazad.{0,40}(sangrado|dolor fuerte|no siento (al )?bebe)/ },
  { level: 3, reason: "Fiebre en bebé", re: /(bebe|recien nacido).{0,30}fiebre|fiebre.{0,30}(bebe|recien nacido)/ },

  { level: 2, reason: "Síntomas que se prolongan", re: /desde hace (semanas|meses)|hace (mas de )?(\d+|dos|tres) semanas/ },
  { level: 2, reason: "Cambios en bultos o lunares, o pérdida de peso sin causa", re: /(bulto|masa|lunar).{0,20}(crece|cambio|cambia)|bajado de peso sin|perdida de peso (sin|inexplicable)/ },
];

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function triage(text: string): TriageResult {
  const t = norm(text);
  let level: TriageLevel = 1;
  let crisis = false;
  const reasons: string[] = [];
  for (const r of RULES) {
    if (r.re.test(t)) {
      reasons.push(r.reason);
      if (r.level > level) level = r.level;
      if (r.crisis) crisis = true;
    }
  }
  return { level, crisis, reasons };
}

export function emergencyMessage(result: TriageResult): string {
  if (result.crisis) {
    return "Lo que cuentas es importante y no quiero que lo pases solo/a. Si estás en peligro ahora mismo, llama a los servicios de emergencia de tu zona o acude a la urgencia más cercana. Si puedes, avisa ya a una persona de confianza para que esté contigo. Estoy aquí para seguir hablando, pero ahora lo prioritario es tu seguridad.";
  }
  return "Lo que describes podría ser una emergencia médica. Busca atención de urgencia ahora: llama a los servicios de emergencia de tu zona o acude a la urgencia más cercana, o pide a alguien que te lleve. No esperes a ver si mejora. Krypton Health no sustituye a un profesional sanitario.";
}
