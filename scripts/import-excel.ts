import fs from "node:fs";
import path from "node:path";
import xlsx from "xlsx";
import { PrismaClient, StorageType, ProductStatus, OptionalType, Weekday } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_FILE = "/Users/kemal/Downloads/Wrapn BowlStock list 2026.xlsx";

const columnMap = {
  supplierId: "Supplier ID",
  supplierName: "Supplier",
  brands: "Brands",
  itemName: "Item Name",
  storage: "Storage",
  status: "Status",
  optionalNote: "Optional ?",
  orderDay: "Order Days",
  inventoryCheckDay: "Inventory Checks",
  minimumOrder: "Minimum Order"
};

function normalizeStorage(value: string): StorageType {
  const normalized = value.toLowerCase().replace(/\s+/g, "-").trim();
  if (normalized.includes("frozen") && normalized.includes("defrost")) return "FROZEN_DEFROST";
  if (normalized.includes("frozen")) return "FROZEN";
  if (normalized.includes("fridge")) return "FRIDGE";
  return "AMBIENT";
}

function normalizeStatus(value: string): ProductStatus {
  const normalized = value.toLowerCase();
  if (normalized.includes("inactive") || normalized.includes("discontinued")) return "INACTIVE";
  return "ACTIVE";
}

function normalizeOptional(statusValue: string, optionalValue: string): OptionalType {
  const status = statusValue.toLowerCase();
  if (status.includes("non core") || status.includes("non-core")) return "OPTIONAL";
  const optional = optionalValue.toLowerCase();
  if (optional.includes("optional")) return "OPTIONAL";
  return "CORE";
}

const weekdayMap: Record<string, Weekday> = {
  monday: "MONDAY",
  tuesday: "TUESDAY",
  wednesday: "WEDNESDAY",
  thursday: "THURSDAY",
  friday: "FRIDAY",
  saturday: "SATURDAY",
  sunday: "SUNDAY"
};

function normalizeWeekday(value: string | undefined | null): Weekday | null {
  if (!value) return null;
  const parts = value
    .split(",")
    .map((part) => part.toLowerCase().trim())
    .filter(Boolean);
  for (const part of parts) {
    if (weekdayMap[part]) return weekdayMap[part];
  }
  return null;
}

function parseBrands(value: string): { label: string; tags: string[] } {
  const label = value?.trim() || "Unknown";
  const tags = label
    .split(/\||,|\//)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return { label, tags: tags.length ? tags : [label] };
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function buildProductId(supplierIdRaw: string, itemName: string) {
  const safeSupplier = supplierIdRaw ? toSlug(supplierIdRaw) : "supplier";
  return `${safeSupplier}-${toSlug(itemName)}`;
}

async function main() {
  const filePath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_FILE;

  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel file not found at ${filePath}`);
  }

  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("No sheets found in Excel file");

  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json<Record<string, string | number>>(sheet, {
    defval: ""
  });

  for (const row of rows) {
    const supplierIdRaw = String(row[columnMap.supplierId] ?? "").trim();
    const supplierName = String(row[columnMap.supplierName] ?? "Unknown Supplier").trim();
    const itemName = String(row[columnMap.itemName] ?? "").trim();
    if (!itemName) continue;

    const { label: brandLabel, tags: brandTags } = parseBrands(String(row[columnMap.brands] ?? "Unknown"));
    const storage = normalizeStorage(String(row[columnMap.storage] ?? ""));
    const status = normalizeStatus(String(row[columnMap.status] ?? ""));
    const optionalNote = normalizeOptional(
      String(row[columnMap.status] ?? ""),
      String(row[columnMap.optionalNote] ?? "")
    );
    let orderDay = normalizeWeekday(String(row[columnMap.orderDay] ?? ""));
    const inventoryCheckDay = normalizeWeekday(String(row[columnMap.inventoryCheckDay] ?? ""));
    const minimumOrder = Number(row[columnMap.minimumOrder] ?? 0);

    if (["ICS", "JJ"].includes(supplierName.toUpperCase())) {
      orderDay = "TUESDAY";
    }

    const supplier = await prisma.supplier.upsert({
      where: { name: supplierName },
      update: {},
      create: { name: supplierName }
    });

    const brand = await prisma.brand.upsert({
      where: { name: brandLabel },
      update: {},
      create: { name: brandLabel }
    });

    const productId = buildProductId(supplierIdRaw, itemName);

    await prisma.product.upsert({
      where: {
        id: productId
      },
      update: {
        supplierId: supplier.id,
        supplierName,
        brandId: brand.id,
        brandLabel,
        brandTags,
        itemName,
        storage,
        status,
        optionalNote,
        orderDay: orderDay ?? undefined,
        inventoryCheckDay: inventoryCheckDay ?? undefined,
        minimumOrder: Number.isFinite(minimumOrder) ? minimumOrder : undefined
      },
      create: {
        id: productId,
        supplierId: supplier.id,
        supplierName,
        brandId: brand.id,
        brandLabel,
        brandTags,
        itemName,
        storage,
        status,
        optionalNote,
        orderDay: orderDay ?? undefined,
        inventoryCheckDay: inventoryCheckDay ?? undefined,
        minimumOrder: Number.isFinite(minimumOrder) ? minimumOrder : undefined,
        currentStock: 0,
        parLevel: 0,
        isActive: status === "ACTIVE"
      }
    });
  }

  console.log("Import complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
