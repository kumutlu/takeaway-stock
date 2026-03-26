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

  const totalUsers = await prisma.user.count();
  if (totalUsers >= 4) {
    return { message: "Maximum 4 users allowed." };
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
