import Link from "next/link";
import { prisma } from "@/lib/db";

const PAGE_SIZE = 20;

function getParam(searchParams: Record<string, string | string[] | undefined>, key: string) {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0];
  return value ?? "";
}

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const query = getParam(searchParams, "q");
  const brand = getParam(searchParams, "brand");
  const supplier = getParam(searchParams, "supplier");
  const storage = getParam(searchParams, "storage");
  const status = getParam(searchParams, "status");
  const optional = getParam(searchParams, "optional");
  const orderDay = getParam(searchParams, "orderDay");
  const page = Number(getParam(searchParams, "page") || "1");

  const where = {
    AND: [
      query
        ? {
            OR: [
              { itemName: { contains: query, mode: "insensitive" as const } },
              { supplierName: { contains: query, mode: "insensitive" as const } },
              { brandLabel: { contains: query, mode: "insensitive" as const } }
            ]
          }
        : {},
      brand ? { brandLabel: brand } : {},
      supplier ? { supplierName: supplier } : {},
      storage ? { storage: storage as never } : {},
      status ? { status: status as never } : {},
      optional ? { optionalNote: optional as never } : {},
      orderDay ? { orderDay: orderDay as never } : {},
      { isActive: true }
    ]
  };

  const [total, products, brands, suppliers] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { itemName: "asc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE
    }),
    prisma.product.findMany({ distinct: ["brandLabel"], select: { brandLabel: true } }),
    prisma.product.findMany({ distinct: ["supplierName"], select: { supplierName: true } })
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Products</h1>
          <p className="text-sm text-ink-500">Filter, sort, and update quickly.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form className="flex gap-2" action="/products" method="get">
            <input
              className="rounded-full border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
              placeholder="Search products"
              name="q"
              defaultValue={query}
            />
            <button className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white shadow-soft">
              Search
            </button>
          </form>
          <Link
            href="/products/new"
            className="rounded-full border border-ink-200 bg-white/90 px-4 py-2 text-sm font-semibold text-ink-700 shadow-ring"
          >
            New product
          </Link>
        </div>
      </div>

      <form className="grid gap-3 md:grid-cols-6" action="/products" method="get">
        <select name="brand" className="rounded-2xl border border-ink-200 bg-white/90 px-3 py-2 text-sm shadow-ring">
          <option value="">Brand</option>
          {brands.map((item) => (
            <option key={item.brandLabel} value={item.brandLabel ?? ""}>
              {item.brandLabel}
            </option>
          ))}
        </select>
        <select name="supplier" className="rounded-2xl border border-ink-200 bg-white/90 px-3 py-2 text-sm shadow-ring">
          <option value="">Supplier</option>
          {suppliers.map((item) => (
            <option key={item.supplierName} value={item.supplierName ?? ""}>
              {item.supplierName}
            </option>
          ))}
        </select>
        <select name="storage" className="rounded-2xl border border-ink-200 bg-white/90 px-3 py-2 text-sm shadow-ring">
          <option value="">Storage</option>
          <option value="AMBIENT">Ambient</option>
          <option value="FRIDGE">Fridge</option>
          <option value="FROZEN">Frozen</option>
          <option value="FROZEN_DEFROST">Frozen-Defrost</option>
        </select>
        <select name="status" className="rounded-2xl border border-ink-200 bg-white/90 px-3 py-2 text-sm shadow-ring">
          <option value="">Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="DISCONTINUED">Discontinued</option>
        </select>
        <select name="optional" className="rounded-2xl border border-ink-200 bg-white/90 px-3 py-2 text-sm shadow-ring">
          <option value="">Optional/Core</option>
          <option value="CORE">Core</option>
          <option value="OPTIONAL">Optional</option>
        </select>
        <select name="orderDay" className="rounded-2xl border border-ink-200 bg-white/90 px-3 py-2 text-sm shadow-ring">
          <option value="">Order Day</option>
          <option value="MONDAY">Monday</option>
          <option value="TUESDAY">Tuesday</option>
          <option value="WEDNESDAY">Wednesday</option>
          <option value="THURSDAY">Thursday</option>
          <option value="FRIDAY">Friday</option>
          <option value="SATURDAY">Saturday</option>
          <option value="SUNDAY">Sunday</option>
        </select>
        <button className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white shadow-soft md:col-span-6">
          Apply filters
        </button>
      </form>

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
          {products.map((product) => (
            <div
              key={product.id}
              className="grid grid-cols-8 gap-2 px-6 py-4 text-sm text-ink-700"
            >
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
        {products.map((product) => (
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
            <Link
              className="rounded-full border border-ink-200 px-3 py-1"
              href={`/products?page=${page - 1}`}
            >
              Previous
            </Link>
          )}
          {page < totalPages && (
            <Link
              className="rounded-full border border-ink-200 px-3 py-1"
              href={`/products?page=${page + 1}`}
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
