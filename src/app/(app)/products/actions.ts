"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { parseBrandTags } from "@/lib/product-utils";
import { StorageType, ProductStatus, OptionalType, Weekday } from "@prisma/client";

const optionalInt = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().min(0).optional()
);

const productSchema = z.object({
  itemName: z.string().min(2),
  supplierName: z.string().min(2).optional(),
  brandLabel: z.string().min(2),
  storage: z.nativeEnum(StorageType),
  status: z.nativeEnum(ProductStatus),
  optionalNote: z.nativeEnum(OptionalType),
  orderDay: z.nativeEnum(Weekday).optional().or(z.literal("")),
  inventoryCheckDay: z.nativeEnum(Weekday).optional().or(z.literal("")),
  minimumOrder: z.coerce.number().int().min(0).optional(),
  parLevel: optionalInt,
  currentStock: z.coerce.number().int().min(0).optional(),
  unit: z.string().optional()
});

const supplierSchema = z.object({
  name: z.string().min(2)
});

async function upsertSupplierBrand(input: { projectId: string; supplierName: string; brandLabel: string }) {
  const supplier = await prisma.supplier.upsert({
    where: { projectId_name: { projectId: input.projectId, name: input.supplierName } },
    update: {},
    create: { projectId: input.projectId, name: input.supplierName }
  });
  const brand = await prisma.brand.upsert({
    where: { projectId_name: { projectId: input.projectId, name: input.brandLabel } },
    update: {},
    create: { projectId: input.projectId, name: input.brandLabel }
  });
  return { supplier, brand };
}

export async function createProduct(
  prevState: { message?: string; success?: boolean },
  formData: FormData
) {
  const { appUser } = await requireAdmin();

  const supplierNames = Array.from(
    new Set(
      formData
        .getAll("supplierNames")
        .map((value) => String(value).trim())
        .filter(Boolean)
    )
  );
  if (!supplierNames.length) {
    return { message: "Please add at least one supplier.", success: false };
  }

  const parsed = productSchema.safeParse({
    itemName: formData.get("itemName"),
    supplierName: supplierNames[0],
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
    return { message: "Please fill in required fields.", success: false };
  }

  const brand = await prisma.brand.upsert({
    where: { projectId_name: { projectId: appUser.projectId, name: parsed.data.brandLabel } },
    update: {},
    create: { projectId: appUser.projectId, name: parsed.data.brandLabel }
  });

  for (const supplierName of supplierNames) {
    const supplier = await prisma.supplier.upsert({
      where: { projectId_name: { projectId: appUser.projectId, name: supplierName } },
      update: {},
      create: { projectId: appUser.projectId, name: supplierName }
    });

    await prisma.product.create({
      data: {
        projectId: appUser.projectId,
        supplierId: supplier.id,
        supplierName,
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
        parLevel: parsed.data.parLevel ?? null,
        currentStock: parsed.data.currentStock ?? 0,
        unit: parsed.data.unit ?? null,
        isActive: parsed.data.status === "ACTIVE"
      }
    });
  }

  revalidatePath("/products");
  redirect(`/products?saved=1&count=${supplierNames.length}`);
}

export async function updateProduct(
  prevState: { message?: string },
  formData: FormData
) {
  const { appUser } = await requireAdmin();

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
    return { message: "Please fill in required fields." };
  }
  if (!parsed.data.supplierName) {
    return { message: "Supplier is required." };
  }

  const { supplier, brand } = await upsertSupplierBrand({
    projectId: appUser.projectId,
    supplierName: parsed.data.supplierName,
    brandLabel: parsed.data.brandLabel
  });

  await prisma.product.updateMany({
    where: { id, projectId: appUser.projectId },
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
      parLevel: parsed.data.parLevel ?? null,
      currentStock: parsed.data.currentStock ?? 0,
      unit: parsed.data.unit ?? null,
      isActive: parsed.data.status === "ACTIVE"
    }
  });

  const extraSupplierNames = Array.from(
    new Set(
      formData
        .getAll("extraSupplierNames")
        .map((value) => String(value).trim())
        .filter(Boolean)
    )
  ).filter((name) => name !== parsed.data.supplierName);

  for (const extraSupplierName of extraSupplierNames) {
    const existing = await prisma.product.findFirst({
      where: {
        projectId: appUser.projectId,
        itemName: parsed.data.itemName,
        supplierName: extraSupplierName
      }
    });
    if (existing) continue;

    const extraSupplier = await prisma.supplier.upsert({
      where: { projectId_name: { projectId: appUser.projectId, name: extraSupplierName } },
      update: {},
      create: { projectId: appUser.projectId, name: extraSupplierName }
    });

    await prisma.product.create({
      data: {
        projectId: appUser.projectId,
        supplierId: extraSupplier.id,
        supplierName: extraSupplierName,
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
        parLevel: parsed.data.parLevel ?? null,
        currentStock: parsed.data.currentStock ?? 0,
        unit: parsed.data.unit ?? null,
        isActive: parsed.data.status === "ACTIVE"
      }
    });
  }

  revalidatePath(`/products/${id}`);
  revalidatePath("/products");
  return {
    message:
      extraSupplierNames.length > 0
        ? `Product updated and added to ${extraSupplierNames.length} new supplier(s).`
        : "Product updated."
  };
}

export async function createSupplier(prevState: { message?: string }, formData: FormData) {
  const { appUser } = await requireAdmin();
  const parsed = supplierSchema.safeParse({
    name: formData.get("name")
  });

  if (!parsed.success) {
    return { message: "Supplier name is required." };
  }

  await prisma.supplier.upsert({
    where: { projectId_name: { projectId: appUser.projectId, name: parsed.data.name.trim() } },
    update: {},
    create: { projectId: appUser.projectId, name: parsed.data.name.trim() }
  });

  revalidatePath("/products");
  revalidatePath("/products/suppliers");
  return { message: "Supplier saved." };
}

export async function deleteSupplier(formData: FormData) {
  const { appUser } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const hasProducts = await prisma.product.count({ where: { supplierId: id, projectId: appUser.projectId } });
  if (hasProducts > 0) return;

  await prisma.supplier.deleteMany({ where: { id, projectId: appUser.projectId } });
  revalidatePath("/products");
  revalidatePath("/products/suppliers");
}

export async function deleteProduct(formData: FormData) {
  const { appUser } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const product = await prisma.product.findFirst({ where: { id, projectId: appUser.projectId }, select: { id: true } });
  if (!product) return;
  await prisma.orderNeed.deleteMany({ where: { productId: product.id } });
  await prisma.stockMovement.deleteMany({ where: { productId: product.id } });
  await prisma.inventoryCheck.deleteMany({ where: { productId: product.id } });
  await prisma.orderSuggestion.deleteMany({ where: { productId: product.id } });
  await prisma.product.delete({ where: { id: product.id } });

  revalidatePath("/products");
  revalidatePath("/order-needs");
  revalidatePath("/orders");
  redirect("/products");
}

export async function deleteProductInline(formData: FormData) {
  const { appUser } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const product = await prisma.product.findFirst({ where: { id, projectId: appUser.projectId }, select: { id: true } });
  if (!product) return;
  await prisma.orderNeed.deleteMany({ where: { productId: product.id } });
  await prisma.stockMovement.deleteMany({ where: { productId: product.id } });
  await prisma.inventoryCheck.deleteMany({ where: { productId: product.id } });
  await prisma.orderSuggestion.deleteMany({ where: { productId: product.id } });
  await prisma.product.delete({ where: { id: product.id } });

  revalidatePath("/products");
  revalidatePath("/order-needs");
  revalidatePath("/orders");
}
