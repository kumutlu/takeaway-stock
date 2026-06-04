"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function updateStockCount(params: {
  productId: string;
  newStock: number;
  userId?: string;
  notes?: string;
}) {
  const { appUser } = await requireUser();
  const product = await prisma.product.findFirst({
    where: { id: params.productId, projectId: appUser.projectId }
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id: params.productId },
      data: {
        currentStock: params.newStock,
        lastCountDate: new Date()
      }
    });

    await tx.stockMovement.create({
      data: {
        productId: params.productId,
        userId: appUser.id,
        type: "COUNT",
        quantity: params.newStock,
        previousStock: product.currentStock ?? 0,
        newStock: params.newStock,
        notes: params.notes
      }
    });

    return updated;
  });
}
