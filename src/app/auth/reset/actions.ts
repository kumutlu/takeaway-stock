"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!password || password !== confirm) {
    redirect(`/auth/reset?error=${encodeURIComponent("Passwords do not match")}`);
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/auth/reset?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/sign-in?message=${encodeURIComponent("Password updated. Please sign in.")}`);
}
