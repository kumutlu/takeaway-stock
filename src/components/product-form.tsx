import { FormFeedback } from "@/components/form-feedback";
import { StorageType, ProductStatus, OptionalType, Weekday } from "@prisma/client";

export default function ProductForm({
  action,
  initial
}: {
  action: (prevState: { message?: string }, formData: FormData) => Promise<{ message?: string }>;
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
  return (
    <FormFeedback action={action}>
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
          placeholder="Supplier"
          name="supplierName"
          defaultValue={initial?.supplierName ?? ""}
          required
        />
        <input
          className="rounded-xl border border-ink-200 bg-white/90 px-4 py-2 text-sm shadow-ring"
          placeholder="Brand label"
          name="brandLabel"
          defaultValue={initial?.brandLabel ?? ""}
          required
        />
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
          placeholder="Par level"
          name="parLevel"
          type="number"
          defaultValue={initial?.parLevel ?? 0}
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
