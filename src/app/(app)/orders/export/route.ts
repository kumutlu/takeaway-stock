import { NextResponse } from "next/server";
import { getOrderSuggestions, getTodayWeekday } from "@/lib/order-utils";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const { appUser } = await requireUser();
  const suggestions = await getOrderSuggestions(appUser.projectId, getTodayWeekday());
  const lines = ["Supplier,Brand,Item,SuggestedQty,Unit"];

  for (const item of suggestions) {
    const suggestedQty = Math.max(0, (item.parLevel ?? 0) - (item.currentStock ?? 0));
    lines.push(
      [
        item.supplierName,
        item.brandLabel,
        item.itemName,
        suggestedQty.toString(),
        item.unit ?? ""
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    );
  }

  const csv = lines.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=order-suggestions.csv"
    }
  });
}
