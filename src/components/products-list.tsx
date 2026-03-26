"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type ProductItem = {
  id: string;
  itemName: string;
  brandLabel: string | null;
  supplierName: string | null;
  storage: string;
  currentStock: number | null;
  parLevel: number | null;
  unit: string | null;
  status: string;
};

export default function ProductsList({
  products,
  page,
  totalPages
}: {
  products: ProductItem[];
  page: number;
  totalPages: number;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) => {
      const name = product.itemName.toLowerCase();
      const supplier = (product.supplierName ?? "").toLowerCase();
      const brand = (product.brandLabel ?? "").toLowerCase();
      return name.includes(q) || supplier.includes(q) || brand.includes(q);
    });
  }, [products, query]);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Products</h1>
          <p className="text-sm text-ink-500">Filter, sort, and update quickly.</p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-nowrap">
          <div className="flex w-full gap-2 sm:w-auto">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-full border border-ink-200 bg-white/90 px-4 py-3 text-sm shadow-ring sm:w-64"
              placeholder="Search products"
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
          <Link
            href="/products/new"
            className="w-full rounded-full border border-ink-200 bg-white/90 px-4 py-3 text-sm font-semibold text-ink-700 shadow-ring sm:w-auto"
          >
            New product
          </Link>
        </div>
      </div>

      <div className="hidden rounded-2xl border border-ink-100 bg-white/90 shadow-soft lg:block">
        <div className="grid grid-cols-8 gap-2 border-b border-ink-100 px-6 py-3 text-xs uppercase tracking-[0.2em] text-ink-400">
          <span className="col-span-2">Item</span>
          <span>Brand</span>
          <span>Supplier</span>
          <span>Storage</span>
          <span>Stock</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        <div className="divide-y divide-ink-100">
          {filtered.map((product) => (
            <div key={product.id} className="grid grid-cols-8 gap-2 px-6 py-4 text-sm text-ink-700">
              <Link className="col-span-2 font-semibold text-ink-900" href={`/products/${product.id}`}>
                {product.itemName}
              </Link>
              <span>{product.brandLabel}</span>
              <span>{product.supplierName}</span>
              <span>{product.storage.replace("_", "-")}</span>
              <span>
                {product.currentStock ?? 0} / {product.parLevel ?? 0} {product.unit ?? ""}
              </span>
              <span className="text-ink-500">{product.status}</span>
              <Link className="text-xs text-ink-500" href={`/products/${product.id}/edit`}>
                Edit
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:hidden">
        {filtered.map((product) => (
          <div key={product.id} className="rounded-2xl border border-ink-100 bg-white/90 p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink-900">{product.itemName}</p>
                <p className="text-xs text-ink-500">{product.brandLabel}</p>
              </div>
              <Link className="text-xs text-ink-500" href={`/products/${product.id}/edit`}>
                Edit
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-ink-500">
              <div>Supplier: {product.supplierName}</div>
              <div>Storage: {product.storage.replace("_", "-")}</div>
              <div>Stock: {product.currentStock ?? 0}</div>
              <div>Status: {product.status}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-ink-500">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link className="rounded-full border border-ink-200 px-3 py-1" href={`/products?page=${page - 1}`}>
              Previous
            </Link>
          )}
          {page < totalPages && (
            <Link className="rounded-full border border-ink-200 px-3 py-1" href={`/products?page=${page + 1}`}>
              Next
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
