import { prisma } from "@/lib/db";
import { getWeekStart } from "@/lib/order-utils";
import OrderNeedsList from "@/components/order-needs-list";

function getParam(searchParams: Record<string, string | string[] | undefined>, key: string) {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0];
  return value ?? "";
}

export default async function OrderNeedsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const supplierFilter = getParam(searchParams, "supplier");
  const weekStart = getWeekStart();

  const [products, needs, suppliers] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        ...(supplierFilter ? { supplierName: supplierFilter } : {})
      },
      orderBy: [{ supplierName: "asc" }, { itemName: "asc" }]
    }),
    prisma.orderNeed.findMany({ where: { weekStart, done: false } }),
    prisma.product.findMany({ distinct: ["supplierName"], select: { supplierName: true } })
  ]);

  const needMap = new Map(needs.map((need) => [need.productId, need]));
  const groupedMap = new Map<
    string,
    {
      id: string;
      itemName: string;
      supplierNames: string[];
      orderDay: string | null;
      requiredStock: number | null;
      unit: string | null;
    }
  >();

  for (const product of products) {
    const key = `${product.itemName.trim().toLowerCase()}::${(product.brandLabel ?? "").trim().toLowerCase()}::${(product.unit ?? "").trim().toLowerCase()}`;
    const existing = groupedMap.get(key);

    if (existing) {
      if (product.supplierName && !existing.supplierNames.includes(product.supplierName)) {
        existing.supplierNames.push(product.supplierName);
      }
      continue;
    }

    groupedMap.set(key, {
      id: product.id,
      itemName: product.itemName,
      supplierNames: product.supplierName ? [product.supplierName] : [],
      orderDay: product.orderDay,
      requiredStock: product.parLevel,
      unit: product.unit
    });
  }

  const groupedProducts = Array.from(groupedMap.values()).sort((a, b) =>
    a.itemName.localeCompare(b.itemName)
  );

  const needLookup = Object.fromEntries(
    groupedProducts.map((product) => [product.id, needMap.get(product.id)?.neededQty ?? 0])
  );

  return (
    <section className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-900 sm:text-2xl">Order Needs</h1>
          <p className="text-xs text-ink-500 sm:text-sm">
            Click Add to increase by one. Use the dropdown to adjust or remove anytime.
          </p>
        </div>
        <a
          href="/orders"
          className="ui-btn ui-btn-primary ui-focus w-full text-center text-xs sm:w-auto"
        >
          Finish & View Orders
        </a>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <a
          href="/order-needs"
          className={`ui-focus ui-chip ${
            supplierFilter
              ? ""
              : "ui-chip-active"
          }`}
        >
          All suppliers
        </a>
        {suppliers.map((supplier) => (
          <a
            key={supplier.supplierName}
            href={`/order-needs?supplier=${encodeURIComponent(supplier.supplierName ?? "")}`}
            className={`ui-focus ui-chip ${
              supplierFilter === supplier.supplierName
                ? "ui-chip-active"
                : ""
            }`}
          >
            {supplier.supplierName}
          </a>
        ))}
      </div>

      <OrderNeedsList
        products={groupedProducts}
        needs={needLookup}
      />
    </section>
  );
}
