"use client";

import { useEffect, useRef, useState, type MouseEvent as RMouseEvent } from "react";
import MessageContent from "./MessageContent";

export const liveStamp = { t: 0 };

export default function TypedContent({
  content,
  bot,
}: {
  content: string;
  bot: boolean;
}) {
  const [animate] = useState(() => {
    if (!bot || !liveStamp.t) return false;
    const fresh = Date.now() - liveStamp.t < 180000;
    liveStamp.t = 0;
    return fresh;
  });
  const [shown, setShown] = useState(animate ? 0 : content.length);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate) {
      setShown(content.length);
      return;
    }
    const step = Math.max(3, Math.ceil(content.length / 150));
    const id = setInterval(() => {
      setShown((n) => {
        const next = Math.min(content.length, n + step);
        if (next >= content.length) clearInterval(id);
        return next;
      });
      const sc = box.current?.closest(".krypton-chat-scroll") as HTMLElement | null;
      if (sc && sc.scrollHeight - sc.scrollTop - sc.clientHeight < 200) {
        sc.scrollTop = sc.scrollHeight;
      }
    }, 25);
    return () => clearInterval(id);
  }, [content, animate]);

  function onCodeClick(e: RMouseEvent<HTMLDivElement>) {
    const pre = (e.target as HTMLElement).closest("pre");
    if (!pre) return;
    const r = pre.getBoundingClientRect();
    if (e.clientY - r.top > 46 || r.right - e.clientX > 130) return;
    const text = (pre.querySelector("code") ?? pre).textContent ?? "";
    const done = () => {
      pre.setAttribute("data-copied", "1");
      setTimeout(() => pre.removeAttribute("data-copied"), 1600);
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done).catch(() => {});
  }

  return (
    <div ref={box} className="k-codewrap" onClick={onCodeClick}>
      <MessageContent content={content.slice(0, shown)} markdown={bot} />
    </div>
  );
}
