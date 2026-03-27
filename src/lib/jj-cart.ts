type JjOverride = {
  searchTerm: string;
  minQty?: number;
};

const JJ_OVERRIDES: Record<string, JjOverride> = {};
const ICS_OVERRIDES: Record<string, JjOverride> = {};

function normalizeName(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

export function resolveSupplierSearch(supplier: string, itemName: string) {
  const key = normalizeName(itemName);
  const supplierKey = supplier.trim().toLowerCase();
  const override =
    supplierKey === "jj"
      ? JJ_OVERRIDES[key]
      : supplierKey === "ics"
        ? ICS_OVERRIDES[key]
        : undefined;

  const defaultSearchTerm = itemName;
  if (override) {
    return {
      searchTerm: override.searchTerm,
      minQty: override.minQty ?? 1,
      isMapped: true
    };
  }

  return {
    searchTerm: defaultSearchTerm,
    minQty: 1,
    isMapped: false
  };
}
