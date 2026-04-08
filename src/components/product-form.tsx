"use client";

import { useState } from "react";
import { FormFeedback } from "@/components/form-feedback";
import { StorageType, ProductStatus, OptionalType, Weekday } from "@prisma/client";

export default function ProductForm({
  action,
  initial,
  supplierOptions
}: {
  action: (
    prevState: { message?: string; success?: boolean },
    formData: FormData
  ) => Promise<{ message?: string; success?: boolean }>;
  supplierOptions: string[];
  initial?: {
    id?: string;
    itemName?: string;
    supplierName?: string;
    brandLabel?: string;
    storage?: StorageType;
    status?: ProductStatus;
    optionalNote?: OptionalType;
    orderDay?: Weekday | null;
    inventoryCheckDay?: Weekday | null;
    minimumOrder?: number | null;
    parLevel?: number | null;
    currentStock?: number | null;
    unit?: string | null;
  };
}) {
  const isEdit = Boolean(initial?.id);
  const [suppliers, setSuppliers] = useState<string[]>(
    isEdit ? [initial?.supplierName ?? ""] : [""]
  );
  const [extraSuppliers, setExtraSuppliers] = useState<string[]>([]);

  const updateSupplier = (index: number, value: string) => {
    setSuppliers((prev) => prev.map((supplier, i) => (i === index ? value : supplier)));
  };

  const addSupplierField = () => setSuppliers((prev) => [...prev, ""]);

  const removeSupplierField = (index: number) => {
    setSuppliers((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };
  const updateExtraSupplier = (index: number, value: string) => {
    setExtraSuppliers((prev) => prev.map((supplier, i) => (i === index ? value : supplier)));
  };
  const addExtraSupplierField = () => setExtraSuppliers((prev) => [...prev, ""]);
  const removeExtraSupplierField = (index: number) => {
    setExtraSuppliers((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <FormFeedback
      action={action}
      resetOnSuccess={!isEdit}
      onSuccess={() => {
        if (isEdit) return;
        setSuppliers([""]);
        setExtraSuppliers([]);
      }}
    >
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
          placeholder="Item name"
          name="itemName"
          defaultValue={initial?.itemName ?? ""}
          required
        />
        <input
          className="rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
          placeholder="Brand label"
          name="brandLabel"
          defaultValue={initial?.brandLabel ?? ""}
          required
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Suppliers</p>
        {suppliers.map((supplier, index) => (
          <div key={`${index}-${isEdit ? "edit" : "new"}`} className="flex gap-2">
            {isEdit ? (
              <>
                <input
                  type="hidden"
                  name="supplierName"
                  value={supplier}
                />
                <input
                  className="w-full rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
                  value={supplier}
                  disabled
                />
              </>
            ) : (
              <select
                className="w-full rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
                name="supplierNames"
                value={supplier}
                onChange={(event) => updateSupplier(index, event.target.value)}
                required
              >
                <option value="">Select supplier</option>
                {supplierOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
            {!isEdit && suppliers.length > 1 && (
              <button
                type="button"
                onClick={() => removeSupplierField(index)}
                className="rounded-xl border border-ink-200 px-3 py-2 text-xs text-ink-600"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {!isEdit && (
          <button
            type="button"
            onClick={addSupplierField}
            className="rounded-full border border-ink-200 bg-white/90 px-4 py-2 text-xs font-semibold text-ink-700 shadow-ring"
          >
            Add supplier
          </button>
        )}
      </div>
      {isEdit && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
            Add extra suppliers
          </p>
          {extraSuppliers.map((supplier, index) => (
            <div key={`extra-${index}`} className="flex gap-2">
              <select
                className="w-full rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
                name="extraSupplierNames"
                value={supplier}
                onChange={(event) => updateExtraSupplier(index, event.target.value)}
              >
                <option value="">Select supplier</option>
                {supplierOptions
                  .filter((option) => option !== (initial?.supplierName ?? ""))
                  .map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={() => removeExtraSupplierField(index)}
                className="rounded-xl border border-ink-200 px-3 py-2 text-xs text-ink-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addExtraSupplierField}
            className="rounded-full border border-ink-200 bg-white/90 px-4 py-2 text-xs font-semibold text-ink-700 shadow-ring"
          >
            Add supplier
          </button>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
          placeholder="Unit (kg, packs, ... )"
          name="unit"
          defaultValue={initial?.unit ?? ""}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <select
          className="rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
          name="storage"
          defaultValue={initial?.storage ?? "AMBIENT"}
        >
          <option value="AMBIENT">Ambient</option>
          <option value="FRIDGE">Fridge</option>
          <option value="FROZEN">Frozen</option>
          <option value="FROZEN_DEFROST">Frozen-Defrost</option>
        </select>
        <select
          className="rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
          name="status"
          defaultValue={initial?.status ?? "ACTIVE"}
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="DISCONTINUED">Discontinued</option>
        </select>
        <select
          className="rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
          name="optionalNote"
          defaultValue={initial?.optionalNote ?? "CORE"}
        >
          <option value="CORE">Core</option>
          <option value="OPTIONAL">Optional</option>
        </select>
        <select
          className="rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
          name="orderDay"
          defaultValue={initial?.orderDay ?? ""}
        >
          <option value="">Order Day</option>
          {Object.values(Weekday).map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <input
          className="rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
          placeholder="Minimum order"
          name="minimumOrder"
          type="number"
          defaultValue={initial?.minimumOrder ?? 0}
        />
        <input
          className="rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
          placeholder="Required stock level (optional)"
          name="parLevel"
          type="number"
          defaultValue={initial?.parLevel ?? ""}
        />
        <input
          className="rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
          placeholder="Current stock"
          name="currentStock"
          type="number"
          defaultValue={initial?.currentStock ?? 0}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <select
          className="rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
          name="inventoryCheckDay"
          defaultValue={initial?.inventoryCheckDay ?? ""}
        >
          <option value="">Inventory Check Day</option>
          {Object.values(Weekday).map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-2">
        <button className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white">
          Save product
        </button>
      </div>
    </FormFeedback>
  );
}
