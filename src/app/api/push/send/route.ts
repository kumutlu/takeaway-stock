import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendPushNotification } from "@/lib/push";
import { getWeekStart, getTodayWeekday } from "@/lib/order-utils";

const NEEDS_WINDOW = new Set(["SUNDAY", "MONDAY", "TUESDAY"]);

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const headerSecret = request.headers.get("x-cron-secret");
  let requestedProjectId: string | undefined;

  if (!cronSecret || headerSecret !== cronSecret) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const appUser = await prisma.user.findFirst({
      where: { id: data.user.id, isActive: true },
      select: { projectId: true }
    });
    if (!appUser) {
      return NextResponse.json({ error: "Project access required" }, { status: 403 });
    }
    requestedProjectId = appUser.projectId;
  }

  const today = getTodayWeekday();
  if (!NEEDS_WINDOW.has(today)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const weekStart = getWeekStart();
  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      user: {
        isActive: true,
        ...(requestedProjectId ? { projectId: requestedProjectId } : {}),
        project: {
          products: {
            some: {
              orderNeeds: { some: { weekStart, done: false } }
            }
          }
        }
      }
    }
  });
  if (subscriptions.length === 0) {
    return NextResponse.json({ ok: true, skipped: true });
  }
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
