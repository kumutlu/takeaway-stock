import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import ProductForm from "@/components/product-form";
import { deleteProduct, updateProduct } from "../../actions";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Edit Product</h1>
        <p className="text-sm text-ink-500">Update product details.</p>
      </div>
      <div className="rounded-2xl bg-white/80 p-6 shadow-soft">
        <ProductForm
          action={updateProduct}
          initial={{
            id: product.id,
            itemName: product.itemName,
            supplierName: product.supplierName,
            brandLabel: product.brandLabel,
            storage: product.storage,
            status: product.status,
            optionalNote: product.optionalNote,
            orderDay: product.orderDay,
            inventoryCheckDay: product.inventoryCheckDay,
            minimumOrder: product.minimumOrder,
            parLevel: product.parLevel,
            currentStock: product.currentStock,
            unit: product.unit
          }}
        />
        <form action={deleteProduct} className="mt-4 pt-4 border-t border-ink-100">
          <input type="hidden" name="id" value={product.id} />
          <button
            type="submit"
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
          >
            Delete product
          </button>
        </form>
      </div>
    </section>
  );
}
