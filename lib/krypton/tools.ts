export type Source = { title: string; url: string; snippet: string };

export async function tavilySearch(query: string): Promise<Source[]> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return [];

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ query, max_results: 5, search_depth: "basic" }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`Tavily ${res.status} ${(await res.text()).slice(0, 120)}`);
  }

  const data = await res.json();
  const results: { title?: string; url?: string; content?: string }[] =
    data?.results ?? [];

  return results.map((r) => ({
    title: String(r.title ?? "Sin título"),
    url: String(r.url ?? ""),
    snippet: String(r.content ?? "").slice(0, 500),
  }));
}

export async function wikipediaSearch(query: string): Promise<Source[]> {
  const headers = { "User-Agent": "KryptonEcosystem/1.0" };

  const search = await fetch(
    `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=2&format=json&origin=*`,
    { headers, signal: AbortSignal.timeout(10000) }
  );
  if (!search.ok) throw new Error(`Wikipedia ${search.status}`);

  const found = await search.json();
  const hits: { title: string }[] = found?.query?.search ?? [];
  const out: Source[] = [];

  for (const hit of hits) {
    const page = await fetch(
      `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`,
      { headers, signal: AbortSignal.timeout(10000) }
    );
    if (!page.ok) continue;
    const d = await page.json();
    out.push({
      title: String(d.title ?? hit.title),
      url: String(d?.content_urls?.desktop?.page ?? ""),
      snippet: String(d.extract ?? "").slice(0, 700),
    });
  }

  return out;
}

const FUNCS: Record<string, (x: number) => number> = {
  sqrt: Math.sqrt,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  log: Math.log10,
  ln: Math.log,
  abs: Math.abs,
  exp: Math.exp,
};

/** Calculadora segura (sin eval). Los ángulos van en radianes. */
export function calculate(input: string): number | null {
  const src = input
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/,/g, ".");
  let i = 0;

  function expression(): number {
    let v = term();
    while (src[i] === "+" || src[i] === "-") {
      const op = src[i++];
      const r = term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }

  function term(): number {
    let v = unary();
    while (src[i] === "*" || src[i] === "/") {
      const op = src[i++];
      const r = unary();
      v = op === "*" ? v * r : v / r;
    }
    return v;
  }

  function unary(): number {
    if (src[i] === "-") {
      i++;
      return -unary();
    }
    if (src[i] === "+") {
      i++;
      return unary();
    }
    return power();
  }

  function power(): number {
    const base = primary();
    if (src[i] === "^") {
      i++;
      return Math.pow(base, unary());
    }
    return base;
  }

  function primary(): number {
    if (src[i] === "(") {
      i++;
      const v = expression();
      if (src[i++] !== ")") throw new Error("paréntesis");
      return v;
    }

    const num = /^\d+(\.\d+)?/.exec(src.slice(i));
    if (num) {
      i += num[0].length;
      return parseFloat(num[0]);
    }

    const id = /^[a-z]+/.exec(src.slice(i));
    if (id) {
      i += id[0].length;
      if (id[0] === "pi") return Math.PI;
      if (id[0] === "e") return Math.E;
      const fn = FUNCS[id[0]];
      if (!fn || src[i++] !== "(") throw new Error("función");
      const arg = expression();
      if (src[i++] !== ")") throw new Error("paréntesis");
      return fn(arg);
    }

    throw new Error("símbolo");
  }

  try {
    const v = expression();
    if (i !== src.length || !Number.isFinite(v)) return null;
    return Number(v.toPrecision(12));
  } catch {
    return null;
  }
}
