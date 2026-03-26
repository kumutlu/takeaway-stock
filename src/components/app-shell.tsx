import Link from "next/link";
import { Package, LayoutGrid, ClipboardList, Users, Settings, Layers } from "lucide-react";
import UserMenu from "@/components/user-menu";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/products", label: "Products", icon: Package },
  { href: "/order-needs", label: "Order Needs", icon: ClipboardList },
  { href: "/stock-updates", label: "Stock Updates", icon: ClipboardList },
  { href: "/orders", label: "Orders", icon: Layers },
  { href: "/users", label: "Users", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings }
];

export default function AppShell({ children }: { children: React.ReactNode }) {
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
          <div className="mt-auto rounded-2xl border border-ink-100 bg-white/80 p-4 text-xs text-ink-600 shadow-ring">
            Optimized for a 4-person team.
          </div>
        </aside>
        <div className="flex flex-1 flex-col">
          <header className="border-b border-ink-100 bg-white/80 px-4 py-4 backdrop-blur-xl md:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs tracking-[0.2em] text-ink-400">Live Stock</p>
                <p className="text-lg font-semibold text-ink-900">Stock Overview</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden rounded-full bg-ink-900 px-3 py-1 text-xs font-semibold text-white md:block shadow-ring">
                  Admin
                </div>
                <UserMenu />
              </div>
            </div>
            <nav className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-full border border-ink-200 bg-white/90 px-3 py-1 text-xs text-ink-600 shadow-ring"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
