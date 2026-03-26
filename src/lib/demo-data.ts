export const demoStats = {
  totalProducts: 312,
  brandCounts: {
    "Wrap'n Bowl": 180,
    "Eugreeka!": 72,
    "LEB+NOM": 60
  },
  storageCounts: {
    Ambient: 142,
    Fridge: 96,
    Frozen: 48,
    "Frozen-Defrost": 26
  },
  lowStock: 18,
  criticalStock: 6,
  orderRequired: 12,
  checksToday: 9
};

export const demoProducts = [
  {
    id: "p-001",
    itemName: "Tahini",
    brand: "LEB+NOM",
    supplier: "Mediterranean Supplies",
    storage: "Ambient",
    status: "Active",
    optional: "CORE",
    orderDay: "Monday",
    currentStock: 6,
    parLevel: 12,
    unit: "kg"
  },
  {
    id: "p-002",
    itemName: "Halloumi",
    brand: "Eugreeka!",
    supplier: "Fresh Dairy Co",
    storage: "Fridge",
    status: "Active",
    optional: "CORE",
    orderDay: "Wednesday",
    currentStock: 4,
    parLevel: 10,
    unit: "packs"
  },
  {
    id: "p-003",
    itemName: "Pita Bread",
    brand: "Wrap'n Bowl",
    supplier: "Bakery House",
    storage: "Frozen-Defrost",
    status: "Active",
    optional: "OPTIONAL",
    orderDay: "Friday",
    currentStock: 3,
    parLevel: 8,
    unit: "bags"
  }
];

export const demoMovements = [
  {
    id: "m-101",
    type: "COUNT",
    quantity: 10,
    actor: "Admin",
    date: "2026-03-14"
  },
  {
    id: "m-102",
    type: "RECEIVED",
    quantity: 8,
    actor: "Staff",
    date: "2026-03-13"
  }
];
