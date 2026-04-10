"use client";

import { useEffect, useMemo, useState } from "react";
import OrderNeedRow from "@/components/order-need-row";
import OrderNeedCard from "@/components/order-need-card";

type ProductItem = {
  id: string;
  itemName: string;
  supplierNames: string[];
  orderDay: string | null;
  requiredStock: number | null;
  unit: string | null;
};

export default function OrderNeedsList({
  products,
  needs
}: {
  products: ProductItem[];
  needs: Record<string, number>;
}) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"supplier" | "name">("supplier");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favoriteNames, setFavoriteNames] = useState<string[]>([]);

  const favoriteSet = useMemo(
    () => new Set(favoriteNames.map((name) => name.toLowerCase())),
    [favoriteNames]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("order-need-favorites");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) {
        setFavoriteNames(parsed);
      }
    } catch {
      setFavoriteNames([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("order-need-favorites", JSON.stringify(favoriteNames));
  }, [favoriteNames]);

  const toggleFavorite = (itemName: string) => {
    const key = itemName.toLowerCase();
    setFavoriteNames((prev) => {
      const exists = prev.some((name) => name.toLowerCase() === key);
      if (exists) return prev.filter((name) => name.toLowerCase() !== key);
      return [...prev, itemName];
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const searched = products.filter((product) => {
      const name = product.itemName.toLowerCase();
      const supplier = product.supplierNames.join(" ").toLowerCase();
      const searchOk = !q || name.includes(q) || supplier.includes(q);
      const favoriteOk = !favoritesOnly || favoriteSet.has(name);
      return searchOk && favoriteOk;
    });

    return [...searched].sort((a, b) => {
      if (sortBy === "name") {
        return a.itemName.localeCompare(b.itemName);
      }
      const supplierA = a.supplierNames[0] ?? "";
      const supplierB = b.supplierNames[0] ?? "";
      const supplierCompare = supplierA.localeCompare(supplierB);
      if (supplierCompare !== 0) return supplierCompare;
      return a.itemName.localeCompare(b.itemName);
    });
  }, [products, query, sortBy, favoritesOnly, favoriteSet]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search items or suppliers"
          className="ui-input rounded-full py-3"
        />
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as "supplier" | "name")}
          className="ui-input ui-focus min-h-[44px] w-auto rounded-full py-2"
        >
          <option value="supplier">Sort: Supplier</option>
          <option value="name">Sort: Product Name</option>
        </select>
        <button
          type="button"
          onClick={() => setFavoritesOnly((prev) => !prev)}
          className={`ui-focus min-h-[44px] rounded-full border px-4 py-2 text-sm transition duration-200 ${
            favoritesOnly
              ? "border-amber-300 bg-amber-50 text-amber-700 shadow-soft"
              : "border-ink-200 bg-white/90 text-ink-600 shadow-ring hover:border-ink-300 hover:bg-white hover:text-ink-900"
          }`}
        >
          Favorites only
        </button>
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="ui-btn ui-focus text-xs"
          >
            Clear
          </button>
        )}
      </div>

      <div className="ui-card hidden lg:block">
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
                  supplierNames: product.supplierNames,
                  orderDay: product.orderDay,
                  requiredStock: product.requiredStock,
                  unit: product.unit
                }}
                initialQty={qty}
                isFavorite={favoriteSet.has(product.itemName.toLowerCase())}
                onToggleFavorite={() => toggleFavorite(product.itemName)}
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
                supplierNames: product.supplierNames,
                orderDay: product.orderDay,
                requiredStock: product.requiredStock,
                unit: product.unit
              }}
              initialQty={qty}
              isFavorite={favoriteSet.has(product.itemName.toLowerCase())}
              onToggleFavorite={() => toggleFavorite(product.itemName)}
            />
          );
        })}
      </div>
    </>
  );
}
