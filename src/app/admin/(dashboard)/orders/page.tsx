import { supabaseServer } from "@/lib/supabaseServer";
import { FiCheck, FiX, FiClock, FiRefreshCw } from "react-icons/fi";

export const dynamic = "force-dynamic";

// This is a Server Component. It fetches data directly from Supabase securely.
export default async function AdminOrdersPage() {
  // Fetch transactions from the existing topup_transactions table
  const { data: orders, error } = await supabaseServer
    .from("topup_transactions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-white font-bold bg-accent-red border-2 border-white shadow-neo">
        Gagal memuat pesanan: {error.message}
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
        return <span className="bg-accent-green text-black px-2 py-1 text-[9px] font-black uppercase border border-black shadow-neo-sm">Sukses</span>;
      case "processing":
        return <span className="bg-accent text-black px-2 py-1 text-[9px] font-black uppercase border border-black shadow-neo-sm animate-pulse">Diproses</span>;
      case "failed":
        return <span className="bg-accent-red text-white px-2 py-1 text-[9px] font-black uppercase border border-white shadow-neo-sm">Gagal</span>;
      default:
        return <span className="bg-accent-orange text-black px-2 py-1 text-[9px] font-black uppercase border border-black shadow-neo-sm">Pending</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER */}
      <div className="border-b-2 border-white pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            Manajemen Pesanan
          </h1>
          <p className="text-white/60 font-bold text-xs mt-1">
            Data ini ditarik secara real-time dari tabel <b>topup_transactions</b> Supabase Anda.
          </p>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-black border-2 border-white p-5 shadow-neo overflow-x-auto rounded-none">
        <table className="w-full text-left min-w-[900px] border-collapse">
          <thead>
            <tr className="border-b-2 border-white/20 text-[10px] font-black text-white/60 uppercase tracking-widest">
              <th className="pb-3 px-2">Waktu</th>
              <th className="pb-3 px-2">Invoice / WA</th>
              <th className="pb-3 px-2">Game / Item</th>
              <th className="pb-3 px-2">Target ID</th>
              <th className="pb-3 px-2">Total Bayar</th>
              <th className="pb-3 px-2">Status Bayar</th>
              <th className="pb-3 px-2 text-right">Aksi Manual</th>
            </tr>
          </thead>
          <tbody className="text-xs font-bold text-white">
            {orders?.map((order) => (
              <tr key={order.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                <td className="py-4 px-2 whitespace-nowrap text-white/70">
                  {new Date(order.created_at).toLocaleString('id-ID', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </td>
                
                <td className="py-4 px-2">
                  <span className="font-mono text-accent">{order.id}</span>
                  <br />
                  <span className="text-[10px] text-white/50">{order.wa_number}</span>
                </td>

                <td className="py-4 px-2">
                  <span className="uppercase">{order.game_id.replace('-', ' ')}</span>
                  <br />
                  <span className="text-[10px] text-white/50">{order.item_name}</span>
                </td>

                <td className="py-4 px-2 font-mono">
                  {order.target_id}
                </td>

                <td className="py-4 px-2">
                  <span className="font-mono">Rp {order.price_total.toLocaleString('id-ID')}</span>
                  <br />
                  <span className="text-[9px] uppercase text-white/50">{order.payment_method}</span>
                </td>

                <td className="py-4 px-2">
                  {getStatusBadge(order.payment_status)}
                </td>

                <td className="py-4 px-2 text-right">
                  <div className="flex justify-end gap-1.5">
                    {order.payment_status === 'pending' && (
                      <button className="bg-accent text-black p-1.5 border-2 border-accent shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none" title="Tandai Sukses">
                        <FiCheck className="w-4 h-4" />
                      </button>
                    )}
                    {order.payment_status === 'pending' && (
                      <button className="bg-accent-red text-white p-1.5 border-2 border-accent-red shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none" title="Batalkan">
                        <FiX className="w-4 h-4" />
                      </button>
                    )}
                    {(order.payment_status === 'success' || order.payment_status === 'processing') && (
                       <button className="bg-black text-white p-1.5 border-2 border-white shadow-neo-sm hover:bg-white hover:text-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-[10px] uppercase font-black px-2">
                         Detail
                       </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-white/50 italic">
                  Belum ada transaksi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
