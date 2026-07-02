"use client";

import { useState } from "react";
import { FiLock, FiMail, FiArrowRight } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        // Redirect to dashboard
        window.location.href = "/admin";
      }
    } catch (err: any) {
      setError("Terjadi kesalahan saat mencoba login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* BRANDING */}
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-black italic tracking-wide text-white flex items-center justify-center gap-1.5">
          <span>RYU</span>
          <span className="bg-accent text-black px-3 py-1 border-2 border-accent not-italic font-black shadow-neo-sm">
            ADMIN
          </span>
        </h1>
        <p className="text-white/60 font-bold text-xs tracking-widest uppercase">
          Production Dashboard
        </p>
      </div>

      {/* LOGIN CARD */}
      <div className="w-full max-w-sm bg-black border-2 border-white p-6 shadow-neo rounded-none">
        <h2 className="text-xl font-black text-white uppercase tracking-wider mb-6 text-center">
          Login Terbatas
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white uppercase tracking-wider">
              Email Admin
            </label>
            <div className="relative flex items-center bg-black border-2 border-white focus-within:border-accent focus-within:shadow-neo-sm transition-all rounded-none px-3 py-1">
              <FiMail className="text-white w-4 h-4 mr-2 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent border-none outline-none text-white text-sm py-2.5 flex-grow font-bold placeholder-white/30"
                placeholder="admin@ryutopup.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center bg-black border-2 border-white focus-within:border-accent focus-within:shadow-neo-sm transition-all rounded-none px-3 py-1">
              <FiLock className="text-white w-4 h-4 mr-2 shrink-0" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-transparent border-none outline-none text-white text-sm py-2.5 flex-grow font-bold placeholder-white/30"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-accent-red border-2 border-white text-white text-xs font-bold p-3 shadow-neo-sm mt-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-accent border-2 border-accent text-black font-black uppercase text-sm py-3.5 flex items-center justify-center gap-2 shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Memproses..." : "Masuk ke Dashboard"}
            {!isLoading && <FiArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
      
      {/* WARNING TEXT */}
      <div className="mt-8 text-center max-w-xs text-[10px] font-bold text-white/40 leading-relaxed uppercase tracking-widest">
        Halaman ini hanya untuk Administrator. Segala aktivitas akan direkam oleh sistem.
      </div>
    </div>
  );
}
