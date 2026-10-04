"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MessageContent({
  content,
  markdown,
}: {
  content: string;
  markdown: boolean;
}) {
  if (!markdown) return <>{content}</>;

  return (
    <div className="krypton-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
