"use client";

import { useTransition, useState, useEffect } from "react";
import { FiSend, FiInfo, FiX } from "react-icons/fi";
import { updateOrderStatus } from "./actions";

export default function OrderActions({ order }: { order: any }) {
  const [isPending, startTransition] = useTransition();
  const [showDetail, setShowDetail] = useState(false);

  const handleUpdate = (action: string) => {
    startTransition(async () => {
      try {
        await updateOrderStatus(order.id, action);
      } catch (err: any) {
        alert("Gagal mengupdate pesanan: " + err.message);
      }
    });
  };

  return (
    <>
      <div className="flex justify-end gap-1.5">
        

        
        <button 
          onClick={() => setShowDetail(true)}
          className="bg-black text-white p-1.5 border-2 border-white shadow-neo-sm hover:bg-white hover:text-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-[10px] uppercase font-black px-2 flex items-center gap-1 cursor-pointer"
        >
          <FiInfo className="w-3 h-3" />
          Detail
        </button>
      </div>

      {/* Modal Detail */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-black border-2 border-white p-6 shadow-neo-lg w-full max-w-md relative text-left">
            <button 
              onClick={() => setShowDetail(false)}
              className="absolute top-4 right-4 text-white hover:text-accent-red transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
            
            <h3 className="text-xl font-black text-white uppercase tracking-wider border-b-2 border-white/20 pb-3 mb-4">
              Detail Pesanan
            </h3>
            
            <div className="space-y-4 text-sm font-bold text-white">
              <div>
                <span className="text-[10px] text-white/50 uppercase block mb-1 tracking-wider">Invoice ID</span>
                <span className="font-mono text-accent">{order.id}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/50 uppercase block mb-1 tracking-wider">Waktu Transaksi</span>
                {new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-white/50 uppercase block mb-1 tracking-wider">Game</span>
                  <span className="uppercase">{order.game_id.replace('-', ' ')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/50 uppercase block mb-1 tracking-wider">Item</span>
                  <span className="uppercase">{order.item_name}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-white/50 uppercase block mb-1 tracking-wider">Target ID</span>
                <span className="font-mono text-accent-yellow text-base">{order.target_id}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/50 uppercase block mb-1 tracking-wider">WhatsApp & Email</span>
                <span className="block">{order.wa_number}</span>
                <span className="block font-normal text-white/70">{order.email || "-"}</span>
              </div>
              <div className="pt-4 border-t-2 border-white/20">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/50 uppercase tracking-wider">Total Pembayaran</span>
                  <span className="text-lg font-mono text-accent-green">Rp {order.price_total.toLocaleString('id-ID')}</span>
                </div>
                {order.promo_code && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-white/50 uppercase tracking-wider">Promo Dipakai</span>
                    <span className="font-mono text-accent-orange bg-white/10 px-2 py-0.5">{order.promo_code} (-Rp {order.discount_amount?.toLocaleString('id-ID')})</span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-white/50 uppercase tracking-wider">Metode Bayar</span>
                  <span className="uppercase">{order.payment_method}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
