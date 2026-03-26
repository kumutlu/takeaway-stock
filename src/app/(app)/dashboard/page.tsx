import { prisma } from "@/lib/db";
import { getOrderNeedsForWeek, getTodayWeekday, getWeekStart } from "@/lib/order-utils";
import PushOptIn from "@/components/push-optin";
import { getVapidPublicKey } from "@/lib/push";

const NEEDS_WINDOW = new Set(["SUNDAY", "MONDAY", "TUESDAY"]);

export default async function DashboardPage() {
  const today = getTodayWeekday();
  const weekStart = getWeekStart();

  const [totalProducts, brandCountsRaw, storageCountsRaw, products, needs] =
    await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.groupBy({
        by: ["brandLabel"],
        _count: { brandLabel: true },
        where: { isActive: true }
      }),
      prisma.product.groupBy({
        by: ["storage"],
        _count: { storage: true },
        where: { isActive: true }
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { currentStock: true, parLevel: true, inventoryCheckDay: true, minimumOrder: true }
      }),
      getOrderNeedsForWeek(weekStart)
    ]);

  const checksToday = products.filter((product) => product.inventoryCheckDay === today);

  const brandCounts = Object.fromEntries(
    brandCountsRaw.map((item) => [item.brandLabel ?? "Unknown", item._count.brandLabel])
  );
  const storageCounts = Object.fromEntries(
    storageCountsRaw.map((item) => [item.storage.replace("_", "-"), item._count.storage])
  );

  const pendingNeeds = needs.filter((need) => !need.done);
  const showNeedsAlert = NEEDS_WINDOW.has(today) && pendingNeeds.length > 0;
  const publicKey = getVapidPublicKey();

  return (
    <section className="space-y-6">
      {showNeedsAlert && (
        <div className="rounded-2xl border border-ink-100 bg-white/90 p-4 text-sm text-ink-700 shadow-ring">
          Order needs are still pending for this week. Please log required quantities by Tuesday.
        </div>
      )}

      {publicKey && (
        <div className="max-w-md">
          <PushOptIn publicKey={publicKey} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {[
          { label: "Total products", value: totalProducts },
          { label: "Checks today", value: checksToday.length }
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-ink-100 bg-white/90 p-5 shadow-soft">
            <p className="text-xs tracking-[0.3em] text-ink-400">{card.label}</p>
            <p className="mt-3 font-[var(--font-display)] text-3xl text-ink-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-ink-100 bg-white/90 p-6 shadow-soft">
          <h2 className="text-sm font-semibold text-ink-900">Brand Breakdown</h2>
          <ul className="mt-4 space-y-3 text-sm text-ink-600">
            {Object.entries(brandCounts).map(([brand, count]) => (
              <li key={brand} className="flex items-center justify-between">
                <span>{brand}</span>
                <span className="font-semibold text-ink-900">{count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white/90 p-6 shadow-soft">
          <h2 className="text-sm font-semibold text-ink-900">Storage Distribution</h2>
          <ul className="mt-4 space-y-3 text-sm text-ink-600">
            {Object.entries(storageCounts).map(([storage, count]) => (
              <li key={storage} className="flex items-center justify-between">
                <span>{storage}</span>
                <span className="font-semibold text-ink-900">{count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-ink-900 p-6 text-white shadow-card">
          <h2 className="text-sm font-semibold text-ink-100">This week's order list</h2>
          <p className="mt-4 font-[var(--font-display)] text-4xl">{pendingNeeds.length}</p>
          <p className="mt-4 text-sm text-ink-200">
            Review supplier breakdown and export the order list.
          </p>
          <a
            href="/orders"
            className="mt-5 inline-flex rounded-full border border-white/40 px-4 py-2 text-xs font-semibold text-white"
          >
            View orders
          </a>
        </div>
      </div>
    </section>
  );
}
