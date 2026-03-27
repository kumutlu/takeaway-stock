"use client";

import { useState, useTransition } from "react";
import OrderNeedLine from "@/components/order-need-line";
import OrderShare from "@/components/order-share";
import { markSupplierDone } from "@/app/actions/order-needs";

const SUPPLIER_ORDER_URLS: Record<string, string> = {
  adams: "https://adamsfoodservice.com",
  booker: "https://www.booker.co.uk",
  ics: "https://cater-choice.com/branch/dashboard",
  jj: "https://www.jjfoodservice.com",
  "n bazaar": "https://wa.me/447436342009",
  pe: "https://www.packagingenvironmental.co.uk",
  olleco: "https://www.olleco.co.uk"
};

function getSupplierOrderUrl(supplier: string) {
  const key = supplier.trim().toLowerCase();
  return SUPPLIER_ORDER_URLS[key];
}

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

  const orderUrl = getSupplierOrderUrl(supplier);

  return (
    <div className="rounded-2xl border border-ink-100 bg-white/90 p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink-900">{supplier}</h2>
          <span className="text-xs text-ink-500">{items.length} items</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {orderUrl && (
            <a
              href={orderUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-ink-200 px-3 py-1 text-xs font-semibold text-ink-700 transition hover:border-ink-300 hover:text-ink-900"
            >
              Open supplier site
            </a>
          )}
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
