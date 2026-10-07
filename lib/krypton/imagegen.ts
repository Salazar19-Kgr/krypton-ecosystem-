import { generate, UA } from "./llm";

const NOT_REQUEST = /^\s*¿?\s*(c[oó]mo|qu[eé]|por qu[eé]|cu[aá]l(es)?|d[oó]nde|expl[ií]ca\w*|ens[eé]ñ\w*|dime|ay[uú]da\w*|pasos|tutorial|recomi[eé]nda\w*)\b/i;
const NOUN =
  "(?:im[aá]genes|imagen|fotograf[ií]as?|fotos?|ilustraci[oó]n(?:es)?|dibujos?|logotipos?|logos?|p[oó]ster|poster|wallpaper|fondo de pantalla|retratos?|arte|render|banner|miniatura|avatar|[ií]cono|icono)";
const MAKE = new RegExp(
  `\\b(?:gener\\w*|cre[aeo]\\w*|dibuj\\w*|dise[ñn]\\w*|pint\\w*|ilustr\\w*|haz|hazme|hac(?:er|erme)|produc\\w*|render\\w*|elabor\\w*)\\b[^.?!\\n]{0,40}\\b${NOUN}\\b`,
  "i"
);
const WANT = new RegExp(
  `\\b(?:quiero|necesito|dame|mu[eé]strame)\\s+(?:una?|unas?)\\s+(?:\\w+\\s+){0,2}${NOUN}\\b`,
  "i"
);
const DRAW = /\b(?:dibuj|ilustr|pint)\w*\s+(?:me\s+)?(?:un|una|el|la|unos|unas)\b/i;
const ENGLISH =
  /\b(?:generate|create|draw|make|design)\b[^.?!\n]{0,30}\b(?:image|picture|photo|illustration|logo|poster|wallpaper)\b/i;

export const wantsImage = (message: string) =>
  !NOT_REQUEST.test(message) &&
  (MAKE.test(message) || WANT.test(message) || DRAW.test(message) || ENGLISH.test(message));

const PROMPT_SYSTEM = `Eres un director de arte experto en prompts para generadores de imágenes. Convierte la petición del usuario en UN solo prompt en inglés, detallado y visual: sujeto, entorno, composición y encuadre (y formato o proporción si los piden), iluminación, paleta de color, lente o técnica artística, atmósfera y nivel de detalle. Si pide fotorrealismo, usa lenguaje fotográfico; si pide ilustración, logo u otro estilo, respétalo. No añadas texto dentro de la imagen salvo que lo pida (en ese caso escribe el texto exacto entre comillas). Responde SOLO con el prompt, sin explicaciones ni comillas.`;

type Img = { mime: string; data: string };

const split = (value: string | undefined, fallback: string[]) => {
  const items = (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length ? items : fallback;
};

async function geminiImage(prompt: string): Promise<Img> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("sin clave de Gemini");
  const models = split(process.env.GEMINI_IMAGE_MODELS, [
    "gemini-3.1-flash-lite-image",
    "gemini-3.1-flash-image",
    "gemini-2.5-flash-image",
  ]);
  const errors: string[] = [];
  const started = Date.now();

  for (const model of models) {
    if (errors.length && Date.now() - started > 70000) break;
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": key, ...UA },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
          }),
          signal: AbortSignal.timeout(45000),
        }
      );
      if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 120)}`);
      const data = await res.json();
      const parts: { inlineData?: { mimeType?: string; data?: string } }[] =
        data?.candidates?.[0]?.content?.parts ?? [];
      const found = parts.find((p) => p.inlineData?.data);
      if (!found?.inlineData?.data) throw new Error("sin imagen en la respuesta");
      return { mime: found.inlineData.mimeType ?? "image/png", data: found.inlineData.data };
    } catch (e) {
      errors.push(`${model}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  throw new Error(errors.join(" | "));
}

async function openrouterImage(prompt: string): Promise<Img> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("sin clave de OpenRouter");
  const models = split(process.env.OPENROUTER_IMAGE_MODELS, [
    "google/gemini-3.1-flash-image-preview",
    "google/gemini-2.5-flash-image",
  ]);
  const errors: string[] = [];

  for (const model of models) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          "X-OpenRouter-Title": "Krypton Ecosystem",
          ...UA,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        }),
        signal: AbortSignal.timeout(60000),
      });
      if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 120)}`);
      const data = await res.json();
      const url: string =
        data?.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? "";
      const match = /^data:([^;]+);base64,(.+)$/.exec(url);
      if (!match) throw new Error("sin imagen en la respuesta");
      return { mime: match[1], data: match[2] };
    } catch (e) {
      errors.push(`${model}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  throw new Error(errors.join(" | "));
}

function cloudinaryConfig() {
  const url = (process.env.CLOUDINARY_URL ?? "").trim();
  const fromUrl = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec(url);
  if (fromUrl) return { key: fromUrl[1], secret: fromUrl[2], cloud: fromUrl[3] };

  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  return cloud && key && secret ? { cloud, key, secret } : null;
}

async function sha1(text: string) {
  const buffer = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Guarda la imagen en Cloudinary y devuelve su dirección optimizada. */
async function uploadToCloudinary(image: Img): Promise<string> {
  const config = cloudinaryConfig();
  if (!config) throw new Error("Cloudinary no está configurado");

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `img_${timestamp}_${Math.random().toString(36).slice(2, 8)}`;
  const params: Record<string, string | number> = {
    folder: "krypton",
    public_id: publicId,
    timestamp,
  };
  const toSign =
    Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("&") + config.secret;

  const form = new FormData();
  form.append("file", `data:${image.mime};base64,${image.data}`);
  form.append("api_key", config.key);
  form.append("timestamp", String(timestamp));
  form.append("folder", "krypton");
  form.append("public_id", publicId);
  form.append("signature", await sha1(toSign));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloud}/image/upload`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Cloudinary ${res.status} ${(await res.text()).slice(0, 120)}`);

  const data = await res.json();
  const url = String(data?.secure_url ?? "");
  if (!url) throw new Error("Cloudinary no devolvió la dirección");
  // Entrega en el mejor formato y calidad automáticos
  return url.replace("/upload/", "/upload/f_auto,q_auto:best/");
}

export async function createImage(
  message: string
): Promise<{ text: string; provider: string }> {
  let prompt = message;
  try {
    const crafted = await generate({
      system: PROMPT_SYSTEM,
      messages: [{ role: "user", content: message }],
    });
    prompt = crafted.text.trim().replace(/^["']+|["']+$/g, "").slice(0, 1500) || message;
  } catch {
    prompt = message;
  }

  let image: Img | null = null;
  let provider = "";

  try {
    image = await geminiImage(prompt);
    provider = "gemini";
  } catch {
    try {
      image = await openrouterImage(prompt);
      provider = "openrouter";
    } catch {
      try {
        image = await cloudflareImage(prompt);
        provider = "cloudflare";
      } catch {
        image = null;
      }
    }
  }

  if (!image) {
    return {
      text: `En este momento no pude generar la imagen: los generadores de imagen no están disponibles ahora (límite diario del plan gratuito o créditos agotados). Mientras tanto, este es el prompt optimizado para tu idea, listo para usarlo en cualquier generador:\n\n> ${prompt}`,
      provider: "sin-imagen",
    };
  }

  let url: string;
  try {
    url = await uploadToCloudinary(image);
    provider += "+cloudinary";
  } catch {
    url = `data:${image.mime};base64,${image.data}`;
  }

  return {
    text: `Aquí tienes tu imagen.\n\n

![Imagen generada](${url})

\n\n**Prompt usado:** ${prompt}`,
    provider,
  };
}

/** Generador gratuito de Cloudflare Workers AI (FLUX.1 schnell). */
async function cloudflareImage(prompt: string): Promise<Img> {
  const account = process.env.WORKERS_AI_ACCOUNT_ID;
  const token = process.env.WORKERS_AI_TOKEN;
  if (!account || !token) throw new Error("sin credenciales de Workers AI");
  const model = process.env.WORKERS_AI_IMAGE_MODEL || "@cf/black-forest-labs/flux-1-schnell";

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...UA },
      body: JSON.stringify({ prompt: prompt.slice(0, 2000) }),
      signal: AbortSignal.timeout(60000),
    }
  );
  if (!res.ok) throw new Error(`Workers AI ${res.status} ${(await res.text()).slice(0, 120)}`);

  const data = await res.json();
  const image = data?.result?.image;
  if (typeof image !== "string" || !image) throw new Error("sin imagen en la respuesta");
  return { mime: "image/jpeg", data: image };
}

/** Límite diario de imágenes por persona (por defecto 5; se cambia con IMAGE_DAILY_LIMIT). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createImageLimited(supabase: any, userId: string, message: string) {
  const limit = Number(process.env.IMAGE_DAILY_LIMIT ?? 5);
  try {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("role", "model")
      .ilike("content", "%Imagen generada%")
      .gte("created_at", start.toISOString());
    if ((count ?? 0) >= limit) {
      return {
        text: `Llegaste al límite de ${limit} imágenes por día. El contador se reinicia a medianoche (hora UTC). Mientras tanto puedo seguir ayudándote con todo lo demás.`,
        provider: "limite",
      };
    }
  } catch {
    // si no se puede contar, se permite generar
  }
  return createImage(message);
}
