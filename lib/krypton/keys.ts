/**
 * Lee las claves de uno o varios nombres de variable (cada valor puede traer varias separadas por coma).
 * Devuelve la lista empezando por una al azar para repartir las peticiones entre todas.
 */
export function keyPool(...names: string[]): string[] {
  const env = process.env as Record<string, string | undefined>;
  const keys: string[] = [];
  for (const name of names) {
    for (const part of (env[name] ?? "").split(",")) {
      const key = part.trim();
      if (key && !keys.includes(key)) keys.push(key);
    }
  }
  const start = keys.length > 1 ? Math.floor(Math.random() * keys.length) : 0;
  return [...keys.slice(start), ...keys.slice(0, start)];
}

// Acepta los nombres tal como se guardaron en Cloudflare (incluidas las variantes con errores de escritura)
export const geminiKeys = () => keyPool("GEMINI_API_KEY", "gemini_api", "GEMINI_API_KEY_2");
export const geminiKey = () => geminiKeys()[0] ?? "";
export const deepseekKeys = () =>
  keyPool("DEEPSEEK_API_KEY", "DEESEEK_API_KEY", "DEESEEK_IMAGENES_API_KEY", "DEEPSEEK_IMAGENES_API_KEY");
export const perplexityKeys = () => keyPool("PERPLEXITY_API_KEY", "PERPLEXITY_API_KEY_2");
