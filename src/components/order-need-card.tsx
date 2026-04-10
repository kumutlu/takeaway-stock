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
    supplierNames: string[];
    orderDay: string | null;
    requiredStock: number | null;
    unit: string | null;
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
    <div className="ui-card ui-card-hover p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              onClick={onToggleFavorite}
              className="ui-icon-btn ui-focus h-8 w-8 text-ink-500 hover:text-amber-500"
            >
              <Star size={14} className={isFavorite ? "fill-amber-400 text-amber-500" : ""} />
            </button>
            <p className="text-base font-semibold text-ink-900">{product.itemName}</p>
          </div>
          <p className="text-sm text-ink-500">{product.supplierNames.join(", ") || "-"}</p>
        </div>
        <span className="rounded-full border border-ink-200 bg-white/95 px-3 py-1 text-sm font-semibold text-ink-900 shadow-ring">
          Qty {localQty}
        </span>
      </div>
      <div className="mt-3 text-sm text-ink-500">
        <div>Order day: {product.orderDay ?? "-"}</div>
        <div>
          Required stock:{" "}
          {product.requiredStock == null ? "-" : `${product.requiredStock}${product.unit ? ` ${product.unit}` : ""}`}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[auto,1fr,auto] items-center gap-2 sm:flex sm:flex-wrap sm:items-center">
        <button
          type="button"
          className="ui-btn ui-btn-primary ui-focus h-11 px-5 text-sm"
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
          className="ui-input ui-focus h-11 rounded-full px-3 text-sm shadow-sm"
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
          className="ui-icon-btn ui-focus h-11 w-11 cursor-pointer"
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
