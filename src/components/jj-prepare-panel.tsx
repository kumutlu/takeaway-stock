"use client";

import { useState, useTransition } from "react";
import { prepareJjCart } from "@/app/actions/order-needs";

type PreparedLine = {
  productId: string;
  name: string;
  neededQty: number;
  suggestedQty: number;
  searchTerm: string;
  searchUrl: string;
  isMapped: boolean;
};

type PreparedState = {
  ok: boolean;
  message: string;
  lines?: PreparedLine[];
  preparedAt?: string;
};

export default function JjPreparePanel({ supplier }: { supplier: string }) {
  const [result, setResult] = useState<PreparedState | null>(null);
  const [isPending, startTransition] = useTransition();
  const supplierKey = supplier.trim().toLowerCase();

  if (supplierKey !== "jj") return null;

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const formData = new FormData();
            formData.set("supplier", supplier);
            const response = await prepareJjCart(formData);
            setResult(response as PreparedState);
          })
        }
        className="ui-btn ui-focus px-3 py-1 text-xs disabled:opacity-60"
      >
        {isPending ? "Preparing..." : "Prepare JJ cart"}
      </button>

      {result && (
        <div className="rounded-xl border border-ink-100 bg-ink-50 p-3 text-xs text-ink-700 shadow-ring">
          <p className={result.ok ? "text-ink-700" : "text-red-600"}>{result.message}</p>
          {!!result.lines?.length && (
            <div className="mt-2 max-h-48 space-y-2 overflow-auto">
              {result.lines.map((line) => (
                <div
                  key={`${line.productId}-${line.searchTerm}`}
                  className="flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-900">{line.name}</p>
                    <p className="truncate text-[11px] text-ink-500">
                      Qty {line.suggestedQty} • {line.isMapped ? "Mapped" : "Needs review"}
                    </p>
                  </div>
                  <a
                    href={line.searchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ui-btn ui-focus px-2 py-1 text-[11px]"
                  >
                    Search
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
