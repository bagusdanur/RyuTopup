"use client";

import { useState, useTransition } from "react";
import { FiTrash2, FiPower, FiPlus, FiX } from "react-icons/fi";
import { createPromoCode, togglePromoStatus, deletePromoCode } from "./actions";

export function PromoItem({ promo }: { promo: any }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await togglePromoStatus(promo.id, promo.is_active);
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Yakin ingin menghapus kode promo ini?")) return;
    startTransition(async () => {
      try {
        await deletePromoCode(promo.id);
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  return (
    <tr className={`border-b-2 border-white/20 hover:bg-white/10 transition-colors ${!promo.is_active ? "opacity-50" : ""}`}>
      <td className="p-4 font-mono font-black text-accent tracking-widest text-lg">
        {promo.code}
      </td>
      <td className="p-4 font-bold text-sm">
        {promo.discount_amount ? (
          `Rp ${promo.discount_amount.toLocaleString("id-ID")}`
        ) : (
          `${promo.discount_percentage}% ${promo.max_discount ? `(Max Rp ${promo.max_discount.toLocaleString("id-ID")})` : ""}`
        )}
      </td>
      <td className="p-4 text-sm font-bold text-center">
        {promo.used} / {promo.quota ? promo.quota : "∞"}
      </td>
      <td className="p-4 text-center">
        <div className="flex justify-center gap-2">
          <button 
            onClick={handleToggle}
            disabled={isPending}
            className={`p-2 border-2 border-black shadow-neo-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 ${promo.is_active ? "bg-accent-green text-black" : "bg-white/20 text-white"}`}
            title={promo.is_active ? "Nonaktifkan" : "Aktifkan"}
          >
            <FiPower />
          </button>
          <button 
            onClick={handleDelete}
            disabled={isPending}
            className="p-2 bg-accent-red text-white border-2 border-black shadow-neo-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
            title="Hapus"
          >
            <FiTrash2 />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function PromoCreateForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [discountType, setDiscountType] = useState<"nominal" | "persen">("nominal");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    
    const code = formData.get("code") as string;
    const amount = formData.get("discount_amount") as string;
    const percent = formData.get("discount_percentage") as string;
    const maxDesc = formData.get("max_discount") as string;
    const minPurchase = formData.get("min_purchase") as string;
    const quota = formData.get("quota") as string;

    startTransition(async () => {
      try {
        await createPromoCode({
          code,
          discount_amount: discountType === "nominal" && amount ? parseInt(amount) : undefined,
          discount_percentage: discountType === "persen" && percent ? parseInt(percent) : undefined,
          max_discount: discountType === "persen" && maxDesc ? parseInt(maxDesc) : undefined,
          min_purchase: minPurchase ? parseInt(minPurchase) : undefined,
          quota: quota ? parseInt(quota) : undefined,
        });
        setIsOpen(false);
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-accent text-black px-6 py-3 border-4 border-black font-black uppercase tracking-widest shadow-neo hover:translate-x-1 hover:-translate-y-1 hover:shadow-neo-lg transition-all"
      >
        <FiPlus className="w-5 h-5" />
        Buat Promo Baru
      </button>
    );
  }

  return (
    <div className="bg-black border-4 border-white p-6 md:p-8 shadow-neo-lg relative animate-fadeIn mb-8">
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 text-white hover:text-accent-red transition-colors"
      >
        <FiX className="w-6 h-6" />
      </button>
      
      <h2 className="text-xl font-black text-white uppercase tracking-wider mb-6">Tambah Kode Promo</h2>
      
      {error && (
        <div className="bg-accent-red text-white font-bold p-3 mb-4 uppercase text-sm border-2 border-white">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-black text-white uppercase tracking-wider">Kode Promo</label>
          <input 
            type="text" 
            name="code" 
            required
            className="w-full bg-white text-black p-3 border-2 border-black font-bold uppercase focus:outline-none focus:ring-4 focus:ring-accent"
            placeholder="Misal: RYUGAMING"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-white uppercase tracking-wider">Tipe Diskon</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-white font-bold cursor-pointer">
              <input type="radio" checked={discountType === "nominal"} onChange={() => setDiscountType("nominal")} className="accent-accent w-4 h-4" />
              Rupiah
            </label>
            <label className="flex items-center gap-2 text-white font-bold cursor-pointer">
              <input type="radio" checked={discountType === "persen"} onChange={() => setDiscountType("persen")} className="accent-accent w-4 h-4" />
              Persentase (%)
            </label>
          </div>
        </div>

        {discountType === "nominal" ? (
          <div className="space-y-1.5 animate-fadeIn">
            <label className="text-xs font-black text-white uppercase tracking-wider">Potongan Nominal (Rp)</label>
            <input 
              type="number" 
              name="discount_amount"
              min="1"
              required 
              className="w-full bg-white text-black p-3 border-2 border-black font-bold focus:outline-none focus:ring-4 focus:ring-accent"
              placeholder="Misal: 5000"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 animate-fadeIn">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-white uppercase tracking-wider">Persentase (%)</label>
              <input 
                type="number" 
                name="discount_percentage"
                min="1"
                max="100"
                required 
                className="w-full bg-white text-black p-3 border-2 border-black font-bold focus:outline-none focus:ring-4 focus:ring-accent"
                placeholder="Misal: 10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-white uppercase tracking-wider">Maksimal Diskon (Rp)</label>
              <input 
                type="number" 
                name="max_discount"
                min="1"
                className="w-full bg-white text-black p-3 border-2 border-black font-bold focus:outline-none focus:ring-4 focus:ring-accent"
                placeholder="Misal: 15000 (Opsional)"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-white uppercase tracking-wider">Minimal Belanja (Rp)</label>
            <input 
              type="number" 
              name="min_purchase" 
              min="1"
              className="w-full bg-white text-black p-3 border-2 border-black font-bold focus:outline-none focus:ring-4 focus:ring-accent"
              placeholder="Kosongkan jika tanpa batas"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-black text-white uppercase tracking-wider">Kuota Penggunaan</label>
            <input 
              type="number" 
              name="quota" 
              min="1"
              className="w-full bg-white text-black p-3 border-2 border-black font-bold focus:outline-none focus:ring-4 focus:ring-accent"
              placeholder="Kosongkan jika tanpa batas"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={isPending}
          className="w-full mt-4 bg-accent text-black py-4 border-2 border-accent shadow-neo-orange font-black uppercase tracking-widest hover:translate-x-1 hover:-translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : "Simpan Kode Promo"}
        </button>
      </form>
    </div>
  );
}
