"use client";

import { useState } from "react";
import Link from "next/link";
import TopupHeader from "@/components/TopupHeader";
import TopupFooter from "@/components/TopupFooter";

// ─── Deteksi server dari SLUG (lebih akurat daripada nama) ────────────────────
type ServerBadge = {
  shortLabel: string;   // "ID" | "MY" | "GL"
  flagUrl: string;      // gambar bendera asli
  bgColor: string;      // warna badge background
  textColor: string;    // warna teks label
};

function getServerBadge(slug: string): ServerBadge | null {
  if (slug === "mobile-legends-indonesia") {
    return {
      shortLabel: "ID",
      flagUrl: "https://flagcdn.com/w40/id.png",
      bgColor: "bg-red-600",
      textColor: "text-white",
    };
  }
  if (slug === "mobile-legends-malaysia") {
    return {
      shortLabel: "MY",
      flagUrl: "https://flagcdn.com/w40/my.png",
      bgColor: "bg-blue-700",
      textColor: "text-white",
    };
  }
  if (slug === "mobile-legends") {
    return {
      shortLabel: "GL",
      flagUrl: "https://flagcdn.com/w40/un.png",
      bgColor: "bg-slate-600",
      textColor: "text-white",
    };
  }
  return null;
}

// Strip suffix server dari nama game untuk tampilan bersih
function cleanGameName(name: string): string {
  return name
    .replace(/\s*\(indonesia\)/gi, "")
    .replace(/\s*\(malaysia\)/gi, "")
    .replace(/\s*\(global\)/gi, "")
    .trim();
}

export default function GameClient({ initialGames }: { initialGames: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGames = initialGames.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-black text-white font-sans min-h-screen flex flex-col antialiased">
      {/* HEADER */}
      <TopupHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-8">

        {/* Page Head */}
        <div className="space-y-3.5 border-b-2 border-white pb-6">
          <span className="text-[11px] font-black tracking-[0.1em] uppercase text-white/70">
            RyuTopup Katalog
          </span>
          <h1 className="text-3xl font-black text-white leading-tight uppercase tracking-wider">Semua Game</h1>
          <p className="text-white/80 text-sm max-w-md font-bold">
            Pilih game favoritmu dan mulai top up secara instan dengan berbagai metode pembayaran aman.
          </p>
        </div>

        {/* Live Filter Info */}
        {searchQuery && (
          <div className="text-xs text-white/70 font-bold uppercase tracking-wider">
            Menampilkan hasil untuk pencarian &quot;<span className="text-white underline">{searchQuery}</span>&quot;
          </div>
        )}

        {/* Game Grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
            {filteredGames.map((game) => {
              const badge = getServerBadge(game.slug);
              const displayName = badge ? cleanGameName(game.name) : game.name;

              return (
                <Link
                  key={game.slug}
                  href={`/${game.slug}`}
                  className="bg-black border-2 border-white overflow-hidden flex flex-col hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-neo transition-all duration-300 group rounded-none"
                >
                  {/* IMAGE */}
                  <div className="w-full aspect-[3/4] relative overflow-hidden bg-black border-b-2 border-white">
                    <img
                      src={game.cover || game.logo}
                      alt={game.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Badge pojok kanan atas: bendera + kode */}
                    {badge && (
                      <div className={`absolute top-0 right-0 ${badge.bgColor} flex items-center gap-1 px-1.5 py-1 border-b-2 border-l-2 border-white`}>
                        <img
                          src={badge.flagUrl}
                          alt={badge.shortLabel}
                          className="h-3.5 w-auto object-cover"
                        />
                        <span className={`text-[9px] font-black uppercase tracking-wider leading-none ${badge.textColor}`}>
                          {badge.shortLabel}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* TEXT */}
                  <div className="p-3.5 flex flex-col justify-between flex-grow bg-black">
                    <div className="font-black text-[13.5px] text-white leading-tight truncate w-full group-hover:underline transition-colors uppercase">
                      {displayName}
                    </div>
                    <div className="text-[11px] text-white/60 mt-1.5 truncate w-full font-bold">
                      {game.developer || "Developer"}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-black border-2 border-dashed border-white rounded-none text-white/70 font-bold">
            Game &quot;{searchQuery}&quot; tidak ditemukan. Silakan cari dengan kata kunci lain.
          </div>
        )}
      </main>

      {/* FOOTER */}
      <TopupFooter />
    </div>
  );
}
