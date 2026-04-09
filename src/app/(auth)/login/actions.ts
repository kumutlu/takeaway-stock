"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = createSupabaseServerClient();
  const { error, data } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/sign-in?error=${encodeURIComponent("Invalid email or password")}`);
  }

  if (data.user?.email) {
    let existing = await prisma.user.findUnique({ where: { email: data.user.email } });
    if (!existing) {
      existing = await prisma.user.create({
        data: {
          id: data.user.id,
          email: data.user.email,
          role: "STAFF",
          isActive: false
        }
      });
    }

    if (!existing.isActive) {
      await supabase.auth.signOut();
      redirect(`/sign-in?message=${encodeURIComponent("Your account is pending admin approval.")}`);
    }
  }

  redirect("/dashboard");
}

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!password || password !== confirm) {
    redirect(`/sign-up?error=${encodeURIComponent("Passwords do not match")}`);
  }
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);
  }
  await prisma.user.upsert({
    where: { email },
    update: { isActive: false, role: "STAFF" },
    create: {
      email,
      role: "STAFF",
      isActive: false
    }
  });
  redirect(`/sign-in?message=${encodeURIComponent("Check your email to confirm your account.")}`);
}

export async function sendPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`
  });
  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/forgot-password?message=${encodeURIComponent("Password reset email sent.")}`);
}

export async function signInWithGoogle(formData: FormData) {
  void formData;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`
    }
  });

  if (error) {
    redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }

  return;
}
