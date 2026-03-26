"use server";

import { prisma } from "@/lib/db";

export async function updateStockCount(params: {
  productId: string;
  newStock: number;
  userId?: string;
  notes?: string;
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.productId }
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
        userId: params.userId,
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
