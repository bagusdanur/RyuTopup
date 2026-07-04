"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiGrid, FiBox, FiTag, FiShoppingCart, FiPercent, FiLogOut, FiTrendingUp } from "react-icons/fi";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: FiGrid, exact: true },
  { href: "/admin/statistik", label: "Stats", icon: FiTrendingUp, exact: false },
  { href: "/admin/games", label: "Games", icon: FiBox, exact: false },
  { href: "/admin/products", label: "Harga", icon: FiTag, exact: false },
  { href: "/admin/orders", label: "Pesanan", icon: FiShoppingCart, exact: false, badge: true },
  { href: "/admin/promo", label: "Promo", icon: FiPercent, exact: false },
];

export default function AdminBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black border-t-[3px] border-white safe-area-bottom">
      <div className="grid grid-cols-6 h-16">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 relative transition-colors select-none ${
                active
                  ? "bg-accent text-black"
                  : "text-white/60 hover:text-white hover:bg-white/5 active:bg-white/10"
              }`}
            >
              <span className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-black animate-pulse" />
                )}
              </span>
              <span className={`text-[9px] font-black uppercase tracking-wider leading-none ${
                active ? "text-black" : "text-white/50"
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
