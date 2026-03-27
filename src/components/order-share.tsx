"use client";

import { useState } from "react";
import { Copy, MessageCircle } from "lucide-react";

export default function OrderShare({
  supplier,
  items,
  title,
  textOverride
}: {
  supplier: string;
  items: { name: string; qty: string }[];
  title?: string;
  textOverride?: string;
}) {
  const [copied, setCopied] = useState(false);
  const text =
    textOverride ??
    `Order List — ${supplier}\n\n${items.map((item) => `- ${item.name}: ${item.qty}`).join("\n")}`;
  const shareTitle = title ?? `Order List — ${supplier}`;
  const encoded = encodeURIComponent(text);

  const copyText = async () => {
    const content = `${shareTitle}\n\n${text}`;
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      const el = document.createElement("textarea");
      el.value = content;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`https://wa.me/?text=${encoded}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/90 px-3 py-1 text-xs text-ink-600 shadow-ring"
      >
        <MessageCircle size={14} />
        WhatsApp
      </a>
      <button
        type="button"
        onClick={copyText}
        className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/90 px-3 py-1 text-xs text-ink-600 shadow-ring"
      >
        <Copy size={14} />
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
