"use client";

import { useState } from "react";
import Link from "next/link";
import TopupHeader from "@/components/TopupHeader";
import TopupFooter from "@/components/TopupFooter";

const GAMES = [
  {
    id: "mobile-legends",
    name: "Mobile Legends",
    publisher: "MLBB Indonesia",
    image: "https://sin1.contabostorage.com/20ab04d5e89c402888b2ba814feec970:xc-alk12091as-assets-10x129-empeshop/media/file-1778309830-6olb9uli-file-1746236477-ldmdsn2k-1.jpg?w=160&q=75",
  },
  {
    id: "magic-chess-gogo",
    name: "Magic Chess GOGO",
    publisher: "Moonton",
    image: "https://sin1.contabostorage.com/20ab04d5e89c402888b2ba814feec970:xc-alk12091as-assets-10x129-empeshop/media/file-1746236484-0j9idri1-4.jpg?w=160&q=75",
  },
  {
    id: "pubg-mobile",
    name: "PUBG Mobile",
    publisher: "Tencent",
    image: "https://sin1.contabostorage.com/20ab04d5e89c402888b2ba814feec970:xc-alk12091as-assets-10x129-empeshop/media/file-1746236479-aqgje8ve-2.jpg?w=160&q=75",
  },
  {
    id: "free-fire",
    name: "Free Fire",
    publisher: "Garena",
    image: "https://sin1.contabostorage.com/20ab04d5e89c402888b2ba814feec970:xc-alk12091as-assets-10x129-empeshop/media/file-1746236466-2bajaevq-5.jpg?w=160&q=75",
  },
  {
    id: "honor-of-kings",
    name: "Honor Of Kings",
    publisher: "Tencent",
    image: "https://sin1.contabostorage.com/20ab04d5e89c402888b2ba814feec970:xc-alk12091as-assets-10x129-empeshop/media/file-1746236481-ji77o8i6-3.jpg?w=160&q=75",
  },
  {
    id: "genshin-impact",
    name: "Genshin Impact",
    publisher: "HoYoverse",
    image: "https://sin1.contabostorage.com/20ab04d5e89c402888b2ba814feec970:xc-alk12091as-assets-10x129-empeshop/media/file-1746236471-s2qup57v-8.jpg?w=160&q=75",
  },
];

export default function GamePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGames = GAMES.filter((game) =>
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
            {filteredGames.map((game) => (
              <Link
                key={game.id}
                href={`/${game.id}`}
                className="bg-black border-2 border-white overflow-hidden flex flex-col hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-neo transition-all duration-300 group rounded-none"
              >
                <div className="w-full aspect-[3/4] relative overflow-hidden bg-black border-b-2 border-white">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3.5 flex flex-col justify-between flex-grow bg-black">
                  <div className="font-black text-[13.5px] text-white leading-tight truncate w-full group-hover:underline transition-colors uppercase">
                    {game.name}
                  </div>
                  <div className="text-[11px] text-white/60 mt-1.5 truncate w-full font-bold">
                    {game.publisher}
                  </div>
                </div>
              </Link>
            ))}
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
