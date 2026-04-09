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
  const saved = getParam(searchParams, "saved");
  const count = Number(getParam(searchParams, "count") || "1");
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

  const [products, brands, suppliers] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { itemName: "asc" },
      select: {
        id: true,
        itemName: true,
        brandLabel: true,
        supplierName: true,
        storage: true,
        currentStock: true,
        parLevel: true,
        unit: true,
        status: true
      }
    }),
    prisma.product.findMany({ distinct: ["brandLabel"], select: { brandLabel: true } }),
    prisma.product.findMany({ distinct: ["supplierName"], select: { supplierName: true } })
  ]);

  const groupedMap = new Map<
    string,
    {
      id: string;
      itemName: string;
      brandLabel: string | null;
      supplierNames: string[];
      storage: string;
      currentStock: number;
      parLevel: number | null;
      unit: string | null;
      status: string;
    }
  >();

  for (const product of products) {
    const key = `${product.itemName.toLowerCase()}::${(product.brandLabel ?? "").toLowerCase()}::${(product.unit ?? "").toLowerCase()}`;
    const existing = groupedMap.get(key);
    if (existing) {
      if (product.supplierName && !existing.supplierNames.includes(product.supplierName)) {
        existing.supplierNames.push(product.supplierName);
      }
      existing.currentStock += product.currentStock ?? 0;
      if (existing.parLevel != null && product.parLevel != null) {
        existing.parLevel += product.parLevel;
      } else if (existing.parLevel == null && product.parLevel != null) {
        existing.parLevel = product.parLevel;
      }
      continue;
    }
    groupedMap.set(key, {
      id: product.id,
      itemName: product.itemName,
      brandLabel: product.brandLabel,
      supplierNames: product.supplierName ? [product.supplierName] : [],
      storage: product.storage,
      currentStock: product.currentStock ?? 0,
      parLevel: product.parLevel,
      unit: product.unit,
      status: product.status
    });
  }

  const groupedProducts = Array.from(groupedMap.values()).sort((a, b) =>
    a.itemName.localeCompare(b.itemName)
  );

  const totalPages = Math.max(1, Math.ceil(groupedProducts.length / PAGE_SIZE));
  const pagedProducts = groupedProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
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
      {saved === "1" && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          Product saved successfully{count > 1 ? ` for ${count} suppliers` : ""}.
        </p>
      )}
      <form className="grid gap-3 md:grid-cols-6" action="/products" method="get">
        <select name="brand" className="ui-input ui-focus rounded-2xl px-3 py-2">
          <option value="">Brand</option>
          {brands.map((item) => (
            <option key={item.brandLabel} value={item.brandLabel ?? ""}>
              {item.brandLabel}
            </option>
          ))}
        </select>
        <select name="supplier" className="ui-input ui-focus rounded-2xl px-3 py-2">
          <option value="">Supplier</option>
          {suppliers.map((item) => (
            <option key={item.supplierName} value={item.supplierName ?? ""}>
              {item.supplierName}
            </option>
          ))}
        </select>
        <select name="storage" className="ui-input ui-focus rounded-2xl px-3 py-2">
          <option value="">Storage</option>
          <option value="AMBIENT">Ambient</option>
          <option value="FRIDGE">Fridge</option>
          <option value="FROZEN">Frozen</option>
          <option value="FROZEN_DEFROST">Frozen-Defrost</option>
        </select>
        <select name="status" className="ui-input ui-focus rounded-2xl px-3 py-2">
          <option value="">Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="DISCONTINUED">Discontinued</option>
        </select>
        <select name="optional" className="ui-input ui-focus rounded-2xl px-3 py-2">
          <option value="">Optional/Core</option>
          <option value="CORE">Core</option>
          <option value="OPTIONAL">Optional</option>
        </select>
        <select name="orderDay" className="ui-input ui-focus rounded-2xl px-3 py-2">
          <option value="">Order Day</option>
          <option value="MONDAY">Monday</option>
          <option value="TUESDAY">Tuesday</option>
          <option value="WEDNESDAY">Wednesday</option>
          <option value="THURSDAY">Thursday</option>
          <option value="FRIDAY">Friday</option>
          <option value="SATURDAY">Saturday</option>
          <option value="SUNDAY">Sunday</option>
        </select>
        <button className="ui-btn ui-btn-primary ui-focus md:col-span-6">
          Apply filters
        </button>
      </form>

      <ProductsList
        products={pagedProducts}
        query={query}
        page={page}
        totalPages={totalPages}
        baseQuery={baseParams.toString()}
      />
    </section>
  );
}
