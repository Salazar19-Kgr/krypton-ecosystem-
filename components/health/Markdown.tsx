import React from "react";

function inline(text: string, base: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g);
  return parts.map((p, i) => {
    if (p.length > 4 && p.startsWith("**") && p.endsWith("**")) {
      return <strong key={base + i} className="font-semibold">{p.slice(2, -2)}</strong>;
    }
    if (p.length > 2 && p.startsWith("*") && p.endsWith("*")) {
      return <em key={base + i}>{p.slice(1, -1)}</em>;
    }
    return p;
  });
}

type ListState = { ordered: boolean; items: string[] };

export default function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r/g, "").split("\n");
  const out: React.ReactNode[] = [];
  const st: { list: ListState | null; para: string[]; k: number } = { list: null, para: [], k: 0 };

  const flushPara = () => {
    if (st.para.length) {
      const k = st.k++;
      out.push(
        <p key={"p" + k} className="leading-7">
          {inline(st.para.join(" "), "p" + k + "-")}
        </p>
      );
      st.para = [];
    }
  };
  const flushList = () => {
    if (st.list) {
      const k = st.k++;
      const items = st.list.items.map((it, i) => (
        <li key={i} className="leading-7">{inline(it, "l" + k + "-" + i + "-")}</li>
      ));
      out.push(
        st.list.ordered ? (
          <ol key={"o" + k} className="list-decimal space-y-1 pl-6">{items}</ol>
        ) : (
          <ul key={"u" + k} className="list-disc space-y-1 pl-6">{items}</ul>
        )
      );
      st.list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    const h = line.match(/^#{1,4}\s+(.*)$/);
    if (h) {
      flushPara();
      flushList();
      const k = st.k++;
      out.push(
        <h3 key={"h" + k} className="mt-3 text-base font-semibold text-white">
          {inline(h[1], "h" + k + "-")}
        </h3>
      );
      continue;
    }
    const b = line.match(/^[-*•]\s+(.*)$/);
    if (b) {
      flushPara();
      if (st.list && st.list.ordered) flushList();
      if (!st.list) st.list = { ordered: false, items: [] };
      st.list.items.push(b[1]);
      continue;
    }
    const n = line.match(/^\d+[.)]\s+(.*)$/);
    if (n) {
      flushPara();
      if (st.list && !st.list.ordered) flushList();
      if (!st.list) st.list = { ordered: true, items: [] };
      st.list.items.push(n[1]);
      continue;
    }
    flushList();
    st.para.push(line);
  }
  flushPara();
  flushList();

  return <div className="space-y-2">{out}</div>;
}
