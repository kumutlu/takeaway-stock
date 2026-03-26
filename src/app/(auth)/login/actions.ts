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
    redirect(`/login?error=${encodeURIComponent("Invalid email or password")}`);
  }

  if (data.user?.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.user.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          id: data.user.id,
          email: data.user.email,
          role: "STAFF",
          isActive: true
        }
      });
    }
  }

  redirect("/dashboard");
}

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/login?message=${encodeURIComponent("Check your email to confirm your account.")}`);
}

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`
    }
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/login?message=${encodeURIComponent("Magic link sent. Check your email.")}`);
}

export async function sendPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`
  });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/login?message=${encodeURIComponent("Password reset email sent.")}`);
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
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }

  return;
}
