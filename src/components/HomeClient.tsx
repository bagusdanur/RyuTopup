"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TopupHeader from "@/components/TopupHeader";
import TopupFooter from "@/components/TopupFooter";
import TestimonialSlider from "@/components/TestimonialSlider";

import { FaGamepad, FaCrown, FaTrophy } from "react-icons/fa";

export default function HomeClient({ initialGames, initialFlashSales, initialTopSpenders = [] }: { initialGames: any[], initialFlashSales: any[], initialTopSpenders?: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const getSecondsUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  };

  const [timeLeft, setTimeLeft] = useState(0);

  // Flash sale countdown timer (resets every midnight)
  useEffect(() => {
    // Set initial time
    setTimeLeft(getSecondsUntilMidnight());
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) return getSecondsUntilMidnight();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Filter games based on search query
  const filteredGames = initialGames.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mask WA number (e.g., 081234xxxx56)
  const maskWaNumber = (wa: string) => {
    if (!wa || wa.length < 8) return wa;
    const start = wa.substring(0, 4);
    const end = wa.substring(wa.length - 2);
    return `${start}****${end}`;
  };

  // Derived sorted list
  const sortedFlashSales = initialFlashSales ? [...initialFlashSales].sort((a, b) => a.price - b.price) : [];

  const shortenName = (name: string, gameName: string) => {
    let shortened = name;
    const gameUpper = gameName.toUpperCase();
    const nameUpper = shortened.toUpperCase();
    
    // Remove exact game name prefix
    if (nameUpper.startsWith(gameUpper)) {
      shortened = shortened.substring(gameUpper.length).trim();
    }
    
    // Remove specific common clutter
    shortened = shortened.replace(/MOBILE LEGENDS:?\s*BANG BANG/gi, "").trim();
    shortened = shortened.replace(/MOBILE LEGENDS/gi, "").trim();
    shortened = shortened.replace(/\(INDONESIA\)|\(GLOBAL\)|\(ID\)|\(REGION INDONESIA\)/gi, "").trim();
    shortened = shortened.replace(/^-+|-+$/g, "").trim();
    
    if (!shortened) return name; // fallback
    
    // Title Case
    const words = shortened.toLowerCase().split(' ');
    for (let i = 0; i < words.length; i++) {
      if (words[i]) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
      }
    }
    shortened = words.join(' ');
    
    // Fix specific acronyms
    shortened = shortened.replace(/\bWdp\b/g, "WDP");
    shortened = shortened.replace(/\bVip\b/g, "VIP");
    shortened = shortened.replace(/\bMcl\b/g, "MCL");
    
    return shortened;
  };

  return (
    <div className="bg-black text-white font-sans min-h-screen flex flex-col antialiased">
      {/* HEADER */}
      <TopupHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-10">
        
        {/* 1. FLASH SALE */}
        {sortedFlashSales && sortedFlashSales.length > 0 && (
          <section id="flash-sale" className="space-y-5">
            <div className="flex items-center justify-between gap-3.5 flex-wrap">
              <div className="flex items-center gap-2.5 font-black text-lg md:text-xl text-white uppercase tracking-wider">
                <span className="w-[32px] h-[32px] border-2 border-accent-orange bg-accent-orange flex items-center justify-center text-black shadow-neo-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>
                </span>
                Flash Sale — Penawaran Terbatas!
              </div>
              <div className="flex items-center gap-2 bg-black border-2 border-white px-3.5 py-1.5 text-xs text-white font-black uppercase tracking-wider">
                Berakhir dalam <span className="bg-accent-orange border border-accent-orange px-2 py-0.5 text-black font-mono font-black tabular-nums ml-1.5 shadow-neo-sm">{formatCountdown(timeLeft)}</span>
              </div>
            </div>

            <div className="grid grid-flow-col auto-cols-[230px] gap-4 overflow-x-auto pb-2 scroll-smooth no-scrollbar">
              {sortedFlashSales.map((fs) => (
                <Link key={fs.id} className="relative bg-black border-2 border-white p-4 flex flex-col gap-2.5 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-neo transition-all duration-200 w-[230px] shrink-0 scroll-snap-align-start rounded-none group" href={`/${fs.games.slug}`}>
                  {fs.discount && (
                    <span className="absolute top-3.5 right-3.5 bg-accent-red text-white border-2 border-accent-red text-[11px] font-black px-2.5 py-0.5 select-none uppercase shadow-neo-sm">
                      {fs.discount} OFF
                    </span>
                  )}
                  <span className="text-[10.5px] font-black tracking-wider uppercase text-white/70">{fs.games.name}</span>
                  
                  <div className="flex items-center gap-2.5">
                    {fs.icon ? (
                      fs.icon.startsWith("http") ? (
                        <img src={fs.icon} alt={fs.name} className="w-10 h-10 border-2 border-white object-cover bg-black rounded-none" />
                      ) : (
                        <div className="w-10 h-10 border-2 border-white bg-black flex items-center justify-center text-xl">{fs.icon}</div>
                      )
                    ) : null}
                    <div className="text-[14px] font-black leading-[1.3] text-white tracking-wide group-hover:underline">
                      {shortenName(fs.name, fs.games.name)}
                    </div>
                  </div>
                  
                  <div className="text-[14.5px] font-black text-accent-yellow mt-auto flex items-center">
                    {fs.original_price > fs.price && (
                      <span className="text-[11.5px] text-white/50 line-through font-bold mr-1.5 font-mono">Rp {fs.original_price.toLocaleString("id-ID")}</span>
                    )}
                    <span className="font-mono">Rp {fs.price.toLocaleString("id-ID")}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
        {/* 2. GAME SELECTION */}
        <section id="games" className="space-y-6 pt-2">
          {/* Section head */}
          <div className="flex justify-between items-end gap-4">
            <div>
              <span className="text-[11px] font-black tracking-[0.12em] uppercase text-white/70 flex items-center gap-1.5 mb-1.5">
                Pilih Game
              </span>
              <h2 className="text-2xl font-black text-white leading-tight uppercase tracking-wide">Top Up Game</h2>
            </div>
            <Link href="/game" className="text-[13px] font-black text-black bg-accent border-2 border-accent shadow-neo-orange hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none px-4 py-2 transition-all uppercase tracking-wide rounded-none">
              Lihat Semua Game →
            </Link>
          </div>

          {/* Game Grid */}
          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {filteredGames.map((game) => (
                <Link
                  key={game.slug}
                  href={`/${game.slug}`}
                  className="bg-black border-2 border-white overflow-hidden flex flex-col hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-neo transition-all duration-300 group rounded-none"
                >
                  <div className="w-full aspect-[3/4] relative overflow-hidden bg-black border-b-2 border-white">
                    <img
                      src={game.cover || game.logo}
                      alt={game.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3.5 flex flex-col justify-between flex-grow bg-black">
                    <div className="font-black text-[13px] text-white leading-tight truncate w-full group-hover:underline transition-colors uppercase">
                      {game.name}
                    </div>
                    <div className="text-[11px] text-white/60 mt-1.5 truncate w-full font-bold">
                      {game.developer || "Developer"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-black border-2 border-dashed border-white rounded-none text-white/70 font-bold">
              Game tidak ditemukan.
            </div>
          )}
        </section>

        {/* HOW TO TOP UP SECTION */}
        <section id="how-to" className="space-y-6 pt-4 border-t-2 border-white/10 border-dashed">
          <div>
            <span className="text-[11px] font-black tracking-[0.12em] uppercase text-accent flex items-center gap-1.5 mb-1">
              Panduan Pengguna
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
              Cara Mudah Top Up di RyuTopup
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="bg-black border-4 border-white p-5 hover:translate-x-1 hover:-translate-y-1 hover:shadow-neo-orange transition-all duration-200 relative group">
              <div className="absolute top-4 right-4 text-3xl font-black italic opacity-25 group-hover:opacity-40 transition-opacity">01</div>
              <div className="w-12 h-12 bg-accent-orange border-2 border-black flex items-center justify-center text-black font-black text-xl shadow-neo-sm mb-4">
                🎮
              </div>
              <h3 className="text-[15px] font-black uppercase text-white tracking-wide mb-1">1. Pilih Game &amp; Item</h3>
              <p className="text-[12px] text-white/70 font-bold leading-relaxed">
                Pilih game favoritmu, tentukan nominal diamond atau membership yang ingin kamu beli dari daftar produk kami.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-black border-4 border-white p-5 hover:translate-x-1 hover:-translate-y-1 hover:shadow-neo-purple transition-all duration-200 relative group">
              <div className="absolute top-4 right-4 text-3xl font-black italic opacity-25 group-hover:opacity-40 transition-opacity">02</div>
              <div className="w-12 h-12 bg-accent-purple border-2 border-black flex items-center justify-center text-black font-black text-xl shadow-neo-sm mb-4">
                🔑
              </div>
              <h3 className="text-[15px] font-black uppercase text-white tracking-wide mb-1">2. Masukkan Data Akun</h3>
              <p className="text-[12px] text-white/70 font-bold leading-relaxed">
                Masukkan User ID &amp; Zone ID game kamu dengan benar pada form. Validasi username otomatis akan muncul jika tersedia.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-black border-4 border-white p-5 hover:translate-x-1 hover:-translate-y-1 hover:shadow-neo-green transition-all duration-200 relative group">
              <div className="absolute top-4 right-4 text-3xl font-black italic opacity-25 group-hover:opacity-40 transition-opacity">03</div>
              <div className="w-12 h-12 bg-accent-green border-2 border-black flex items-center justify-center text-black font-black text-xl shadow-neo-sm mb-4">
                ⚡
              </div>
              <h3 className="text-[15px] font-black uppercase text-white tracking-wide mb-1">3. Bayar &amp; Selesai</h3>
              <p className="text-[12px] text-white/70 font-bold leading-relaxed">
                Pilih metode pembayaran (QRIS / VA), lakukan pembayaran. Sistem akan memproses top up secara otomatis instan!
              </p>
            </div>
          </div>
        </section>

        {/* 3. LEADERBOARD */}
        {initialTopSpenders && initialTopSpenders.length > 0 && (
          <section id="leaderboard" className="space-y-5 pt-2">
            <div className="flex items-center gap-2.5 font-black text-lg md:text-xl text-white uppercase tracking-wider">

              <span className="w-[32px] h-[32px] border-2 border-accent bg-accent flex items-center justify-center text-black shadow-neo-sm">
                <FaTrophy className="w-4.5 h-4.5" />
              </span>
              Top Spender Bulan Ini
            </div>
            
            <div className="grid grid-flow-col auto-cols-[85%] md:auto-cols-auto md:grid-cols-3 gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth no-scrollbar">
              {initialTopSpenders.slice(0, 3).map((user, index) => {
                const isFirst = index === 0;
                return (
                  <div key={index} className={`flex items-center gap-4 bg-black border-2 ${isFirst ? 'border-accent shadow-neo-accent' : 'border-white shadow-neo'} p-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-none relative overflow-hidden group snap-align-start shrink-0`}>
                    {isFirst && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-accent transform rotate-45 translate-x-8 -translate-y-8 flex items-end justify-center pb-2">
                        <FaCrown className="text-black w-4 h-4 -rotate-45" />
                      </div>
                    )}
                    <div className={`w-[45px] h-[45px] shrink-0 border-2 flex items-center justify-center font-black text-lg ${isFirst ? 'bg-accent border-accent text-black' : 'bg-black border-white text-white'}`}>
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white tracking-widest">{maskWaNumber(user.wa_number)}</h4>
                      <div className="text-xs font-bold text-white/50 uppercase mt-0.5">{user.total_orders} Pesanan</div>
                      <div className="text-sm font-mono font-black text-accent-green mt-1">Rp {Number(user.total_spent).toLocaleString("id-ID")}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. TRUST STRIP */}
        <section className="flex overflow-x-auto md:grid md:grid-cols-3 gap-4 pb-2 md:pb-0 no-scrollbar snap-x snap-mandatory scroll-smooth pt-4 border-t-2 border-white/20 border-dashed">
          {/* Instant: Orange Theme */}
          <div className="flex items-center gap-3.5 bg-black border-2 border-white p-4 shrink-0 w-[250px] md:w-auto snap-align-start shadow-neo-orange hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-none">
            <div className="w-[40px] h-[40px] shrink-0 bg-accent-orange border-2 border-accent-orange text-black flex items-center justify-center font-black">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-[18px] h-[18px]"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>
            </div>
            <div>
              <h4 className="font-black text-[13.5px] text-white block uppercase tracking-wide">Pengiriman Instant</h4>
              <span className="text-[11.5px] text-white/70 block leading-tight font-bold">Diamond masuk cepat</span>
            </div>
          </div>

          {/* Secure: Yellow Theme */}
          <div className="flex items-center gap-3.5 bg-black border-2 border-white p-4 shrink-0 w-[250px] md:w-auto snap-align-start shadow-neo-accent hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-none">
            <div className="w-[40px] h-[40px] shrink-0 bg-accent border-2 border-accent text-black flex items-center justify-center font-black">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-[18px] h-[18px]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
            </div>
            <div>
              <h4 className="font-black text-[13.5px] text-white block uppercase tracking-wide">Pembayaran Aman</h4>
              <span className="text-[11.5px] text-white/70 block leading-tight font-bold">QRIS, e-wallet &amp; VA</span>
            </div>
          </div>

          {/* Support: Purple Theme */}
          <div className="flex items-center gap-3.5 bg-black border-2 border-white p-4 shrink-0 w-[250px] md:w-auto snap-align-start shadow-neo-purple hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-none">
            <div className="w-[40px] h-[40px] shrink-0 bg-accent-purple border-2 border-accent-purple text-black flex items-center justify-center font-black">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-[18px] h-[18px]"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
            </div>
            <div>
              <h4 className="font-black text-[13.5px] text-white block uppercase tracking-wide">CS Siap 24/7</h4>
              <span className="text-[11.5px] text-white/70 block leading-tight font-bold">Support ramah &amp; cepat</span>
            </div>
          </div>
        </section>
      </main>

      {/* TESTIMONIALS */}
      <TestimonialSlider />

      {/* FOOTER */}
      <TopupFooter />
    </div>
  );
}
