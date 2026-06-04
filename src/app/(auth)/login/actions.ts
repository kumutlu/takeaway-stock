"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { createProject, normalizeProjectCode } from "@/lib/projects";

function mapAuthError(message: string) {
  const text = message.toLowerCase();
  if (text.includes("already registered") || text.includes("already been registered")) {
    return "This email is already registered. Please sign in or reset your password.";
  }
  if (text.includes("invalid email")) {
    return "Please enter a valid email address.";
  }
  if (text.includes("password")) {
    return "Password is too weak. Use at least 6 characters.";
  }
  return "We could not create your account right now. Please try again.";
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = createSupabaseServerClient();
  const { error, data } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/sign-in?error=${encodeURIComponent("Invalid email or password")}`);
  }

  if (data.user?.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.user.email } });
    if (!existing) redirect("/join-project");

    if (!existing.isActive) {
      await supabase.auth.signOut();
      redirect(`/sign-in?message=${encodeURIComponent("Your account is pending admin approval.")}`);
    }
  }

  redirect("/dashboard");
}

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const projectMode = String(formData.get("projectMode") ?? "JOIN");
  const projectName = String(formData.get("projectName") ?? "").trim();
  const projectCode = normalizeProjectCode(String(formData.get("projectCode") ?? ""));
  if (!email || !password) {
    redirect(`/sign-up?error=${encodeURIComponent("Email and password are required.")}`);
  }
  if (!password || password !== confirm) {
    redirect(`/sign-up?error=${encodeURIComponent("Passwords do not match")}`);
  }
  if (projectMode === "CREATE" && projectName.length < 2) {
    redirect(`/sign-up?error=${encodeURIComponent("Please enter your business or project name.")}`);
  }
  if (projectMode !== "CREATE" && !projectCode) {
    redirect(`/sign-up?error=${encodeURIComponent("Please enter the project number you were given.")}`);
  }

  const existingAppUser = await prisma.user.findUnique({ where: { email } });
  if (existingAppUser) {
    redirect(`/sign-up?error=${encodeURIComponent("This email already belongs to an account. Please sign in.")}`);
  }

  const joiningProject =
    projectMode === "CREATE"
      ? null
      : await prisma.project.findUnique({ where: { code: projectCode } });
  if (projectMode !== "CREATE" && !joiningProject) {
    redirect(`/sign-up?error=${encodeURIComponent("Project number not found. Check it and try again.")}`);
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    redirect(`/sign-up?error=${encodeURIComponent(mapAuthError(error.message))}`);
  }
  if (!data.user) {
    redirect(`/sign-up?error=${encodeURIComponent("Account could not be created. Please try again.")}`);
  }

  let createdProjectCode = "";
  try {
    const project = joiningProject ?? (await createProject(projectName));
    createdProjectCode = joiningProject ? "" : project.code;
    await prisma.user.create({
      data: {
        id: data.user.id,
        email,
        projectId: project.id,
        role: joiningProject ? "STAFF" : "ADMIN",
        isActive: !joiningProject
      }
    });
  } catch {
    redirect(
      `/sign-up?error=${encodeURIComponent("Account could not be created. Please try again in a moment.")}`
    );
  }
  const message =
    projectMode === "CREATE"
      ? `Project created. Your project number is ${createdProjectCode}. Keep it safe and share it with your team. Check your email to confirm your account.`
      : "Account created. Check your email, then wait for a project admin to approve access.";
  redirect(`/sign-in?message=${encodeURIComponent(message)}`);
}

export async function joinProjectAfterOAuth(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.trim().toLowerCase();
  if (!data.user || !email) redirect("/sign-in");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) redirect("/dashboard");

  const projectMode = String(formData.get("projectMode") ?? "JOIN");
  const projectName = String(formData.get("projectName") ?? "").trim();
  const projectCode = normalizeProjectCode(String(formData.get("projectCode") ?? ""));

  if (projectMode === "CREATE") {
    if (projectName.length < 2) {
      redirect(`/join-project?error=${encodeURIComponent("Please enter your business or project name.")}`);
    }
    const project = await createProject(projectName);
    await prisma.user.create({
      data: { id: data.user.id, email, projectId: project.id, role: "ADMIN", isActive: true }
    });
    redirect("/dashboard");
  }

  const project = await prisma.project.findUnique({ where: { code: projectCode } });
  if (!project) {
    redirect(`/join-project?error=${encodeURIComponent("Project number not found. Check it and try again.")}`);
  }

  await prisma.user.create({
    data: { id: data.user.id, email, projectId: project.id, role: "STAFF", isActive: false }
  });
  await supabase.auth.signOut();
  redirect(`/sign-in?message=${encodeURIComponent("Request sent. A project admin must approve your access.")}`);
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
