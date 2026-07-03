import { supabaseServer } from "@/lib/supabaseServer";
import OrderActions from "./OrderActions";

export const dynamic = "force-dynamic";

// This is a Server Component. It fetches data directly from Supabase securely.
export default async function AdminOrdersPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const limit = 10; // 10 items per page
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Fetch transactions from the existing topup_transactions table
  const { data: orders, error, count } = await supabaseServer
    .from("topup_transactions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / limit) : 1;

  if (error) {
    return (
      <div className="p-8 text-white font-bold bg-accent-red border-2 border-white shadow-neo">
        Gagal memuat pesanan: {error.message}
      </div>
    );
  }

  const getStatusBadge = (topupStatus: string, paymentStatus: string) => {
    // 1. Sukses (Selesai semua)
    if (topupStatus === 'success') {
      return (
        <span className="bg-accent-green text-black px-3 py-1.5 text-[10px] font-black uppercase border-2 border-accent-green shadow-neo-sm text-center inline-block min-w-[90px]">
          Selesai
        </span>
      );
    }
    
    // 2. Gagal (Batal)
    if (topupStatus === 'failed' || paymentStatus === 'failed' || paymentStatus === 'expired' || paymentStatus === 'cancelled') {
      return (
        <span className="bg-accent-red text-white px-3 py-1.5 text-[10px] font-black uppercase border-2 border-accent-red shadow-neo-sm text-center inline-block min-w-[90px]">
          Batal
        </span>
      );
    }

    // 3. Menunggu Pembayaran
    if (paymentStatus === 'pending') {
      return (
        <span className="bg-white text-black px-3 py-1.5 text-[10px] font-black uppercase border-2 border-white shadow-neo-sm text-center inline-block min-w-[90px]">
          Pending
        </span>
      );
    }

    // 4. Diproses (Sudah bayar, diamond belum dikirim)
    return (
      <span className="bg-accent-orange text-black px-3 py-1.5 text-[10px] font-black uppercase border-2 border-accent-orange shadow-neo-sm text-center inline-block min-w-[90px] animate-pulse">
        Diproses
      </span>
    );
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
        <table className="w-full text-left min-w-[950px] border-collapse">
          <thead>
            <tr className="border-b-2 border-white/20 text-[10px] font-black text-white/60 uppercase tracking-widest">
              <th className="pb-3 px-2">Waktu</th>
              <th className="pb-3 px-2">Invoice / WA</th>
              <th className="pb-3 px-2">Game / Item</th>
              <th className="pb-3 px-2">Target ID</th>
              <th className="pb-3 px-2">Total Bayar</th>
              <th className="pb-3 px-2">Status Pesanan</th>
              <th className="pb-3 px-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-xs font-bold text-white">
            {orders?.map((order) => (
              <tr key={order.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                <td className="py-4 px-2 whitespace-nowrap text-white/70" suppressHydrationWarning>
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

                <td className="py-4 px-2 font-mono text-accent-yellow">
                  {order.target_id}
                </td>

                <td className="py-4 px-2">
                  <span className="font-mono text-white">Rp {order.price_total.toLocaleString('id-ID')}</span>
                  <br />
                  <span className="text-[9px] uppercase text-white/50 bg-white/10 px-1 py-0.5 mt-1 inline-block">{order.payment_method}</span>
                </td>

                <td className="py-4 px-2">
                  <div className="flex flex-col items-start gap-1">
                    {getStatusBadge(order.topup_status, order.payment_status)}
                    {order.provider_message && (
                      <span className="text-[9px] text-white/50 max-w-[150px] truncate" title={order.provider_message}>
                        Info: {order.provider_message}
                      </span>
                    )}
                    {order.provider_sn && (
                      <span className="text-[9px] text-accent font-bold" title="Serial Number / Kode Voucher">
                        SN: {order.provider_sn}
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-4 px-2 text-right" suppressHydrationWarning>
                  <OrderActions order={order} />
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

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-black border-2 border-white p-4 text-xs font-black text-white shadow-neo">
          <span className="uppercase tracking-wider">Halaman <span className="text-accent">{page}</span> dari <span className="text-accent">{totalPages}</span></span>
          <div className="flex gap-2">
            {page > 1 ? (
              <a href={`/admin/orders?page=${page - 1}`} className="bg-white text-black px-4 py-2 border-2 border-white hover:bg-accent hover:border-accent hover:translate-x-[1px] hover:translate-y-[1px] shadow-neo-sm uppercase transition-all">
                Mundur
              </a>
            ) : (
              <span className="bg-white/10 text-white/50 px-4 py-2 border-2 border-white/20 cursor-not-allowed uppercase">
                Mundur
              </span>
            )}
            {page < totalPages ? (
              <a href={`/admin/orders?page=${page + 1}`} className="bg-white text-black px-4 py-2 border-2 border-white hover:bg-accent hover:border-accent hover:translate-x-[1px] hover:translate-y-[1px] shadow-neo-sm uppercase transition-all">
                Lanjut
              </a>
            ) : (
              <span className="bg-white/10 text-white/50 px-4 py-2 border-2 border-white/20 cursor-not-allowed uppercase">
                Lanjut
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
