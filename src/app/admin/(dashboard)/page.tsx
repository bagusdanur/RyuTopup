import { supabaseServer } from "@/lib/supabaseServer";
import { FiShoppingBag, FiDollarSign, FiClock, FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import ProviderBalanceWidget from "./ProviderBalanceWidget";
import SocialProofToggle from "./SocialProofToggle";
import DynamicStockToggle from "./DynamicStockToggle";

export const dynamic = "force-dynamic";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  success: { label: "Sukses", bg: "bg-accent-green", text: "text-black" },
  processing: { label: "Diproses", bg: "bg-[#06b6d4]", text: "text-black" },
  pending: { label: "Pending", bg: "bg-accent-orange", text: "text-black" },
  failed: { label: "Gagal", bg: "bg-accent-red", text: "text-white" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: "bg-white/20", text: "text-white" };
  return (
    <span className={`${cfg.bg} ${cfg.text} text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-black/20 shrink-0`}>
      {cfg.label}
    </span>
  );
}

export default async function AdminDashboardOverview() {
  const { data: orders, error } = await supabaseServer
    .from("topup_transactions")
    .select("price_total, price_base, discount_amount, item_code, payment_status, topup_status, id, game_id, item_name, target_id, payment_method, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="bg-accent-red text-white p-6 border-4 border-white shadow-neo font-black uppercase">
        Gagal memuat data dashboard: {error.message}
      </div>
    );
  }

  // Fetch provider_price for all products to calculate true profit
  const { data: products } = await supabaseServer.from("products").select("id, provider_price");
  const providerPriceMap = new Map();
  if (products) {
    products.forEach(p => providerPriceMap.set(p.id, p.provider_price || 0));
  }

  const totalRevenue = orders
    ?.filter(o => o.payment_status === "success")
    .reduce((sum, order) => {
      const providerPrice = providerPriceMap.get(order.item_code) || 0;
      const priceBase = order.price_base || 0;
      const discount = order.discount_amount || 0;

      // Keuntungan Bersih (Profit) = Harga Jual (Base) - Diskon - Harga Modal (Provider)
      const profit = (priceBase - discount) - providerPrice;

      // Jika profit negatif karena diskon berlebihan atau modal naik, set ke 0 agar tidak minus di laporan
      return sum + Math.max(profit, 0);
    }, 0) || 0;

  const totalSuccess = orders?.filter(o => o.topup_status === "success").length || 0;
  const totalPending = orders?.filter(o => o.topup_status === "processing" || o.topup_status === "pending").length || 0;
  const totalFailed = orders?.filter(o => o.topup_status === "failed").length || 0;

  // Calculate today's revenue
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalRevenueToday = orders
    ?.filter(o => o.payment_status === "success" && new Date(o.created_at) >= today)
    .reduce((sum, order) => {
      const providerPrice = providerPriceMap.get(order.item_code) || 0;
      const profit = ((order.price_base || 0) - (order.discount_amount || 0)) - providerPrice;
      return sum + Math.max(profit, 0);
    }, 0) || 0;

  // Calculate top games
  const gameCounts: Record<string, number> = {};
  orders?.filter(o => o.topup_status === "success").forEach(o => {
    if (o.game_id) {
      gameCounts[o.game_id] = (gameCounts[o.game_id] || 0) + 1;
    }
  });
  const topGames = Object.entries(gameCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([game, count]) => ({ game, count }));

  const recentOrders = orders?.slice(0, 5) || [];

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch { return "-"; }
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="bg-accent text-black p-4 md:p-8 border-4 border-black shadow-neo-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tighter mb-1">
            System Overview
          </h1>
          <p className="font-bold text-xs md:text-base opacity-80 max-w-2xl">
            Ringkasan performa penjualan RyuTopup secara real-time.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 text-[100px] md:text-[150px] opacity-10 font-black italic">
          RYU
        </div>
      </div>

      {/* STATS GRID — Row 1: Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
        <ProviderBalanceWidget />
        <SocialProofToggle />
        <DynamicStockToggle />
      </div>

      {/* STATS GRID — Row 2: Numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white text-black border-4 border-black p-4 md:p-6 shadow-neo-lg hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#ff6b00] transition-all flex flex-col gap-2 md:gap-4">
          <div className="flex justify-between items-start">
            <span className="text-[9px] md:text-xs font-black uppercase tracking-widest bg-black text-white px-1.5 py-0.5 md:px-2 md:py-1">Pendapatan Total</span>
            <span className="bg-accent-orange text-black p-1.5 md:p-2 border-2 border-black hidden sm:block">
              <FiDollarSign className="w-4 h-4 md:w-5 md:h-5" />
            </span>
          </div>
          <span className="text-lg md:text-3xl font-black font-mono tracking-tighter leading-tight">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </span>
          <span className="text-[9px] md:text-xs font-bold text-accent-green flex items-center gap-1 uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"></span> Hari Ini: Rp {totalRevenueToday.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="bg-white text-black border-4 border-black p-4 md:p-6 shadow-neo-lg hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#22c55e] transition-all flex flex-col gap-2 md:gap-4">
          <div className="flex justify-between items-start">
            <span className="text-[9px] md:text-xs font-black uppercase tracking-widest bg-black text-white px-1.5 py-0.5 md:px-2 md:py-1">Sukses</span>
            <span className="bg-accent-green text-black p-1.5 md:p-2 border-2 border-black hidden sm:block">
              <FiShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
            </span>
          </div>
          <span className="text-3xl md:text-4xl font-black font-mono tracking-tighter">{totalSuccess}</span>
          <span className="text-[9px] md:text-xs font-bold text-black/50 uppercase tracking-wide">Transaksi Selesai</span>
        </div>

        <div className="bg-white text-black border-4 border-black p-4 md:p-6 shadow-neo-lg hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#ef4444] transition-all flex flex-col gap-2 md:gap-4 relative overflow-hidden">
          {totalPending > 0 && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-accent-red transform rotate-45 translate-x-8 -translate-y-8"></div>
          )}
          <div className="flex justify-between items-start relative z-10">
            <span className="text-[9px] md:text-xs font-black uppercase tracking-widest bg-black text-white px-1.5 py-0.5 md:px-2 md:py-1">Perhatian</span>
            <span className="bg-accent-red text-white p-1.5 md:p-2 border-2 border-black animate-bounce hidden sm:block">
              <FiClock className="w-4 h-4 md:w-5 md:h-5" />
            </span>
          </div>
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-2xl md:text-4xl font-black font-mono tracking-tighter text-accent-red relative z-10">{totalPending}</span>
              <span className="text-[9px] md:text-xs font-bold text-accent-red uppercase tracking-wide relative z-10">Pending</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xl md:text-2xl font-black font-mono tracking-tighter text-black/40 relative z-10">{totalFailed}</span>
              <span className="text-[8px] md:text-[10px] font-bold text-black/40 uppercase tracking-wide relative z-10">Gagal</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP GAMES LIST */}
      <div className="bg-black border-4 border-accent p-4 md:p-6 shadow-neo-lg flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-1/3">
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2 text-accent">TOP GAMES</h2>
          <p className="text-xs text-white/50 font-bold mb-4">Game paling laris terjual sepanjang masa berdasarkan transaksi sukses.</p>
        </div>
        <div className="w-full sm:w-2/3 flex flex-wrap gap-4">
          {topGames.length === 0 ? (
            <span className="text-white/50 text-sm font-bold uppercase">Belum ada data penjualan.</span>
          ) : (
            topGames.map((tg, i) => (
              <div key={tg.game} className="bg-[#111] border-2 border-white/20 p-4 flex gap-4 items-center flex-1 min-w-[200px]">
                <div className="text-3xl font-black text-white/10 italic">#{i + 1}</div>
                <div>
                  <div className="text-white font-black uppercase">{tg.game.replace(/-/g, " ")}</div>
                  <div className="text-accent text-xs font-bold">{tg.count} Terjual</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5 PESANAN TERBARU */}
      <div className="bg-black border-4 border-white p-4 md:p-6 shadow-neo-lg space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h2 className="text-base md:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-accent animate-pulse shrink-0"></span>
            5 Pesanan Terbaru
          </h2>
          <Link href="/admin/orders" className="text-[10px] md:text-xs font-black text-black bg-white px-3 py-2 hover:bg-accent border-2 border-transparent transition-colors uppercase tracking-widest flex items-center gap-1.5 group self-start">
            Lihat Semua <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden space-y-2.5">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-white/50 font-black uppercase tracking-widest text-sm">Belum ada pesanan</div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="border-2 border-white/20 p-3 space-y-2 bg-[#111] hover:bg-[#1a1a1a] transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-mono text-accent text-[10px] font-black truncate max-w-[140px]">{order.id}</span>
                  <StatusBadge status={order.topup_status} />
                </div>
                <div>
                  <span className="text-white font-black text-[11px] uppercase">{(order.game_id || "").replace(/-/g, " ")}</span>
                  <p className="text-white/50 text-[9px] mt-0.5 truncate">{order.item_name}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono font-black text-white text-xs">Rp {(order.price_total || 0).toLocaleString("id-ID")}</span>
                  <span className="text-white/40 text-[9px] font-bold">{formatDate(order.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-white text-black text-xs font-black uppercase tracking-widest">
                <th className="p-4 border-r-2 border-black">Invoice</th>
                <th className="p-4 border-r-2 border-black">Game / Item</th>
                <th className="p-4 border-r-2 border-black">Target ID</th>
                <th className="p-4 border-r-2 border-black">Total</th>
                <th className="p-4 border-r-2 border-black">Metode</th>
                <th className="p-4 border-r-2 border-black">Waktu</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-white bg-[#111]">
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b-2 border-white/10 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-accent text-xs">{order.id}</td>
                  <td className="p-4">
                    <span className="uppercase text-white text-xs">{(order.game_id || "").replace(/-/g, " ")}</span>
                    <br />
                    <span className="text-xs text-white/50">{order.item_name}</span>
                  </td>
                  <td className="p-4 font-mono text-white/80 text-xs">{order.target_id}</td>
                  <td className="p-4 font-mono font-black">Rp {(order.price_total || 0).toLocaleString("id-ID")}</td>
                  <td className="p-4 uppercase text-xs">
                    <span className="bg-black border border-white/30 px-2 py-1">{order.payment_method}</span>
                  </td>
                  <td className="p-4 text-white/50 text-xs font-bold whitespace-nowrap">{formatDate(order.created_at)}</td>
                  <td className="p-4 text-center"><StatusBadge status={order.topup_status} /></td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-white/50 font-black uppercase tracking-widest text-lg">
                    BELUM ADA TRANSAKSI
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
