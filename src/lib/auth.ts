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

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      id: data.user.id,
      email,
      role: "STAFF",
      isActive: true
    }
  });

  if (!user.isActive) {
    redirect("/sign-in");
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
