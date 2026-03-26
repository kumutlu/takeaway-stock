import type { Route } from "next";
import Link from "next/link";
import { Package, LayoutGrid, ClipboardList, Settings, Layers } from "lucide-react";
import UserMenu from "@/components/user-menu";

const navItems: { href: Route; label: string; icon: typeof LayoutGrid }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/products", label: "Products", icon: Package },
  { href: "/order-needs", label: "Order Needs", icon: ClipboardList },
  { href: "/orders", label: "Orders", icon: Layers },
  { href: "/settings", label: "Settings", icon: Settings }
];

export default function AppShell({
  children,
  role
}: {
  children: React.ReactNode;
  role: "ADMIN" | "STAFF";
}) {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-ink-100 bg-white/80 p-6 backdrop-blur-xl lg:flex">
          <Link
            href="/dashboard"
            className="rounded-2xl border border-white/40 bg-ink-900/95 px-4 py-3 text-white shadow-soft transition hover:-translate-y-[1px]"
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-ink-200">Wrap'n Bowl</p>
            <p className="mt-2 font-[var(--font-display)] text-2xl">Stock Hub</p>
          </Link>
          <nav className="mt-8 flex flex-1 flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-ink-700 transition hover:bg-white/80 hover:shadow-ring"
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-ink-100 bg-white/80 px-4 py-4 backdrop-blur-xl md:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs tracking-[0.2em] text-ink-400">Live Stock</p>
                <p className="text-lg font-semibold text-ink-900">Stock Overview</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden rounded-full bg-ink-900 px-3 py-1 text-xs font-semibold text-white md:block shadow-ring">
                  {role === "ADMIN" ? "Admin" : "Staff"}
                </div>
                <UserMenu />
              </div>
            </div>
            <nav className="no-scrollbar mt-3 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 whitespace-nowrap rounded-full border border-ink-200 bg-white/95 px-4 py-2 text-sm font-semibold text-ink-700 shadow-ring min-h-[44px] flex items-center"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="flex-1 px-4 py-5 sm:py-6 md:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
