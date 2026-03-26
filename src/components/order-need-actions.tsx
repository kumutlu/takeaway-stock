"use client";

import { useEffect, useState, useTransition } from "react";
import {
  incrementOrderNeed,
  setOrderNeedQty,
  removeOrderNeed
} from "@/app/actions/order-needs";

function buildFormData(productId: string, neededQty?: number) {
  const formData = new FormData();
  formData.set("productId", productId);
  if (typeof neededQty === "number") {
    formData.set("neededQty", String(neededQty));
  }
  return formData;
}

export default function OrderNeedActions({
  productId,
  qty,
  size = "sm"
}: {
  productId: string;
  qty: number;
  size?: "sm" | "md";
}) {
  const [isPending, startTransition] = useTransition();
  const [localQty, setLocalQty] = useState(qty);

  useEffect(() => {
    setLocalQty(qty);
  }, [qty]);
  const playBeep = () => {
    if (typeof window === "undefined") return;
    const AudioContextClass =
      window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 660;
    gainNode.gain.value = 0.04;
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.08);
    oscillator.onended = () => {
      context.close();
    };
  };
  const buttonClass =
    size === "md"
      ? "rounded-full border border-ink-200 px-3 py-1 text-xs"
      : "rounded-full border border-ink-200 px-2 py-1 text-xs";
  const selectClass =
    size === "md"
      ? "rounded-lg border border-ink-200 bg-white/80 px-2 py-1 text-xs"
      : "rounded-lg border border-ink-200 bg-white/80 px-2 py-1 text-xs";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className={buttonClass}
        onClick={() =>
          startTransition(() => {
            playBeep();
            setLocalQty((prev) => prev + 1);
            return incrementOrderNeed(buildFormData(productId));
          })
        }
      >
        Add
      </button>
      <select
        name="neededQty"
        aria-label="Needed quantity"
        value={localQty}
        className={selectClass}
        disabled={isPending}
        onChange={(event) => {
          const value = Number(event.target.value);
          setLocalQty(value);
          startTransition(() => setOrderNeedQty(buildFormData(productId, value)));
        }}
      >
        {Array.from({ length: 21 }, (_, i) => i).map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <button
        type="button"
        className={buttonClass}
        disabled={isPending}
        onClick={() =>
          startTransition(() => {
            setLocalQty(0);
            return removeOrderNeed(buildFormData(productId));
          })
        }
      >
        Remove
      </button>
    </div>
  );
}
