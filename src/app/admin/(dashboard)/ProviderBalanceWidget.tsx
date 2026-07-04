"use client";

import { useEffect, useState } from "react";
import { FiRefreshCw, FiDatabase } from "react-icons/fi";

export default function ProviderBalanceWidget() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Load saldo dari database (cepat, tidak hit API provider)
  const loadCachedBalance = async () => {
    try {
      const res = await fetch("/api/admin/settings?key=provider_balance");
      const data = await res.json();
      if (data && data.value !== null) {
        setBalance(parseInt(data.value, 10));
      }
    } catch (err: any) {
      setError("Gagal memuat saldo dari database");
    } finally {
      setLoading(false);
    }
  };

  // Refresh saldo dari VIP Reseller, lalu simpan ke database
  const refreshFromProvider = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/topup-provider/balance");
      const data = await res.json();
      if (data.success) {
        setBalance(data.balance);
        setLastUpdated(new Date().toLocaleTimeString("id-ID"));
      } else {
        setError(data.error || "Gagal cek saldo provider");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCachedBalance();
  }, []);

  return (
    <div className="bg-white text-black border-4 border-black p-4 md:p-6 shadow-neo-lg hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#ff6b00] transition-all flex flex-col gap-2 md:gap-4">
      <div className="flex justify-between items-start">
        <span className="text-[9px] md:text-xs font-black uppercase tracking-widest bg-black text-white px-1.5 py-0.5 md:px-2 md:py-1">
          Saldo Provider
        </span>
        <button
          onClick={refreshFromProvider}
          disabled={loading}
          className="bg-accent-blue text-black p-1.5 md:p-2 border-2 border-black hover:bg-black hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
          title="Sync Saldo dari VIP Reseller"
        >
          <FiRefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div>
        <h3 className="text-2xl md:text-3xl font-black tracking-tighter">
          {loading ? "..." : error ? "Error" : balance !== null ? `Rp ${balance.toLocaleString("id-ID")}` : "-"}
        </h3>
        {error && <p className="text-xs font-bold text-accent-red mt-1">{error}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[9px] md:text-xs font-bold text-black/50 uppercase tracking-wide flex items-center gap-1">
          <FiDatabase className="w-3 h-3" />
          {lastUpdated ? `Diupdate ${lastUpdated}` : "Dari cache database"}
        </span>
        <button
          onClick={refreshFromProvider}
          disabled={loading}
          className="w-full text-[9px] font-black uppercase tracking-widest border-2 border-black py-1.5 bg-black text-white hover:bg-white hover:text-black transition-colors disabled:opacity-50 cursor-pointer shadow-neo hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
        >
          {loading ? "Memuat..." : "↺ Update Saldo"}
        </button>
      </div>
    </div>
  );
}
