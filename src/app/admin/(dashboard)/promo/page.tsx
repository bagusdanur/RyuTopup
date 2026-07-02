import { supabaseServer } from "@/lib/supabaseServer";
import { PromoItem, PromoCreateForm } from "./PromoActions";
import { FiTag } from "react-icons/fi";

export const dynamic = "force-dynamic";

export default async function AdminPromoPage() {
  const { data: promos, error } = await supabaseServer
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="bg-accent-red text-white p-6 border-4 border-white shadow-neo font-black uppercase">
        Gagal memuat data kode promo: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="bg-accent text-black p-6 md:p-8 border-4 border-black shadow-neo-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
            <FiTag />
            Kode Promo
          </h1>
          <p className="font-bold text-sm md:text-base opacity-80 max-w-2xl">
            Kelola diskon, voucher, dan limitasi promo.
          </p>
        </div>
      </div>

      <PromoCreateForm />

      <div className="bg-black border-4 border-white p-6 shadow-neo-lg space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
            <span className="w-3 h-3 bg-accent-orange animate-pulse"></span>
            Daftar Kode Promo
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white text-black text-xs font-black uppercase tracking-widest">
                <th className="p-4 border-r-2 border-black w-1/4">Kode Voucher</th>
                <th className="p-4 border-r-2 border-black">Besaran Diskon</th>
                <th className="p-4 border-r-2 border-black text-center">Dipakai / Kuota</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-white bg-[#111]">
              {promos?.map((promo) => (
                <PromoItem key={promo.id} promo={promo} />
              ))}

              {(!promos || promos.length === 0) && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-white/50 font-black uppercase tracking-widest text-lg">
                    BELUM ADA KODE PROMO
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
