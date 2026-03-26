import { prisma } from "@/lib/db";
import { getWeekStart } from "@/lib/order-utils";
import OrderNeedRow from "@/components/order-need-row";
import OrderNeedCard from "@/components/order-need-card";

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

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Order Needs</h1>
          <p className="text-sm text-ink-500">
            Click Add to increase by one. Use the dropdown to adjust or remove anytime.
          </p>
        </div>
        <a
          href="/orders"
          className="rounded-full border border-ink-900 bg-ink-900 px-4 py-2 text-xs font-semibold text-white shadow-soft"
        >
          Finish & View Orders
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
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

      <div className="hidden rounded-2xl border border-ink-100 bg-white/90 shadow-soft lg:block">
        <div className="grid grid-cols-6 gap-2 border-b border-ink-100 px-6 py-3 text-xs uppercase tracking-[0.18em] text-ink-400">
          <span className="col-span-2">Item</span>
          <span>Supplier</span>
          <span>Order Day</span>
          <span>Qty</span>
          <span>Actions</span>
        </div>
        <div className="divide-y divide-ink-100">
          {products.map((product) => {
            const need = needMap.get(product.id);
            const qty = need?.neededQty ?? 0;
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
        {products.map((product) => {
          const need = needMap.get(product.id);
          const qty = need?.neededQty ?? 0;
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
    </section>
  );
}
