import { supabaseServer } from "@/lib/supabaseServer";
import { FiTrendingUp, FiShoppingBag, FiDollarSign, FiClock, FiArrowRight } from "react-icons/fi";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardOverview() {
  // Fetch real data from topup_transactions
  const { data: orders, error } = await supabaseServer
    .from("topup_transactions")
    .select("price_total, payment_status, topup_status, id, game_id, item_name, target_id, payment_method")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="bg-accent-red text-white p-6 border-4 border-white shadow-neo font-black uppercase">
        Gagal memuat data dashboard: {error.message}
      </div>
    );
  }

  // Calculate stats
  const totalRevenue = orders
    ?.filter(o => o.payment_status === 'success')
    .reduce((sum, order) => sum + (order.price_total || 0), 0) || 0;

  const totalSuccess = orders?.filter(o => o.topup_status === 'success').length || 0;
  const totalPending = orders?.filter(o => o.topup_status === 'processing').length || 0;
  const recentPending = orders?.filter(o => o.topup_status === 'processing').slice(0, 5) || [];

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="bg-accent text-black p-6 md:p-8 border-4 border-black shadow-neo-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2">
            System Overview
          </h1>
          <p className="font-bold text-sm md:text-base opacity-80 max-w-2xl">
            Ringkasan performa penjualan dan pesanan RyuTopup. Data disinkronisasi secara real-time dari database.
          </p>
        </div>
        {/* Decorative element */}
        <div className="absolute -right-10 -bottom-10 text-[150px] opacity-10 font-black italic">
          RYU
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stat 1: Revenue */}
        <div className="bg-white text-black border-4 border-black p-6 shadow-neo-lg hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#ff6b00] transition-all flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-black uppercase tracking-widest bg-black text-white px-2 py-1">
              Pendapatan
            </span>
            <span className="bg-accent-orange text-black p-2 border-2 border-black">
              <FiDollarSign className="w-5 h-5" />
            </span>
          </div>
          <span className="text-3xl md:text-4xl font-black font-mono tracking-tighter">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </span>
          <span className="text-xs font-bold text-accent-green flex items-center gap-1.5 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></span>
            Real-time Sync
          </span>
        </div>

        {/* Stat 2: Success Orders */}
        <div className="bg-white text-black border-4 border-black p-6 shadow-neo-lg hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#22c55e] transition-all flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-black uppercase tracking-widest bg-black text-white px-2 py-1">
              Pesanan Sukses
            </span>
            <span className="bg-accent-green text-black p-2 border-2 border-black">
              <FiShoppingBag className="w-5 h-5" />
            </span>
          </div>
          <span className="text-3xl md:text-4xl font-black font-mono tracking-tighter">
            {totalSuccess}
          </span>
          <span className="text-xs font-bold text-black/50 uppercase tracking-wide">
            Transaksi Selesai
          </span>
        </div>

        {/* Stat 3: Pending Orders */}
        <div className="bg-white text-black border-4 border-black p-6 shadow-neo-lg hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#ef4444] transition-all flex flex-col gap-4 relative overflow-hidden">
          {totalPending > 0 && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-accent-red transform rotate-45 translate-x-8 -translate-y-8"></div>
          )}
          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs font-black uppercase tracking-widest bg-black text-white px-2 py-1">
              Perlu Tindakan
            </span>
            <span className="bg-accent-red text-white p-2 border-2 border-black animate-bounce">
              <FiClock className="w-5 h-5" />
            </span>
          </div>
          <span className="text-3xl md:text-4xl font-black font-mono tracking-tighter text-accent-red relative z-10">
            {totalPending}
          </span>
          <span className="text-xs font-bold text-accent-red uppercase tracking-wide relative z-10">
            Pesanan Pending
          </span>
        </div>
      </div>

      {/* PENDING ORDERS TABLE */}
      <div className="bg-black border-4 border-white p-6 shadow-neo-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
            <span className="w-3 h-3 bg-accent-red animate-ping"></span>
            Pesanan Masuk (Terbaru)
          </h2>
          <Link href="/admin/orders" className="text-xs font-black text-black bg-white px-4 py-2 hover:bg-accent border-2 border-transparent transition-colors uppercase tracking-widest flex items-center gap-2 group">
            Kelola Pesanan
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white text-black text-xs font-black uppercase tracking-widest">
                <th className="p-4 border-r-2 border-black">Invoice</th>
                <th className="p-4 border-r-2 border-black">Game / Item</th>
                <th className="p-4 border-r-2 border-black">Target ID</th>
                <th className="p-4 border-r-2 border-black">Total</th>
                <th className="p-4 border-r-2 border-black">Metode</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-white bg-[#111]">
              {recentPending.map((order) => (
                <tr key={order.id} className="border-b-2 border-white/20 hover:bg-white/10 transition-colors">
                  <td className="p-4 font-mono text-accent">{order.id}</td>
                  <td className="p-4">
                    <span className="uppercase text-white">{order.game_id.replace('-', ' ')}</span>
                    <br/>
                    <span className="text-xs text-white/50">{order.item_name}</span>
                  </td>
                  <td className="p-4 font-mono text-white/80">{order.target_id}</td>
                  <td className="p-4 font-mono font-black">Rp {order.price_total.toLocaleString('id-ID')}</td>
                  <td className="p-4 uppercase text-xs">
                    <span className="bg-black border border-white/30 px-2 py-1">{order.payment_method}</span>
                  </td>
                  <td className="p-4 text-center">
                    <Link href="/admin/orders" className="inline-block bg-accent-orange text-black px-4 py-2 border-2 border-black font-black text-[10px] uppercase shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                      Proses
                    </Link>
                  </td>
                </tr>
              ))}

              {recentPending.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-white/50 font-black uppercase tracking-widest text-lg">
                    TIDAK ADA PESANAN PENDING HARI INI
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
