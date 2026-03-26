"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { MovementType } from "@prisma/client";

export async function createStockMovement(formData: FormData) {
  const { appUser } = await requireUser();

  const productId = String(formData.get("productId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);
  const type = String(formData.get("type") ?? "COUNT");
  const notes = String(formData.get("notes") ?? "");

  if (!productId || !Number.isFinite(quantity)) {
    throw new Error("Invalid input");
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");

  const previousStock = product.currentStock ?? 0;
  let newStock = previousStock;

  if (type === "COUNT") {
    newStock = quantity;
  } else if (type === "ADJUSTMENT") {
    newStock = previousStock + quantity;
  } else if (type === "RECEIVED") {
    newStock = previousStock + quantity;
  } else if (type === "WASTE") {
    newStock = Math.max(0, previousStock - quantity);
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: {
        currentStock: newStock,
        lastCountDate: type === "COUNT" ? new Date() : product.lastCountDate
      }
    });

    await tx.stockMovement.create({
      data: {
        productId,
        userId: appUser.id,
        type: type as MovementType,
        quantity,
        previousStock,
        newStock,
        notes
      }
    });
  });

  revalidatePath("/stock-updates");
  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");
}
