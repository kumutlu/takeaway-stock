import { prisma } from "@/lib/db";
import { createStockMovement } from "./actions";

export default async function StockUpdatesPage() {
  const [products, movements] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true }, orderBy: { itemName: "asc" } }),
    prisma.stockMovement.findMany({
      include: { product: true, user: true },
      orderBy: { createdAt: "desc" },
      take: 10
    })
  ]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Stock Updates</h1>
        <p className="text-sm text-ink-500">Log counts, adjustments, receipts, or waste.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <div className="h-full min-w-0 rounded-2xl border border-ink-100 bg-white/90 p-6 shadow-soft">
          <h2 className="text-sm font-semibold text-ink-900">Quick update</h2>
          <form action={createStockMovement} className="mt-4 grid gap-4">
            <select
              className="w-full rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
              name="productId"
              required
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.itemName} · {product.brandLabel}
                </option>
              ))}
            </select>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="w-full rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
                placeholder="Quantity"
                type="number"
                name="quantity"
                required
              />
              <select className="w-full rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring" name="type">
                <option value="COUNT">Stock count update</option>
                <option value="ADJUSTMENT">Manual adjustment</option>
                <option value="RECEIVED">Goods received</option>
                <option value="WASTE">Waste / spoilage</option>
              </select>
            </div>
            <textarea
              className="w-full rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
              placeholder="Notes"
              name="notes"
              rows={3}
            />
            <button className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white shadow-soft">
              Save update
            </button>
          </form>
        </div>
        <div className="h-full min-w-0 min-h-[320px] rounded-2xl bg-ink-900 p-6 text-white shadow-card">
          <h2 className="text-sm font-semibold text-ink-100">Audit log</h2>
          <p className="mt-4 text-sm text-ink-200">
            All changes are recorded with who and when.
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            {movements.map((movement) => (
              <li key={movement.id} className="rounded-xl border border-white/10 px-4 py-3">
                {movement.user?.email ?? "Unknown"} · {movement.type} · {movement.product.itemName}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
