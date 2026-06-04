"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyProjectCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      className="ui-btn ui-focus flex items-center gap-2 border border-ink-200 bg-white text-sm font-semibold text-ink-700"
      onClick={copyCode}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? "Copied" : "Copy number"}
    </button>
  );
}
