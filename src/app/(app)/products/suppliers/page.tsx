import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { FormFeedback } from "@/components/form-feedback";
import { createSupplier, deleteSupplier } from "../actions";

export default async function SuppliersPage() {
  await requireAdmin();

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Supplier Management</h1>
          <p className="text-sm text-ink-500">Add new suppliers or delete unused ones.</p>
        </div>
        <Link
          href="/products"
          className="ui-btn ui-focus text-sm"
        >
          Back to products
        </Link>
      </div>

      <div className="ui-card p-6">
        <FormFeedback action={createSupplier}>
          <div className="flex flex-wrap gap-2">
            <input
              name="name"
              required
              placeholder="Supplier name"
              className="ui-input min-w-[240px] flex-1"
            />
            <button className="ui-btn ui-btn-primary ui-focus text-sm">
              Add supplier
            </button>
          </div>
        </FormFeedback>
      </div>

      <div className="ui-card">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-ink-100 px-5 py-3 text-xs uppercase tracking-[0.18em] text-ink-400">
          <span>Supplier</span>
          <span className="text-right">Products</span>
          <span className="text-right">Action</span>
        </div>
        <div className="divide-y divide-ink-100">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-5 py-3 text-sm"
            >
              <span className="font-medium text-ink-900">{supplier.name}</span>
              <span className="text-right text-ink-600">{supplier._count.products}</span>
              <div className="text-right">
                <form action={deleteSupplier}>
                  <input type="hidden" name="id" value={supplier.id} />
                  <button
                    type="submit"
                    disabled={supplier._count.products > 0}
                    className="ui-btn ui-focus px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
          {suppliers.length === 0 && (
            <div className="px-5 py-4 text-sm text-ink-500">No suppliers yet.</div>
          )}
        </div>
      </div>
    </section>
  );
}
