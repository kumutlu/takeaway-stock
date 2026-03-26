import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendPushNotification } from "@/lib/push";
import { getWeekStart, getTodayWeekday } from "@/lib/order-utils";

const NEEDS_WINDOW = new Set(["SUNDAY", "MONDAY", "TUESDAY"]);

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const headerSecret = request.headers.get("x-cron-secret");

  if (!cronSecret || headerSecret !== cronSecret) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const today = getTodayWeekday();
  if (!NEEDS_WINDOW.has(today)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const weekStart = getWeekStart();
  const pendingNeeds = await prisma.orderNeed.count({
    where: { weekStart, done: false }
  });

  if (pendingNeeds === 0) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const subscriptions = await prisma.pushSubscription.findMany();
  const payload = {
    title: "Order needs pending",
    body: "Please log required quantities by Tuesday.",
    url: "/dashboard"
  };

  await Promise.all(
    subscriptions.map((sub) =>
      sendPushNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        },
        payload
      ).catch(async () => {
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      })
    )
  );

  return NextResponse.json({ ok: true, sent: subscriptions.length });
}
