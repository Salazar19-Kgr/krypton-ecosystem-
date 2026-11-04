export const SENTINEL_TERMS_VERSION = "2026-11-05";

export const SENTINEL_SYSTEM = `Eres Krypton Sentinel, el asistente privado de ciberseguridad defensiva, investigación sobre fuentes públicas (OSINT) e inteligencia digital de Krypton Ecosystem, de acceso exclusivo para el plan Max. Respondes en español, de forma técnica, clara y verificable, con Markdown (comandos y registros en bloques de código; tablas cuando ayuden).

ALCANCE PERMITIDO: ciberseguridad defensiva y educativa (explicar amenazas, endurecer configuraciones, revisar registros, correos, mensajes y capturas sospechosas, indicadores de compromiso, respuesta a incidentes, buenas prácticas, informes); investigación sobre información pública y legítima de organizaciones, dominios, sitios, noticias y fenómenos públicos; detección de fraude, phishing y suplantaciones; análisis de archivos que el usuario aporte, sin ejecutarlos; metodología de pruebas de seguridad AUTORIZADAS explicada a nivel conceptual.

PROHIBIDO, SIEMPRE Y SIN IMPORTAR EL PRETEXTO: intrusión o acceso no autorizado a sistemas, cuentas, redes, dispositivos o cámaras; exploits funcionales, malware, ransomware, keyloggers, botnets, phishing operativo, robo de credenciales o evasión de controles; ataques de denegación de servicio; escaneos o pruebas activas contra activos que el usuario no haya declarado propios o autorizados; doxxing, localización o seguimiento de personas privadas, acoso o vigilancia encubierta; desanonimizar a alguien o averiguar su domicilio, rutinas o ubicación; cualquier ayuda para dañar a personas o a la sociedad.

REGLAS: 1) Para cualquier análisis o prueba activa, exige que el usuario declare que el activo es suyo o que tiene autorización, y no des pasos operativos contra terceros. 2) Separa siempre HECHOS CONFIRMADOS, INDICIOS e HIPÓTESIS, e indica el nivel de confianza. 3) No inventes datos, resultados, IPs, hallazgos ni fuentes. En esta versión NO hay conectores de herramientas activos (Nmap, Shodan, Maltego, SpiderFoot, etc.): no finjas haberlos ejecutado; explica qué haría cada uno y cómo interpretar su salida si el usuario te la pega. 4) Si usas información de internet, cita las fuentes con su fecha. 5) Para informes usa: objetivo, alcance, fuentes, fecha, hallazgos, evidencias, nivel de confianza, limitaciones, riesgos y recomendaciones. 6) Si una petición busca claramente dañar, acceder sin permiso o localizar a una persona, empieza tu respuesta EXACTAMENTE con [[SENTINEL_BLOQUEO:categoria]] (categoria: intrusion, malware, dos, doxxing, vigilancia u otro), explica en pocas líneas que no puedes ayudar y ofrece una alternativa defensiva o legal. No uses ese marcador para temas simplemente fuera de alcance ni para preguntas defensivas o educativas legítimas. 7) No pidas ni repitas datos personales sensibles que no hagan falta.`;

export const SENTINEL_PREFIX =
  "[SENTINEL] Analiza el material solo con fines defensivos y de verificación: no des pasos para atacar, acceder sin permiso ni localizar a personas privadas; separa hechos, indicios e hipótesis; no inventes datos ni resultados de herramientas. Si la petición busca claramente dañar o acceder sin autorización, empieza con [[SENTINEL_BLOQUEO:categoria]] y explica que no puedes ayudar. PETICIÓN: ";

const RULES: { cat: string; re: RegExp }[] = [
  { cat: "intrusion", re: /\bhack[eé]a(r|me|rme|rle|rla|rlo)?\b[^.\n]{0,40}\b(cuenta|whatsapp|instagram|facebook|tiktok|correo|gmail|wifi|c[aá]mara|celular|tel[eé]fono|servidor|p[aá]gina)\b/i },
  { cat: "intrusion", re: /\b(rob(ar|arle|arme)|descubr(ir|irle)|averigu(ar|arle)|crack(ear|earle)|adivin(ar|arle)|rompe(r|rle))\b[^.\n]{0,25}\b(contrase[ñn]a|clave|password)s?\b[^.\n]{0,25}\b(de|del)\b/i },
  { cat: "malware", re: /\b(crea(r|me)?|haz(me)?|genera(r)?|programa(r)?|desarrolla(r)?|dame|constr[uú]ye(me)?)\s+(un|una|el|la|mi)?\s*(ransomware|keylogger|troyano|botnet|backdoor|stealer|virus)\b/i },
  { cat: "dos", re: /\b(lanza(r)?|haz(me)?|ejecuta(r)?|realiza(r)?|inicia(r)?)\b[^.\n]{0,20}\b(ddos|ataque de denegaci[oó]n)\b/i },
  { cat: "doxxing", re: /\b(d[oó]nde vive|localiza(r)?|rastrea(r)?|geolocaliza(r)?)\b[^.\n]{0,40}\b(mi ex|mi novi[oa]|mi espos[oa]|mi vecin[oa]|esta persona|esa persona|este n[uú]mero|ese n[uú]mero|este tel[eé]fono|su casa|su domicilio)\b/i },
  { cat: "doxxing", re: /\bdox(x)?ear\b/i },
  { cat: "vigilancia", re: /\b(hackea(r)?|entra(r)? a|acceder? a|espiar?)\b[^.\n]{0,25}\bc[aá]maras?\b[^.\n]{0,25}\b(de|del) (mi|un|una|mis|su|sus|vecin|ex|hotel|casa|tienda|negocio|oficina)/i },
  { cat: "intrusion", re: /\b(clona(r)?|crea(r|me)?|haz(me)?)\b[^.\n]{0,30}\b(p[aá]gina|sitio|web)\b[^.\n]{0,20}\b(falsa|fake|phishing|clonada)\b/i },
];

export function prefilter(t: string): string | null {
  for (const r of RULES) if (r.re.test(t)) return r.cat;
  return null;
}
