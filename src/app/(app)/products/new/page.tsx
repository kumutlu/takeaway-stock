import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ProductForm from "@/components/product-form";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const { appUser } = await requireAdmin();
  const suppliers = await prisma.supplier.findMany({
    where: { projectId: appUser.projectId },
    orderBy: { name: "asc" },
    select: { name: true }
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">New Product</h1>
        <p className="text-sm text-ink-500">Add a new item.</p>
      </div>
      <div className="rounded-2xl bg-white/80 p-6 shadow-soft">
        <ProductForm action={createProduct} supplierOptions={suppliers.map((supplier) => supplier.name)} />
      </div>
    </section>
  );
}
