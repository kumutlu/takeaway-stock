"use client";

import { useState } from "react";
import OrderNeedDoneButton from "@/components/order-need-done";

export default function OrderNeedLine({
  id,
  name,
  qty
}: {
  id: string;
  name: string;
  qty: string;
}) {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-3">
      <span>{name}</span>
      <span className="text-right font-semibold text-ink-900">{qty}</span>
      <div className="flex justify-end">
        <OrderNeedDoneButton id={id} onDone={() => setHidden(true)} />
      </div>
    </div>
  );
}
