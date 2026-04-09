"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function createUser(prevState: { message?: string }, formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "STAFF").toUpperCase();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    return { message: "Email and password are required." };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    return { message: error.message };
  }

  if (data.user) {
    await prisma.user.upsert({
      where: { email },
      update: { role: role === "ADMIN" ? "ADMIN" : "STAFF", isActive: true },
      create: {
        id: data.user.id,
        email,
        role: role === "ADMIN" ? "ADMIN" : "STAFF",
        isActive: true
      }
    });
  }

  revalidatePath("/users");
  return { message: "User created." };
}

export async function toggleUserActive(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const isActive = String(formData.get("isActive") ?? "false") === "true";

  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !isActive }
  });

  revalidatePath("/users");
}

export async function blockUser(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false }
  });

  revalidatePath("/users");
}

export async function removeUser(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  await prisma.stockMovement.updateMany({
    where: { userId },
    data: { userId: null }
  });
  await prisma.orderNeed.updateMany({
    where: { userId },
    data: { userId: null }
  });
  await prisma.pushSubscription.updateMany({
    where: { userId },
    data: { userId: null }
  });
  await prisma.auditLog.updateMany({
    where: { userId },
    data: { userId: null }
  });

  await prisma.user.delete({ where: { id: userId } });

  const supabaseAdmin = createSupabaseAdminClient();
  await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => null);

  revalidatePath("/users");
}

export async function approveUser(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: true }
  });

  revalidatePath("/users");
}

export async function updateUserRole(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "STAFF").toUpperCase();
  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: { role: role === "ADMIN" ? "ADMIN" : "STAFF" }
  });

  revalidatePath("/users");
}
