type JjOverride = {
  searchTerm: string;
  minQty?: number;
};

const JJ_OVERRIDES: Record<string, JjOverride> = {};

function normalizeName(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

export function resolveJjSearch(itemName: string) {
  const key = normalizeName(itemName);
  const override = JJ_OVERRIDES[key];
  if (override) {
    return {
      searchTerm: override.searchTerm,
      minQty: override.minQty ?? 1,
      isMapped: true
    };
  }

  return {
    searchTerm: itemName,
    minQty: 1,
    isMapped: false
  };
}
