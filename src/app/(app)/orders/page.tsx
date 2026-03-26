import { getOrderNeedsForWeek, getWeekStart } from "@/lib/order-utils";
import OrderNeedGroup from "@/components/order-need-group";

function groupBySupplier(items: Array<{ id: string; product: { supplierName: string; itemName: string; unit: string | null }; neededQty: number }>) {
  const grouped: Record<string, typeof items> = {};
  for (const item of items) {
    grouped[item.product.supplierName] = grouped[item.product.supplierName] ?? [];
    grouped[item.product.supplierName].push(item);
  }
  return grouped;
}

export default async function OrdersPage() {
  const weekStart = getWeekStart();
  const needs = await getOrderNeedsForWeek(weekStart);
  const grouped = groupBySupplier(needs);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Weekly Order List</h1>
        <p className="text-sm text-ink-500">Supplier-based list from staff-entered needs.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(grouped).map(([supplier, items]) => (
          <OrderNeedGroup
            key={supplier}
            supplier={supplier}
            items={items.map((item) => ({
              id: item.id,
              name: item.product.itemName,
              qty: `${item.neededQty} ${item.product.unit ?? ""}`.trim()
            }))}
          />
        ))}
        {!needs.length && (
          <div className="rounded-2xl border border-ink-100 bg-white/90 p-5 text-sm text-ink-500 shadow-ring">
            No order needs logged for this week.
          </div>
        )}
      </div>
    </section>
  );
}
