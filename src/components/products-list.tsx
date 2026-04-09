"use client";

import Link from "next/link";
import ProductDeleteButton from "@/components/product-delete-button";

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
  query,
  page,
  totalPages,
  baseQuery
}: {
  products: ProductItem[];
  query: string;
  page: number;
  totalPages: number;
  baseQuery: string;
}) {
  const getPageHref = (nextPage: number) => {
    const joiner = baseQuery ? "&" : "";
    return `/products?${baseQuery}${joiner}page=${nextPage}`;
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Products</h1>
          <p className="text-sm text-ink-500">Filter, sort, and update quickly.</p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-nowrap">
          <form action="/products" method="get" className="flex w-full gap-2 sm:w-auto">
            <input
              name="q"
              defaultValue={query}
              className="ui-input rounded-full py-3 sm:w-64"
              placeholder="Search products"
            />
            <button
              type="submit"
              className="ui-btn ui-focus text-xs"
            >
              Search
            </button>
            {query && (
              <Link
                href="/products"
                className="ui-btn ui-focus text-xs"
              >
                Clear
              </Link>
            )}
          </form>
          <Link
            href="/products/new"
            className="ui-btn ui-focus w-full py-3 sm:w-auto"
          >
            New product
          </Link>
          <Link
            href="/products/suppliers"
            className="ui-btn ui-focus w-full py-3 sm:w-auto"
          >
            Manage suppliers
          </Link>
        </div>
      </div>

      <div className="ui-card hidden lg:block">
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
          {products.map((product) => (
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
              <div className="flex items-center gap-2">
                <Link className="text-xs text-ink-500" href={`/products/${product.id}/edit`}>
                  Edit
                </Link>
                <ProductDeleteButton productId={product.id} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:hidden">
        {products.map((product) => (
          <div key={product.id} className="ui-card ui-card-hover p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink-900">{product.itemName}</p>
                <p className="text-xs text-ink-500">{product.brandLabel}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link className="text-xs text-ink-500" href={`/products/${product.id}/edit`}>
                  Edit
                </Link>
                <ProductDeleteButton productId={product.id} />
              </div>
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
            <a className="ui-btn ui-focus px-3 py-1 text-xs" href={getPageHref(page - 1)}>
              Previous
            </a>
          )}
          {page < totalPages && (
            <a className="ui-btn ui-focus px-3 py-1 text-xs" href={getPageHref(page + 1)}>
              Next
            </a>
          )}
        </div>
      </div>
    </>
  );
}
