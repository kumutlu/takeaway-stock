import { getOrderNeedsForWeek, getWeekStart } from "@/lib/order-utils";
import OrderNeedGroup from "@/components/order-need-group";
import { requireUser } from "@/lib/auth";

function groupBySupplier(items: Array<{ id: string; product: { supplierName: string; itemName: string; unit: string | null }; neededQty: number }>) {
  const grouped: Record<string, typeof items> = {};
  for (const item of items) {
    grouped[item.product.supplierName] = grouped[item.product.supplierName] ?? [];
    grouped[item.product.supplierName].push(item);
  }
  return grouped;
}

export default async function OrdersPage() {
  const { appUser } = await requireUser();
  const weekStart = getWeekStart();
  const needs = await getOrderNeedsForWeek(weekStart);
  const grouped = groupBySupplier(needs);
  const allText = Object.entries(grouped)
    .map(([supplier, items]) => {
      const lines = items
        .map((item) => `- ${item.product.itemName}: ${item.neededQty} ${item.product.unit ?? ""}`.trim())
        .join("\n");
      return `# ${supplier}\n${lines}`;
    })
    .join("\n\n");

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Weekly Order List</h1>
          <p className="text-sm text-ink-500">Supplier-based list from staff-entered needs.</p>
        </div>
        {needs.length > 0 && (
          <OrderNeedGroup supplier="All suppliers" items={[]} shareOnly shareText={allText} />
        )}
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
            allowBulk={appUser.role === "ADMIN"}
          />
        ))}
        {!needs.length && (
          <div className="ui-card p-5 text-sm text-ink-500">
            No order needs logged for this week.
          </div>
        )}
      </div>
    </section>
  );
}
