"use client";

import { useEffect, useState } from "react";
import { Share2, Send, Mail, MessageCircle } from "lucide-react";

function buildText(supplier: string, items: { name: string; qty: string }[]) {
  const lines = items.map((item) => `- ${item.name}: ${item.qty}`).join("\n");
  return `Order List — ${supplier}\n\n${lines}`;
}

export default function OrderShare({
  supplier,
  items
}: {
  supplier: string;
  items: { name: string; qty: string }[];
}) {
  const [canShare, setCanShare] = useState(false);
  const text = buildText(supplier, items);
  const encoded = encodeURIComponent(text);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const shareNative = async () => {
    if (!navigator.share) return;
    await navigator.share({ title: `Order List — ${supplier}`, text });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canShare && (
        <button
          type="button"
          onClick={shareNative}
          className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/90 px-3 py-1 text-xs text-ink-600 shadow-ring"
        >
          <Share2 size={14} />
          Share
        </button>
      )}
      <a
        href={`https://wa.me/?text=${encoded}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/90 px-3 py-1 text-xs text-ink-600 shadow-ring"
      >
        <MessageCircle size={14} />
        WhatsApp
      </a>
      <a
        href={`https://t.me/share/url?url=&text=${encoded}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/90 px-3 py-1 text-xs text-ink-600 shadow-ring"
      >
        <Send size={14} />
        Telegram
      </a>
      <a
        href={`mailto:?subject=${encodeURIComponent(`Order List — ${supplier}`)}&body=${encoded}`}
        className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/90 px-3 py-1 text-xs text-ink-600 shadow-ring"
      >
        <Mail size={14} />
        Email
      </a>
    </div>
  );
}
