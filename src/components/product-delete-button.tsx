"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { deleteProductInline } from "@/app/(app)/products/actions";

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Delete product"
      title="Delete product"
      className="ui-icon-btn ui-focus h-8 w-8 border-red-200 text-red-500 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
    >
      <Trash2 size={14} />
    </button>
  );
}

export default function ProductDeleteButton({ productId }: { productId: string }) {
  return (
    <form
      action={deleteProductInline}
      onSubmit={(event) => {
        const ok = window.confirm("Delete this product? This cannot be undone.");
        if (!ok) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={productId} />
      <DeleteSubmitButton />
    </form>
  );
}
