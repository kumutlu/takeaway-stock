import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await request.json();

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      userId: data.user.id,
      p256dh: subscription.keys?.p256dh ?? "",
      auth: subscription.keys?.auth ?? ""
    },
    create: {
      userId: data.user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys?.p256dh ?? "",
      auth: subscription.keys?.auth ?? ""
    }
  });

  return NextResponse.json({ ok: true });
}
