"use client";

import { useState, useTransition } from "react";
import OrderNeedLine from "@/components/order-need-line";
import OrderShare from "@/components/order-share";
import JjPreparePanel from "@/components/jj-prepare-panel";
import { markSupplierDone } from "@/app/actions/order-needs";

const SUPPLIER_ORDER_URLS: Record<string, string> = {
  adams: "https://adamsfoodservice.com",
  booker: "https://www.booker.co.uk",
  ics: "https://cater-choice.com/branch/pos",
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
    <div className="ui-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink-900">{supplier}</h2>
          <span className="text-xs text-ink-500">{items.length} items</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <JjPreparePanel supplier={supplier} />
          {orderUrl && (
            <a
              href={orderUrl}
              target="_blank"
              rel="noreferrer"
              className="ui-btn ui-focus px-3 py-1 text-xs"
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
              className="ui-btn ui-btn-primary ui-focus px-3 py-1 text-xs"
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
