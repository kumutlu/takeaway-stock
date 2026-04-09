"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
  const { appUser } = await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  if (!userId) redirect("/users?error=Invalid+user");
  if (userId === appUser.id) redirect("/users?error=You+cannot+remove+your+own+account");

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) redirect("/users?error=User+not+found");

    await prisma.$transaction([
      prisma.stockMovement.updateMany({
        where: { userId },
        data: { userId: null }
      }),
      prisma.orderNeed.updateMany({
        where: { userId },
        data: { userId: null }
      }),
      prisma.pushSubscription.updateMany({
        where: { userId },
        data: { userId: null }
      }),
      prisma.auditLog.updateMany({
        where: { userId },
        data: { userId: null }
      }),
      prisma.user.delete({ where: { id: userId } })
    ]);

    const supabaseAdmin = createSupabaseAdminClient();
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => null);

    revalidatePath("/users");
    redirect("/users?message=User+removed");
  } catch {
    redirect("/users?error=Could+not+remove+user");
  }
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
