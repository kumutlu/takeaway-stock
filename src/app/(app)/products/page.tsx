import { prisma } from "@/lib/db";
import ProductsList from "@/components/products-list";

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
  const baseParams = new URLSearchParams();
  if (query) baseParams.set("q", query);
  if (brand) baseParams.set("brand", brand);
  if (supplier) baseParams.set("supplier", supplier);
  if (storage) baseParams.set("storage", storage);
  if (status) baseParams.set("status", status);
  if (optional) baseParams.set("optional", optional);
  if (orderDay) baseParams.set("orderDay", orderDay);

  return (
    <section className="space-y-6">
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

      <ProductsList
        products={products.map((product) => ({
          id: product.id,
          itemName: product.itemName,
          brandLabel: product.brandLabel,
          supplierName: product.supplierName,
          storage: product.storage,
          currentStock: product.currentStock,
          parLevel: product.parLevel,
          unit: product.unit,
          status: product.status
        }))}
        query={query}
        page={page}
        totalPages={totalPages}
        baseQuery={baseParams.toString()}
      />
    </section>
  );
}
