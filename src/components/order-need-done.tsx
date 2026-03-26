"use client";

import { useTransition } from "react";
import { markOrderNeedDone } from "@/app/actions/order-needs";

function buildFormData(id: string) {
  const formData = new FormData();
  formData.set("id", id);
  return formData;
}

export default function OrderNeedDoneButton({
  id,
  onDone
}: {
  id: string;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="rounded-full border border-ink-200 bg-white/90 px-3 py-1 text-xs font-semibold text-ink-700 shadow-ring transition active:translate-y-[1px]"
      disabled={isPending}
      onClick={() =>
        startTransition(() => {
          onDone();
          return markOrderNeedDone(buildFormData(id));
        })
      }
    >
      Mark done
    </button>
  );
}
