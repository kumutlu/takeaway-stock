"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  lowStockThreshold: z.enum(["PAR_LEVEL", "MINIMUM_ORDER"]),
  criticalPercent: z.coerce.number().int().min(10).max(90)
});

export async function updateSettings(prevState: { message?: string }, formData: FormData) {
  await requireAdmin();

  const parsed = schema.safeParse({
    lowStockThreshold: formData.get("lowStockThreshold"),
    criticalPercent: formData.get("criticalPercent")
  });

  if (!parsed.success) {
    return { message: "Please enter valid values." };
  }

  await prisma.appSetting.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data }
  });

  revalidatePath("/settings");
  return { message: "Saved." };
}
