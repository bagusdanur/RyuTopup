"use client";

import { useState, useEffect } from "react";
import { FiBell, FiBellOff } from "react-icons/fi";

export default function SocialProofToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings?key=show_social_proof")
      .then(r => r.json())
      .then(d => setEnabled(d.value !== "false"))
      .catch(() => setEnabled(true));
  }, []);

  const toggle = async () => {
    if (enabled === null) return;
    setSaving(true);
    const next = !enabled;
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "show_social_proof", value: next ? "true" : "false" }),
      });
      setEnabled(next);
    } catch {
      alert("Gagal menyimpan setting");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white text-black border-4 border-black p-4 md:p-6 shadow-neo-lg flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <span className="text-[9px] md:text-xs font-black uppercase tracking-widest bg-black text-white px-1.5 py-0.5 md:px-2 md:py-1">
          Notifikasi Pembelian
        </span>
        <span className={`p-1.5 md:p-2 border-2 border-black hidden sm:block ${enabled ? "bg-accent-green" : "bg-white/20"}`}>
          {enabled ? <FiBell className="w-4 h-4 md:w-5 md:h-5" /> : <FiBellOff className="w-4 h-4 md:w-5 md:h-5" />}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xl font-black font-mono">
          {enabled === null ? "..." : enabled ? "ON" : "OFF"}
        </span>
        <span className="text-[9px] md:text-xs font-bold text-black/50 uppercase tracking-wide">
          Popup &quot;Baru Saja Membeli&quot;
        </span>
      </div>

      <button
        onClick={toggle}
        disabled={saving || enabled === null}
        className={`w-full py-2 text-xs font-black uppercase tracking-wider border-2 border-black transition-all shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
          enabled
            ? "bg-accent-red text-white hover:bg-red-700"
            : "bg-accent-green text-black hover:bg-green-400"
        }`}
      >
        {saving ? "Menyimpan..." : enabled ? "Matikan Popup" : "Aktifkan Popup"}
      </button>
    </div>
  );
}
