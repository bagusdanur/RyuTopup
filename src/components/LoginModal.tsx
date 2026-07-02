"use client";

import { useState } from "react";
import { FiX, FiMail, FiLock, FiAlertCircle } from "react-icons/fi";

interface LoginModalProps {
  close: () => void;
}

export default function LoginModal({ close }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Email dan password harus diisi!");
      return;
    }
    setErrorMsg("");
    alert("Login berhasil (Demo/Mock)! Silakan hubungkan dengan konfigurasi Supabase Anda.");
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-fadeIn">
      <div className="bg-black border-3 border-white rounded-none w-full max-w-md p-6 relative shadow-neo-lg">
        {/* Close Button */}
        <button
          onClick={close}
          className="absolute top-4 right-4 text-white bg-black border-2 border-white hover:bg-white hover:text-black w-8 h-8 flex items-center justify-center rounded-none shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all focus:outline-none cursor-pointer"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2.5 mb-6 pr-6">
          <h2 className="text-lg font-black tracking-wide text-white flex items-center justify-center gap-1">
            <span>MASUK KE</span>
            <span className="bg-white text-black px-1.5 py-0.5 border-2 border-white font-black text-xs">
              RYUTOPUP
            </span>
          </h2>
          <p className="text-xs text-white/70 font-semibold leading-relaxed">
            Masuk untuk melihat riwayat transaksi dan melacak pesanan Anda dengan lebih mudah.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-white tracking-wider uppercase block">
              Alamat Email
            </label>
            <div className="relative flex items-center bg-black border-2 border-white focus-within:shadow-neo hover:shadow-neo rounded-none overflow-hidden transition-all px-3 py-1 text-white">
              <FiMail className="text-white w-4 h-4 mr-2.5 shrink-0" />
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-xs py-3.5 flex-grow font-semibold placeholder-white/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-white tracking-wider uppercase block">
              Password
            </label>
            <div className="relative flex items-center bg-black border-2 border-white focus-within:shadow-neo hover:shadow-neo rounded-none overflow-hidden transition-all px-3 py-1 text-white">
              <FiLock className="text-white w-4 h-4 mr-2.5 shrink-0" />
              <input
                type="password"
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-xs py-3.5 flex-grow font-semibold placeholder-white/40"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2.5 text-xs text-white bg-black p-3.5 rounded-none border-2 border-white shadow-neo-sm">
              <FiAlertCircle className="shrink-0 w-4 h-4 text-white" />
              <span className="font-bold">{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 font-black text-xs text-black bg-white border-2 border-white shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all py-3.5 uppercase tracking-wide cursor-pointer"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}

