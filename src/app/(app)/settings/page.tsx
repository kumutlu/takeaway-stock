import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { FormFeedback } from "@/components/form-feedback";
import { updateSettings } from "./actions";
import PushOptIn from "@/components/push-optin";
import { getVapidPublicKey } from "@/lib/push";

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await prisma.appSetting.findUnique({ where: { id: 1 } });
  const publicKey = getVapidPublicKey();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Settings</h1>
        <p className="text-sm text-ink-500">Core preferences for the system.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-ink-100 bg-white/90 p-6 shadow-soft">
          <h2 className="text-sm font-semibold text-ink-900">General</h2>
          <FormFeedback action={updateSettings}>
            <div className="mt-4 space-y-3 text-sm text-ink-600">
              <div className="flex flex-col gap-2 rounded-xl border border-ink-100 bg-white/80 px-4 py-3 shadow-ring">
                <span>Low stock threshold</span>
                <select
                  className="rounded-lg border border-ink-200 bg-white/90 px-3 py-2 text-sm shadow-ring"
                  name="lowStockThreshold"
                  defaultValue={settings?.lowStockThreshold ?? "PAR_LEVEL"}
                >
                  <option value="PAR_LEVEL">Par level</option>
                  <option value="MINIMUM_ORDER">Minimum order</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 rounded-xl border border-ink-100 bg-white/80 px-4 py-3 shadow-ring">
                <span>Critical threshold (%)</span>
                <input
                  className="rounded-lg border border-ink-200 bg-white/90 px-3 py-2 text-sm shadow-ring"
                  type="number"
                  name="criticalPercent"
                  min={10}
                  max={90}
                  defaultValue={settings?.criticalPercent ?? 50}
                />
              </div>
            </div>
            <button className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white shadow-soft">
              Save settings
            </button>
          </FormFeedback>
        </div>
        <div className="rounded-2xl bg-ink-900 p-6 text-white shadow-card">
          <h2 className="text-sm font-semibold text-ink-100">Auth</h2>
          <p className="mt-4 text-sm text-ink-200">
            Supabase Auth handles sign-in securely.
          </p>
          {publicKey ? (
            <div className="mt-4">
              <PushOptIn publicKey={publicKey} />
            </div>
          ) : (
            <p className="mt-4 text-xs text-ink-300">
              Add VAPID keys to enable web push.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
