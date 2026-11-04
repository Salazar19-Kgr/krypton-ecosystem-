const enc = new TextEncoder();

async function hmac(secret: string, msg: string): Promise<string> {
  const k = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = await crypto.subtle.sign("HMAC", k, enc.encode(msg));
  return Array.from(new Uint8Array(s))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const COOKIE = "sentinel_s";
export const TTL = 7200;

export async function makeSession(uid: string): Promise<string | null> {
  const secret = process.env.SENTINEL_SECRET ?? "";
  if (secret.length < 24) return null;
  const body = uid + "." + (Math.floor(Date.now() / 1000) + TTL);
  return body + "." + (await hmac(secret, body));
}

export async function checkSession(cookieHeader: string | null, uid: string): Promise<boolean> {
  const secret = process.env.SENTINEL_SECRET ?? "";
  if (secret.length < 24 || !cookieHeader) return false;
  const c = cookieHeader.split(/;\s*/).find((x) => x.startsWith(COOKIE + "="));
  if (!c) return false;
  const parts = decodeURIComponent(c.slice(COOKIE.length + 1)).split(".");
  if (parts.length !== 3) return false;
  const [u, exp, sig] = parts;
  if (u !== uid || Number(exp) < Date.now() / 1000) return false;
  const good = await hmac(secret, u + "." + exp);
  if (good.length !== sig.length) return false;
  let d = 0;
  for (let i = 0; i < good.length; i++) d |= good.charCodeAt(i) ^ sig.charCodeAt(i);
  return d === 0;
}
