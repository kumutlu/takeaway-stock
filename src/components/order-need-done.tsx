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
      className="ui-btn ui-focus px-3 py-1 text-xs"
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
