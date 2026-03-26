import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { FormFeedback } from "@/components/form-feedback";
import { createOrderNeed } from "@/app/actions/order-needs";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, settings] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { stockMovements: { orderBy: { createdAt: "desc" }, take: 10 } }
    }),
    prisma.appSetting.findUnique({ where: { id: 1 } })
  ]);

  if (!product) {
    notFound();
  }

  const useMinimumOrder = settings?.lowStockThreshold === "MINIMUM_ORDER";
  const base = useMinimumOrder ? product.minimumOrder ?? 0 : product.parLevel ?? 0;
  const isLow = (product.currentStock ?? 0) < base;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-white/80 p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink-400">Product detail</p>
            <h1 className="mt-2 text-3xl font-semibold text-ink-900">{product.itemName}</h1>
            <p className="mt-2 text-sm text-ink-500">
              {product.brandLabel} · {product.supplierName} · {product.storage.replace("_", "-")}
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { label: "Current stock", value: `${product.currentStock ?? 0} ${product.unit ?? ""}` },
            { label: "Par level", value: `${product.parLevel ?? 0} ${product.unit ?? ""}` },
            { label: "Order day", value: product.orderDay ?? "-" },
            { label: "Priority", value: product.optionalNote }
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-ink-100 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-400">{card.label}</p>
              <p className="mt-2 text-lg font-semibold text-ink-900">{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white/80 p-6 shadow-soft">
          <h2 className="text-sm font-semibold text-ink-900">Stock movements</h2>
          <div className="mt-4 space-y-3">
            {product.stockMovements.map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between rounded-xl border border-ink-100 bg-white/70 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-ink-900">{movement.type}</p>
                  <p className="text-xs text-ink-500">
                    {movement.createdAt.toISOString().slice(0, 10)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-ink-900">{movement.quantity}</p>
                  <p className="text-xs text-ink-500">{movement.notes ?? ""}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-ink-900 p-6 text-white shadow-card">
          <h2 className="text-sm font-semibold text-ink-100">Order need</h2>
          <p className="mt-4 text-2xl font-semibold">{isLow ? "Order required" : "OK"}</p>
          <p className="mt-2 text-sm text-ink-200">
            Order day: {product.orderDay ?? "-"}
          </p>
          <div className="mt-4 rounded-2xl bg-white/10 p-4">
            <FormFeedback action={createOrderNeed}>
              <input type="hidden" name="productId" value={product.id} />
              <input
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white"
                name="neededQty"
                placeholder="Needed qty"
                type="number"
                required
              />
              <button className="mt-3 w-full rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-ink-900">
                Save order need
              </button>
            </FormFeedback>
          </div>
        </div>
      </div>
    </section>
  );
}
