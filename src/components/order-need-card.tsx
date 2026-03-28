"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Star, Trash2 } from "lucide-react";
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

export default function OrderNeedCard({
  product,
  initialQty,
  isFavorite = false,
  onToggleFavorite
}: {
  product: {
    id: string;
    itemName: string;
    supplierName: string | null;
    orderDay: string | null;
  };
  initialQty: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
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
    <div className="rounded-2xl border border-ink-100 bg-white/85 p-4 shadow-soft sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              onClick={onToggleFavorite}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink-200 bg-white/90 text-ink-500 transition hover:text-amber-500"
            >
              <Star size={14} className={isFavorite ? "fill-amber-400 text-amber-500" : ""} />
            </button>
            <p className="text-base font-semibold text-ink-900">{product.itemName}</p>
          </div>
          <p className="text-sm text-ink-500">{product.supplierName}</p>
        </div>
        <span className="rounded-full border border-ink-200 bg-white/90 px-3 py-1 text-sm font-semibold text-ink-900">
          Qty {localQty}
        </span>
      </div>
      <div className="mt-3 text-sm text-ink-500">
        <div>Order day: {product.orderDay ?? "-"}</div>
      </div>
      <div className="mt-4 grid grid-cols-[auto,1fr,auto] items-center gap-2 sm:flex sm:flex-wrap sm:items-center">
        <button
          type="button"
          className="h-11 rounded-full border border-ink-900 bg-ink-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] active:translate-y-0"
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
          className="h-11 rounded-full border border-ink-200 bg-white/90 px-3 text-sm text-ink-700 shadow-sm"
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
          className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 bg-white/80 text-ink-500 transition hover:border-ink-300 hover:text-ink-700 cursor-pointer"
          onClick={() => {
            setLocalQty(0);
            scheduleFlush(0);
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
