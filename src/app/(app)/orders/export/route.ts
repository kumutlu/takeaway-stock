import { NextResponse } from "next/server";
import { getOrderSuggestions, getTodayWeekday } from "@/lib/order-utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_SITE_URL));
  }

  const suggestions = await getOrderSuggestions(getTodayWeekday());
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
