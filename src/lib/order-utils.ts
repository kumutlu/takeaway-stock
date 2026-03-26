import { prisma } from "@/lib/db";
import { Weekday } from "@prisma/client";

const weekdayMap: Weekday[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY"
];

export function getTodayWeekday(date = new Date()): Weekday {
  return weekdayMap[date.getDay()];
}

export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}

export async function getOrderSuggestions(forDay?: Weekday) {
  const day = forDay ?? getTodayWeekday();
  const settings = await prisma.appSetting.findUnique({ where: { id: 1 } });
  const useMinimumOrder = settings?.lowStockThreshold === "MINIMUM_ORDER";

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      orderDay: day
    },
    orderBy: { supplierName: "asc" }
  });

  return products.filter((product) => {
    const current = product.currentStock ?? 0;
    if (useMinimumOrder) {
      return current < (product.minimumOrder ?? 0);
    }
    return current < (product.parLevel ?? 0);
  });
}

export async function getOrderNeedsForWeek(weekStart: Date) {
  return prisma.orderNeed.findMany({
    where: { weekStart, done: false },
    include: { product: true, user: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function getPendingOrderNeeds(weekStart: Date) {
  const needs = await prisma.orderNeed.findMany({
    where: { weekStart, done: false },
    include: { product: true }
  });
  return needs;
}
