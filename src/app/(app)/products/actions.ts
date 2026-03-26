"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { parseBrandTags } from "@/lib/product-utils";
import { StorageType, ProductStatus, OptionalType, Weekday } from "@prisma/client";

const productSchema = z.object({
  itemName: z.string().min(2),
  supplierName: z.string().min(2),
  brandLabel: z.string().min(2),
  storage: z.nativeEnum(StorageType),
  status: z.nativeEnum(ProductStatus),
  optionalNote: z.nativeEnum(OptionalType),
  orderDay: z.nativeEnum(Weekday).optional().or(z.literal("")),
  inventoryCheckDay: z.nativeEnum(Weekday).optional().or(z.literal("")),
  minimumOrder: z.coerce.number().int().min(0).optional(),
  parLevel: z.coerce.number().int().min(0).optional(),
  currentStock: z.coerce.number().int().min(0).optional(),
  unit: z.string().optional()
});

async function upsertSupplierBrand(input: { supplierName: string; brandLabel: string }) {
  const supplier = await prisma.supplier.upsert({
    where: { name: input.supplierName },
    update: {},
    create: { name: input.supplierName }
  });
  const brand = await prisma.brand.upsert({
    where: { name: input.brandLabel },
    update: {},
    create: { name: input.brandLabel }
  });
  return { supplier, brand };
}

export async function createProduct(prevState: { message?: string }, formData: FormData) {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    itemName: formData.get("itemName"),
    supplierName: formData.get("supplierName"),
    brandLabel: formData.get("brandLabel"),
    storage: formData.get("storage"),
    status: formData.get("status"),
    optionalNote: formData.get("optionalNote"),
    orderDay: formData.get("orderDay") ?? "",
    inventoryCheckDay: formData.get("inventoryCheckDay") ?? "",
    minimumOrder: formData.get("minimumOrder"),
    parLevel: formData.get("parLevel"),
    currentStock: formData.get("currentStock"),
    unit: formData.get("unit")
  });

  if (!parsed.success) {
    return { message: "Lutfen zorunlu alanlari doldurun." };
  }

  const { supplier, brand } = await upsertSupplierBrand({
    supplierName: parsed.data.supplierName,
    brandLabel: parsed.data.brandLabel
  });

  await prisma.product.create({
    data: {
      supplierId: supplier.id,
      supplierName: parsed.data.supplierName,
      brandId: brand.id,
      brandLabel: parsed.data.brandLabel,
      brandTags: parseBrandTags(parsed.data.brandLabel),
      itemName: parsed.data.itemName,
      storage: parsed.data.storage,
      status: parsed.data.status,
      optionalNote: parsed.data.optionalNote,
      orderDay: parsed.data.orderDay ? (parsed.data.orderDay as Weekday) : null,
      inventoryCheckDay: parsed.data.inventoryCheckDay
        ? (parsed.data.inventoryCheckDay as Weekday)
        : null,
      minimumOrder: parsed.data.minimumOrder ?? 0,
      parLevel: parsed.data.parLevel ?? 0,
      currentStock: parsed.data.currentStock ?? 0,
      unit: parsed.data.unit ?? null,
      isActive: parsed.data.status === "ACTIVE"
    }
  });

  revalidatePath("/products");
  return { message: "Product added." };
}

export async function updateProduct(
  prevState: { message?: string },
  formData: FormData
) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { message: "Product not found." };

  const parsed = productSchema.safeParse({
    itemName: formData.get("itemName"),
    supplierName: formData.get("supplierName"),
    brandLabel: formData.get("brandLabel"),
    storage: formData.get("storage"),
    status: formData.get("status"),
    optionalNote: formData.get("optionalNote"),
    orderDay: formData.get("orderDay") ?? "",
    inventoryCheckDay: formData.get("inventoryCheckDay") ?? "",
    minimumOrder: formData.get("minimumOrder"),
    parLevel: formData.get("parLevel"),
    currentStock: formData.get("currentStock"),
    unit: formData.get("unit")
  });

  if (!parsed.success) {
    return { message: "Lutfen zorunlu alanlari doldurun." };
  }

  const { supplier, brand } = await upsertSupplierBrand({
    supplierName: parsed.data.supplierName,
    brandLabel: parsed.data.brandLabel
  });

  await prisma.product.update({
    where: { id },
    data: {
      supplierId: supplier.id,
      supplierName: parsed.data.supplierName,
      brandId: brand.id,
      brandLabel: parsed.data.brandLabel,
      brandTags: parseBrandTags(parsed.data.brandLabel),
      itemName: parsed.data.itemName,
      storage: parsed.data.storage,
      status: parsed.data.status,
      optionalNote: parsed.data.optionalNote,
      orderDay: parsed.data.orderDay ? (parsed.data.orderDay as Weekday) : null,
      inventoryCheckDay: parsed.data.inventoryCheckDay
        ? (parsed.data.inventoryCheckDay as Weekday)
        : null,
      minimumOrder: parsed.data.minimumOrder ?? 0,
      parLevel: parsed.data.parLevel ?? 0,
      currentStock: parsed.data.currentStock ?? 0,
      unit: parsed.data.unit ?? null,
      isActive: parsed.data.status === "ACTIVE"
    }
  });

  revalidatePath(`/products/${id}`);
  revalidatePath("/products");
  return { message: "Product updated." };
}
