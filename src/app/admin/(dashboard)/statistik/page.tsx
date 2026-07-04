import { supabaseServer } from "@/lib/supabaseServer";
import { FiTrendingUp, FiShoppingBag, FiDollarSign, FiClock } from "react-icons/fi";

export const dynamic = "force-dynamic";

function formatRp(val: number) {
  return `Rp ${val.toLocaleString("id-ID")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function StatistikPage() {
  const { data: orders } = await supabaseServer
    .from("topup_transactions")
    .select("id, game_id, item_code, price_base, price_total, discount_amount, payment_status, topup_status, created_at, payment_method")
    .order("created_at", { ascending: false });

  const { data: products } = await supabaseServer
    .from("products")
    .select("id, provider_price");
  const providerPriceMap = new Map<string, number>();
  products?.forEach(p => providerPriceMap.set(p.id, p.provider_price || 0));

  const successOrders = orders?.filter(o => o.payment_status === "success") || [];
  
  // Keuntungan bersih
  const totalProfit = successOrders.reduce((sum, o) => {
    const modal = providerPriceMap.get(o.item_code) || 0;
    const profit = ((o.price_base || 0) - (o.discount_amount || 0)) - modal;
    return sum + Math.max(profit, 0);
  }, 0);

  // Pendapatan kotor (total yang dibayar customer)
  const totalRevenue = successOrders.reduce((sum, o) => sum + (o.price_total || 0), 0);

  // Stats per hari (30 hari terakhir)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (29 - i));
    return d;
  });

  const dailyStats = last30Days.map(day => {
    const dayStr = day.toISOString().split("T")[0];
    const dayOrders = successOrders.filter(o => o.created_at.startsWith(dayStr));
    const revenue = dayOrders.reduce((s, o) => s + (o.price_total || 0), 0);
    const profit = dayOrders.reduce((s, o) => {
      const modal = providerPriceMap.get(o.item_code) || 0;
      return s + Math.max(((o.price_base || 0) - (o.discount_amount || 0)) - modal, 0);
    }, 0);
    return {
      date: day.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      count: dayOrders.length,
      revenue,
      profit,
    };
  });

  const maxRevenue = Math.max(...dailyStats.map(d => d.revenue), 1);

  // Top games
  const gameCounts: Record<string, { count: number; revenue: number }> = {};
  successOrders.forEach(o => {
    if (o.game_id) {
      if (!gameCounts[o.game_id]) gameCounts[o.game_id] = { count: 0, revenue: 0 };
      gameCounts[o.game_id].count++;
      gameCounts[o.game_id].revenue += o.price_total || 0;
    }
  });
  const topGames = Object.entries(gameCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([gameId, stats]) => ({
      gameId,
      name: gameId.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      ...stats,
    }));
  const maxGameCount = Math.max(...topGames.map(g => g.count), 1);

  // Jam tersibuk (distribusi per jam)
  const hourCounts = Array(24).fill(0);
  successOrders.forEach(o => {
    const hour = new Date(o.created_at).getHours();
    hourCounts[hour]++;
  });
  const maxHour = Math.max(...hourCounts, 1);

  // Metode bayar
  const methodCounts: Record<string, number> = {};
  successOrders.forEach(o => {
    const m = o.payment_method?.toUpperCase() || "UNKNOWN";
    methodCounts[m] = (methodCounts[m] || 0) + 1;
  });
  const topMethods = Object.entries(methodCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Today stats
  const todayStr = new Date().toISOString().split("T")[0];
  const todayOrders = successOrders.filter(o => o.created_at.startsWith(todayStr));
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.price_total || 0), 0);
  const todayProfit = todayOrders.reduce((s, o) => {
    const modal = providerPriceMap.get(o.item_code) || 0;
    return s + Math.max(((o.price_base || 0) - (o.discount_amount || 0)) - modal, 0);
  }, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* HEADER */}
      <div className="bg-accent text-black p-6 md:p-8 border-4 border-black shadow-neo-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-1">Statistik</h1>
          <p className="font-bold text-sm opacity-80">Analisis performa penjualan & tren transaksi RyuTopup.</p>
        </div>
        <div className="absolute -right-10 -bottom-10 text-[120px] opacity-10 font-black italic">STAT</div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {[
          { label: "Transaksi Sukses", value: successOrders.length.toString(), sub: `Hari ini: ${todayOrders.length}`, icon: <FiShoppingBag className="w-5 h-5" />, color: "bg-accent-green" },
          { label: "Total Pendapatan", value: formatRp(totalRevenue), sub: `Hari ini: ${formatRp(todayRevenue)}`, icon: <FiDollarSign className="w-5 h-5" />, color: "bg-accent-orange" },
          { label: "Keuntungan Bersih", value: formatRp(totalProfit), sub: `Hari ini: ${formatRp(todayProfit)}`, icon: <FiTrendingUp className="w-5 h-5" />, color: "bg-accent" },
          { label: "Total Semua Order", value: (orders?.length || 0).toString(), sub: `Gagal/Pending: ${(orders?.length || 0) - successOrders.length}`, icon: <FiClock className="w-5 h-5" />, color: "bg-accent-red" },
        ].map((card) => (
          <div key={card.label} className="bg-white text-black border-4 border-black p-4 md:p-6 shadow-neo-lg flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <span className="text-[9px] md:text-xs font-black uppercase tracking-widest bg-black text-white px-1.5 py-0.5 md:px-2 md:py-1">{card.label}</span>
              <span className={`${card.color} p-1.5 md:p-2 border-2 border-black hidden sm:block`}>{card.icon}</span>
            </div>
            <div className="text-xl md:text-2xl font-black font-mono tracking-tighter">{card.value}</div>
            <div className="text-[9px] md:text-xs font-bold text-black/50 uppercase">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* GRAFIK PENDAPATAN 30 HARI */}
      <div className="bg-black border-4 border-white p-4 md:p-6 shadow-neo-lg">
        <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-white mb-4">Pendapatan 30 Hari Terakhir</h2>
        <div className="flex items-end gap-[2px] md:gap-1 h-40 overflow-x-auto pb-2">
          {dailyStats.map((day, i) => {
            const heightPct = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
            return (
              <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-[14px] group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none border border-black">
                  {day.date}<br />{day.count} order<br />{formatRp(day.revenue)}
                </div>
                <div
                  className={`w-full ${day.revenue > 0 ? "bg-accent" : "bg-white/10"} transition-all hover:bg-accent-orange`}
                  style={{ height: `${Math.max(heightPct, day.revenue > 0 ? 4 : 1)}%` }}
                />
                {(i % 7 === 0 || i === 29) && (
                  <span className="text-[7px] text-white/40 font-bold whitespace-nowrap">{day.date}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TOP GAMES + METODE BAYAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TOP GAMES */}
        <div className="bg-black border-4 border-white p-4 md:p-6 shadow-neo-lg">
          <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-white mb-4">Top Game Terlaris</h2>
          <div className="space-y-3">
            {topGames.length === 0 ? (
              <p className="text-white/40 text-xs font-bold uppercase">Belum ada data.</p>
            ) : topGames.map((g, i) => (
              <div key={g.gameId} className="flex items-center gap-3">
                <span className="text-xl font-black text-white/20 italic w-6 shrink-0">#{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black text-white uppercase">{g.name}</span>
                    <span className="text-xs font-mono text-accent font-black">{g.count}x</span>
                  </div>
                  <div className="h-2 bg-white/10 w-full">
                    <div
                      className="h-full bg-accent transition-all"
                      style={{ width: `${(g.count / maxGameCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* METODE BAYAR */}
        <div className="bg-black border-4 border-white p-4 md:p-6 shadow-neo-lg">
          <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-white mb-4">Metode Pembayaran Populer</h2>
          <div className="space-y-3">
            {topMethods.length === 0 ? (
              <p className="text-white/40 text-xs font-bold uppercase">Belum ada data.</p>
            ) : topMethods.map(([method, count], i) => {
              const total = successOrders.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={method} className="flex items-center gap-3">
                  <span className="text-xl font-black text-white/20 italic w-6 shrink-0">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-black text-white uppercase">{method}</span>
                      <span className="text-xs font-mono text-white/50 font-black">{pct}% ({count}x)</span>
                    </div>
                    <div className="h-2 bg-white/10 w-full">
                      <div className="h-full bg-accent-blue transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* JAM TERSIBUK */}
      <div className="bg-black border-4 border-white p-4 md:p-6 shadow-neo-lg">
        <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-white mb-4">Distribusi Transaksi per Jam</h2>
        <div className="flex items-end gap-[2px] h-24 overflow-x-auto pb-2">
          {hourCounts.map((count, hour) => {
            const heightPct = maxHour > 0 ? (count / maxHour) * 100 : 0;
            return (
              <div key={hour} className="flex flex-col items-center gap-1 flex-1 min-w-[20px] group relative">
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] font-black px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-black">
                  {hour.toString().padStart(2,"0")}:00 — {count} order
                </div>
                <div
                  className={`w-full ${count > 0 ? "bg-accent-purple" : "bg-white/10"} transition-all`}
                  style={{ height: `${Math.max(heightPct, count > 0 ? 8 : 2)}%` }}
                />
                {hour % 3 === 0 && (
                  <span className="text-[8px] text-white/40 font-bold">{hour.toString().padStart(2,"0")}</span>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[9px] text-white/30 font-bold uppercase mt-2">Jam user paling aktif melakukan top-up.</p>
      </div>
    </div>
  );
}
