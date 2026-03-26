"use client";

import { useState, useTransition } from "react";
import OrderNeedLine from "@/components/order-need-line";
import OrderShare from "@/components/order-share";
import { markSupplierDone } from "@/app/actions/order-needs";

function buildFormData(supplier: string) {
  const formData = new FormData();
  formData.set("supplier", supplier);
  return formData;
}

export default function OrderNeedGroup({
  supplier,
  items,
  shareOnly = false,
  shareText,
  allowBulk = true
}: {
  supplier: string;
  items: { id: string; name: string; qty: string }[];
  shareOnly?: boolean;
  shareText?: string;
  allowBulk?: boolean;
}) {
  const [hidden, setHidden] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (hidden) return null;

  if (shareOnly) {
    return (
      <OrderShare
        supplier={supplier}
        items={items}
        title="Weekly Order List"
        textOverride={shareText}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-ink-100 bg-white/90 p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink-900">{supplier}</h2>
          <span className="text-xs text-ink-500">{items.length} items</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {allowBulk && (
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(() => {
                  setHidden(true);
                  return markSupplierDone(buildFormData(supplier));
                })
              }
              className="rounded-full bg-ink-900 px-3 py-1 text-xs font-semibold text-white shadow-soft transition active:translate-y-[1px]"
            >
              Mark all done
            </button>
          )}
          <OrderShare
            supplier={supplier}
            items={items.map((item) => ({ name: item.name, qty: item.qty }))}
          />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-3 text-xs uppercase tracking-[0.2em] text-ink-400">
        <span>Item</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Action</span>
      </div>
      <div className="mt-2 divide-y divide-ink-100 text-sm text-ink-600">
        {items.map((item) => (
          <OrderNeedLine key={item.id} id={item.id} name={item.name} qty={item.qty} />
        ))}
      </div>
    </div>
  );
}
