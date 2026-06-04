import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const appUser = await prisma.user.findFirst({
    where: { id: data.user.id, isActive: true },
    select: { id: true }
  });
  if (!appUser) {
    return NextResponse.json({ error: "Project access required" }, { status: 403 });
  }

  const subscription = await request.json();

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      userId: appUser.id,
      p256dh: subscription.keys?.p256dh ?? "",
      auth: subscription.keys?.auth ?? ""
    },
    create: {
      userId: appUser.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys?.p256dh ?? "",
      auth: subscription.keys?.auth ?? ""
    }
  });

  return NextResponse.json({ ok: true });
}
