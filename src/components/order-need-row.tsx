"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
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

function useBeep() {
  const contextRef = useRef<AudioContext | null>(null);
  return () => {
    if (typeof window === "undefined") return;
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!contextRef.current) {
      contextRef.current = new AudioContextClass();
    }
    const context = contextRef.current;
    if (context.state === "suspended") {
      void context.resume();
    }
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 660;
    gainNode.gain.value = 0.04;
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.08);
  };
}

export default function OrderNeedRow({
  product,
  initialQty
}: {
  product: {
    id: string;
    itemName: string;
    supplierName: string | null;
    orderDay: string | null;
  };
  initialQty: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [localQty, setLocalQty] = useState(initialQty);
  const flushTimer = useRef<NodeJS.Timeout | null>(null);
  const latestQty = useRef(initialQty);
  const playBeep = useBeep();

  useEffect(() => {
    setLocalQty(initialQty);
    latestQty.current = initialQty;
  }, [initialQty]);

  const scheduleFlush = (nextQty: number) => {
    latestQty.current = nextQty;
    if (flushTimer.current) {
      clearTimeout(flushTimer.current);
    }
    flushTimer.current = setTimeout(() => {
      startTransition(() => setOrderNeedQty(buildFormData(product.id, latestQty.current)));
    }, 350);
  };

  return (
    <div className="grid grid-cols-6 gap-2 px-6 py-4 text-sm text-ink-700">
      <span className="col-span-2 font-semibold text-ink-900">{product.itemName}</span>
      <span className="text-ink-600">{product.supplierName}</span>
      <span className="text-ink-600">{product.orderDay ?? "-"}</span>
      <span className="font-semibold text-ink-900">{localQty}</span>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-full border border-ink-900 bg-ink-900 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-[1px]"
          onClick={() =>
            (() => {
            playBeep();
            setLocalQty((prev) => {
              const next = prev + 1;
              scheduleFlush(next);
              return next;
            });
          })()
          }
        >
          Add
        </button>
        <select
          name="neededQty"
          aria-label="Needed quantity"
          value={localQty}
          className="rounded-full border border-ink-200 bg-white/90 px-3 py-1 text-xs text-ink-700 shadow-sm"
          disabled={isPending}
          onChange={(event) => {
            const value = Number(event.target.value);
            setLocalQty(value);
            scheduleFlush(value);
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
          aria-label="Reset quantity"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-200 bg-white/80 text-ink-500 transition hover:border-ink-300 hover:text-ink-700"
          disabled={isPending}
          onClick={() =>
            startTransition(() => {
              setLocalQty(0);
              latestQty.current = 0;
              return removeOrderNeed(buildFormData(product.id));
            })
          }
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
