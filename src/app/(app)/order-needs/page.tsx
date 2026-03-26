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
  const needLookup = Object.fromEntries(needMap.entries().map(([key, need]) => [key, need.neededQty]));

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
          className="w-full rounded-full border border-ink-900 bg-ink-900 px-4 py-2 text-center text-xs font-semibold text-white shadow-soft sm:w-auto"
        >
          Finish & View Orders
        </a>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <a
          href="/order-needs"
          className={`rounded-full border px-3 py-1 text-xs transition ${
            supplierFilter
              ? "border-ink-200 bg-white/80 text-ink-600 hover:border-ink-300"
              : "border-ink-900 bg-ink-900 text-white"
          }`}
        >
          All suppliers
        </a>
        {suppliers.map((supplier) => (
          <a
            key={supplier.supplierName}
            href={`/order-needs?supplier=${encodeURIComponent(supplier.supplierName ?? "")}`}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              supplierFilter === supplier.supplierName
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-ink-200 bg-white/80 text-ink-600 hover:border-ink-300"
            }`}
          >
            {supplier.supplierName}
          </a>
        ))}
      </div>

      <OrderNeedsList
        products={products.map((product) => ({
          id: product.id,
          itemName: product.itemName,
          supplierName: product.supplierName,
          orderDay: product.orderDay
        }))}
        needs={needLookup}
      />
    </section>
  );
}
