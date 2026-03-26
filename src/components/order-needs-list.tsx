"use client";

import { useMemo, useState } from "react";
import OrderNeedRow from "@/components/order-need-row";
import OrderNeedCard from "@/components/order-need-card";

type ProductItem = {
  id: string;
  itemName: string;
  supplierName: string | null;
  orderDay: string | null;
};

export default function OrderNeedsList({
  products,
  needs
}: {
  products: ProductItem[];
  needs: Record<string, number>;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) => {
      const name = product.itemName.toLowerCase();
      const supplier = (product.supplierName ?? "").toLowerCase();
      return name.includes(q) || supplier.includes(q);
    });
  }, [products, query]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search items or suppliers"
          className="w-full rounded-full border border-ink-200 bg-white/90 px-4 py-3 text-sm shadow-ring"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="rounded-full border border-ink-200 bg-white/90 px-4 py-2 text-xs text-ink-600 shadow-ring"
          >
            Clear
          </button>
        )}
      </div>

      <div className="hidden rounded-2xl border border-ink-100 bg-white/90 shadow-soft lg:block">
        <div className="grid grid-cols-6 gap-2 border-b border-ink-100 px-6 py-3 text-xs uppercase tracking-[0.18em] text-ink-400">
          <span className="col-span-2">Item</span>
          <span>Supplier</span>
          <span>Order Day</span>
          <span>Qty</span>
          <span>Actions</span>
        </div>
        <div className="divide-y divide-ink-100">
          {filtered.map((product) => {
            const qty = needs[product.id] ?? 0;
            return (
              <OrderNeedRow
                key={product.id}
                product={{
                  id: product.id,
                  itemName: product.itemName,
                  supplierName: product.supplierName,
                  orderDay: product.orderDay
                }}
                initialQty={qty}
              />
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:hidden">
        {filtered.map((product) => {
          const qty = needs[product.id] ?? 0;
          return (
            <OrderNeedCard
              key={product.id}
              product={{
                id: product.id,
                itemName: product.itemName,
                supplierName: product.supplierName,
                orderDay: product.orderDay
              }}
              initialQty={qty}
            />
          );
        })}
      </div>
    </>
  );
}
