import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/sign-in");
  }

  const email = data.user.email ?? "";
  if (!email) {
    redirect("/sign-in");
  }

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: data.user.id,
        email,
        role: "STAFF",
        isActive: false
      }
    });
  }

  if (!user.isActive) {
    await supabase.auth.signOut();
    redirect("/sign-in?message=Your account is pending admin approval.");
  }

  return { authUser: data.user, appUser: user };
}

export async function requireAdmin() {
  const result = await requireUser();
  if (result.appUser.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return result;
}
