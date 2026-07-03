"use client";

import { useEffect, useState } from "react";
import { FiDollarSign, FiRefreshCw, FiDatabase } from "react-icons/fi";

export default function ProviderBalanceWidget() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/topup-provider/balance");
      const data = await res.json();
      if (data.success) {
        setBalance(data.balance);
      } else {
        setError(data.error || "Gagal cek saldo");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div className="bg-white text-black border-4 border-black p-6 shadow-neo-lg hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#ff6b00] transition-all flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <span className="text-xs font-black uppercase tracking-widest bg-black text-white px-2 py-1">
          Saldo Provider
        </span>
        <button 
          onClick={fetchBalance}
          disabled={loading}
          className="bg-accent-blue text-black p-2 border-2 border-black hover:bg-black hover:text-white transition-colors disabled:opacity-50"
          title="Refresh Saldo"
        >
          <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div>
        <h3 className="text-3xl font-black tracking-tighter">
          {loading ? "..." : error ? "Error" : balance !== null ? `Rp ${balance.toLocaleString('id-ID')}` : "-"}
        </h3>
        {error && <p className="text-xs font-bold text-accent-red mt-1">{error}</p>}
      </div>
    </div>
  );
}
