"use client";

import Link from "next/link";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FiHeadphones } from "react-icons/fi";

export default function TopupFooter() {
  const csWhatsapp = process.env.NEXT_PUBLIC_CS_WHATSAPP || "628123456789";

  return (
    <footer className="mt-16 border-t-3 border-white bg-black text-white text-xs">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 flex flex-col gap-8">
        
        {/* LOGO & BRAND DETAILS */}
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-1.5 shrink-0 select-none self-start">
            <span className="text-xl font-black italic tracking-wide text-white flex items-center gap-1">
              <span>RYU</span>
              <span className="bg-white text-black px-2 py-0.5 border-2 border-white not-italic font-black text-sm">
                TOPUP
              </span>
            </span>
          </Link>
          <p className="text-white/70 leading-relaxed max-w-xl text-[12px] font-medium">
            Top-Up Game Favorit Kamu Di RyuTopup Agar Main Game Semakin Seru. Pengiriman Cepat Dan Berbagai Metode Pembayaran Yang Lengkap.
          </p>
        </div>

        {/* MID GRID: LINKS & ACTIONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 border-t-2 border-white pt-8">
          
          {/* COL 1: PETA SITUS */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-white">
              Peta Situs
            </h4>
            <ul className="flex flex-col gap-2.5 text-[13px] text-white/80 font-bold">
              <li>
                <Link href="/" className="hover:underline">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/game" className="hover:underline">
                  Semua Game
                </Link>
              </li>
              <li>
                <Link href="/lacak" className="hover:underline">
                  Lacak Pesanan
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 2: TOP UP LAINNYA */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-white">
              Top Up Lainnya
            </h4>
            <ul className="flex flex-col gap-2.5 text-[13px] text-white/80 font-bold">
              <li>
                <Link href="/mobile-legends" className="hover:underline">
                  Mobile Legends
                </Link>
              </li>
              <li>
                <Link href="/free-fire" className="hover:underline">
                  Free Fire
                </Link>
              </li>
              <li>
                <Link href="/pubg-mobile" className="hover:underline">
                  PUBG Mobile
                </Link>
              </li>
              <li>
                <Link href="/genshin-impact" className="hover:underline">
                  Genshin Impact
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 3: IKUTI KAMI */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-white">
              Ikuti Kami
            </h4>
            <div className="flex gap-3.5 items-center mt-1">
              <a
                href="https://www.instagram.com/empe.shop/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 border-2 border-white bg-black hover:bg-white hover:text-black flex items-center justify-center text-white transition-all shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              >
                <FaInstagram className="w-[17px] h-[17px]" />
              </a>
              <a
                href={`https://wa.me/${csWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 border-2 border-white bg-black hover:bg-white hover:text-black flex items-center justify-center text-white transition-all shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              >
                <FaWhatsapp className="w-[17px] h-[17px]" />
              </a>
            </div>
          </div>

          {/* COL 4: BANTUAN PELANGGAN */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-white">
              Bantuan Pelanggan
            </h4>
            <div className="mt-1">
              <a
                href={`https://wa.me/${csWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white border-2 border-white text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none px-4 py-2.5 text-[12.5px] font-black shadow-neo transition-all cursor-pointer uppercase tracking-wider"
              >
                Hubungi Kami
                <FiHeadphones className="w-[14px] h-[14px] text-black" />
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM STRIP */}
      <div className="border-t-2 border-white py-4.5 bg-black">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/70 text-[12.5px] font-bold">
          <span>© 2026 RyuTopup. Semua Hak Cipta</span>
          <Link href="/syarat-ketentuan" className="hover:underline">
            Syarat &amp; Ketentuan Pengguna
          </Link>
        </div>
      </div>
    </footer>
  );
}
