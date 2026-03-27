"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getWeekStart } from "@/lib/order-utils";
import { resolveJjSearch } from "@/lib/jj-cart";

const createSchema = z.object({
  productId: z.string().min(1),
  neededQty: z.coerce.number().int().min(1),
  notes: z.string().optional()
});

const idSchema = z.object({
  productId: z.string().min(1)
});

const qtySchema = z.object({
  productId: z.string().min(1),
  neededQty: z.coerce.number().int().min(0)
});

export async function createOrderNeed(prevState: { message?: string }, formData: FormData) {
  const { appUser } = await requireUser();

  const parsed = createSchema.safeParse({
    productId: formData.get("productId"),
    neededQty: formData.get("neededQty"),
    notes: formData.get("notes")
  });

  if (!parsed.success) {
    return { message: "Please enter a valid quantity." };
  }

  const weekStart = getWeekStart();

  await prisma.orderNeed.create({
    data: {
      productId: parsed.data.productId,
      userId: appUser.id,
      weekStart,
      neededQty: parsed.data.neededQty,
      notes: parsed.data.notes ?? null
    }
  });

  revalidatePath("/order-needs");
  revalidatePath("/orders");
  revalidatePath(`/products/${parsed.data.productId}`);
  revalidatePath("/dashboard");
  return { message: "Saved." };
}

export async function incrementOrderNeed(formData: FormData) {
  const { appUser } = await requireUser();
  const parsed = idSchema.safeParse({
    productId: formData.get("productId")
  });
  if (!parsed.success) return;

  const weekStart = getWeekStart();
  const existing = await prisma.orderNeed.findFirst({
    where: { productId: parsed.data.productId, weekStart }
  });

  if (!existing) {
    await prisma.orderNeed.create({
      data: {
        productId: parsed.data.productId,
        userId: appUser.id,
        weekStart,
        neededQty: 1
      }
    });
  } else {
    await prisma.orderNeed.update({
      where: { id: existing.id },
      data: { neededQty: { increment: 1 }, userId: appUser.id }
    });
  }

  revalidatePath("/order-needs");
  revalidatePath("/orders");
  revalidatePath("/dashboard");
}

export async function setOrderNeedQty(formData: FormData) {
  const { appUser } = await requireUser();
  const parsed = qtySchema.safeParse({
    productId: formData.get("productId"),
    neededQty: formData.get("neededQty")
  });
  if (!parsed.success) return;

  const weekStart = getWeekStart();
  const existing = await prisma.orderNeed.findFirst({
    where: { productId: parsed.data.productId, weekStart }
  });

  if (parsed.data.neededQty <= 0) {
    if (existing) {
      await prisma.orderNeed.delete({ where: { id: existing.id } });
    }
  } else if (!existing) {
    await prisma.orderNeed.create({
      data: {
        productId: parsed.data.productId,
        userId: appUser.id,
        weekStart,
        neededQty: parsed.data.neededQty
      }
    });
  } else {
    await prisma.orderNeed.update({
      where: { id: existing.id },
      data: { neededQty: parsed.data.neededQty, userId: appUser.id }
    });
  }

  revalidatePath("/order-needs");
  revalidatePath("/orders");
  revalidatePath("/dashboard");
}

export async function removeOrderNeed(formData: FormData) {
  await requireUser();
  const parsed = idSchema.safeParse({
    productId: formData.get("productId")
  });
  if (!parsed.success) return;

  const weekStart = getWeekStart();
  await prisma.orderNeed.deleteMany({
    where: { productId: parsed.data.productId, weekStart }
  });

  revalidatePath("/order-needs");
  revalidatePath("/orders");
  revalidatePath("/dashboard");
}

export async function markOrderNeedDone(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.orderNeed.delete({ where: { id } });

  revalidatePath("/orders");
  revalidatePath("/order-needs");
  revalidatePath("/dashboard");
}

export async function markSupplierDone(formData: FormData) {
  await requireUser();
  const supplierName = String(formData.get("supplier") ?? "");
  if (!supplierName) return;

  const weekStart = getWeekStart();
  await prisma.orderNeed.deleteMany({
    where: {
      weekStart,
      product: { supplierName }
    }
  });

  revalidatePath("/orders");
  revalidatePath("/order-needs");
  revalidatePath("/dashboard");
}

export async function prepareJjCart(formData: FormData) {
  const { appUser } = await requireUser();
  if (appUser.role !== "ADMIN") {
    return {
      ok: false,
      message: "Only admin users can run JJ cart preparation."
    };
  }

  const supplierName = String(formData.get("supplier") ?? "");
  if (supplierName.trim().toLowerCase() !== "jj") {
    return {
      ok: false,
      message: "This action is only available for JJ."
    };
  }

  const weekStart = getWeekStart();
  const needs = await prisma.orderNeed.findMany({
    where: {
      weekStart,
      done: false,
      product: { supplierName: "JJ" }
    },
    include: { product: true },
    orderBy: { createdAt: "desc" }
  });

  const lines = needs.slice(0, 15).map((need) => {
    const match = resolveJjSearch(need.product.itemName);
    return {
      productId: need.productId,
      name: need.product.itemName,
      neededQty: need.neededQty,
      searchTerm: match.searchTerm,
      suggestedQty: Math.max(need.neededQty, match.minQty),
      isMapped: match.isMapped,
      searchUrl: `https://www.jjfoodservice.com/search?q=${encodeURIComponent(match.searchTerm)}`
    };
  });

  const mappedCount = lines.filter((line) => line.isMapped).length;

  return {
    ok: true,
    message: `Prepared ${lines.length} JJ items (${mappedCount} mapped, ${lines.length - mappedCount} review needed).`,
    lines,
    preparedAt: new Date().toISOString()
  };
}
