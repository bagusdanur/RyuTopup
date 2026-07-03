import Link from "next/link";
import { FiGrid, FiBox, FiTag, FiShoppingCart, FiLogOut } from "react-icons/fi";
import AdminNotifier from "@/components/AdminNotifier";
import AdminBottomNav from "@/components/AdminBottomNav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased font-sans selection:bg-accent selection:text-black">
      
      {/* ===== MOBILE TOP BAR (hidden on md+) ===== */}
      <header className="md:hidden sticky top-0 z-40 bg-accent border-b-[3px] border-black flex items-center justify-between px-4 h-14 shrink-0">
        <Link href="/admin" className="flex items-center gap-1.5">
          <span className="text-xl font-black italic tracking-tighter uppercase text-black">
            RYU<span className="text-white drop-shadow-[1px_1px_0_#000]">ADMIN</span>
          </span>
        </Link>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-black text-white border-2 border-black px-3 py-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer active:opacity-70"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            Keluar
          </button>
        </form>
      </header>

      {/* ===== DESKTOP LAYOUT (sidebar + main) ===== */}
      <div className="flex flex-row">

        {/* SIDEBAR — desktop only */}
        <aside className="hidden md:flex w-72 bg-black border-r-4 border-white flex-col shrink-0 min-h-screen sticky top-0 h-screen">
          <div className="p-6 border-b-4 border-white bg-accent text-black">
            <Link href="/admin" className="flex items-center gap-2 cursor-pointer group">
              <span className="text-3xl font-black italic tracking-tighter uppercase group-hover:translate-x-1 transition-transform">
                RYU<span className="text-white drop-shadow-[2px_2px_0_#000]">ADMIN</span>
              </span>
            </Link>
            <p className="text-[10px] font-black uppercase mt-1 tracking-widest text-black/70">
              Control Panel v1.0
            </p>
          </div>
          
          <nav className="flex-1 p-6 space-y-4 overflow-y-auto">
            <div className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">
              Main Menu
            </div>
            
            <Link href="/admin" className="flex items-center gap-4 px-4 py-3.5 bg-black border-2 border-white hover:bg-accent hover:text-black hover:border-accent hover:translate-x-1 transition-all shadow-neo font-black text-sm uppercase tracking-wider group">
              <FiGrid className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Dashboard
            </Link>
            <Link href="/admin/games" className="flex items-center gap-4 px-4 py-3.5 bg-black border-2 border-white hover:bg-accent-purple hover:text-black hover:border-accent-purple hover:translate-x-1 transition-all shadow-neo font-black text-sm uppercase tracking-wider group">
              <FiBox className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Kelola Game
            </Link>
            <Link href="/admin/products" className="flex items-center gap-4 px-4 py-3.5 bg-black border-2 border-white hover:bg-accent-green hover:text-black hover:border-accent-green hover:translate-x-1 transition-all shadow-neo font-black text-sm uppercase tracking-wider group">
              <FiTag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Harga &amp; Item
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-4 px-4 py-3.5 bg-black border-2 border-white hover:bg-accent-orange hover:text-black hover:border-accent-orange hover:translate-x-1 transition-all shadow-neo font-black text-sm uppercase tracking-wider group relative">
              <FiShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Pesanan
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-accent-red border-2 border-black rounded-full animate-pulse"></span>
            </Link>
            <Link href="/admin/promo" className="flex items-center gap-4 px-4 py-3.5 bg-black border-2 border-white hover:bg-accent hover:text-black hover:border-accent hover:translate-x-1 transition-all shadow-neo font-black text-sm uppercase tracking-wider group">
              <FiTag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Kode Promo
            </Link>
          </nav>

          <div className="p-6 border-t-4 border-white bg-black">
            <form action="/auth/signout" method="post">
              <button type="submit" className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-accent-red border-4 border-white text-white hover:bg-white hover:text-accent-red transition-all shadow-neo font-black text-sm uppercase tracking-widest cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                <FiLogOut className="w-5 h-5" />
                Log Out
              </button>
            </form>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 relative overflow-y-auto bg-[#0a0a0a] min-h-screen">
          {/* Decorative Grid Background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{
            backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
          
          {/* pb-20 on mobile to avoid bottom nav overlap */}
          <div className="relative z-10 p-4 md:p-10 pb-24 md:pb-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <AdminBottomNav />

      {/* GLOBAL ADMIN NOTIFIER */}
      <AdminNotifier />
    </div>
  );
}
