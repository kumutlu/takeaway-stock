import { requireAdmin } from "@/lib/auth";
import ProductForm from "@/components/product-form";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">New Product</h1>
        <p className="text-sm text-ink-500">Add a new item.</p>
      </div>
      <div className="rounded-2xl bg-white/80 p-6 shadow-soft">
        <ProductForm action={createProduct} />
      </div>
    </section>
  );
}
