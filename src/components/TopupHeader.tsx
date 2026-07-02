"use client";

import { useState } from "react";
import Link from "next/link";
import { FiSearch, FiMenu, FiX, FiHome, FiMessageCircle } from "react-icons/fi";
import { FaGamepad } from "react-icons/fa";

interface TopupHeaderProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export default function TopupHeader({ searchQuery = "", onSearchChange }: TopupHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const csWhatsapp = process.env.NEXT_PUBLIC_CS_WHATSAPP || "628123456789";

  return (
    <>
      <header className="sticky top-0 z-40 bg-black border-b-3 border-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-[76px] flex items-center justify-between gap-4">
          
          {/* LOGO RYUTOPUP */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0 select-none">
            <span className="text-xl font-black italic tracking-wide text-white flex items-center gap-1">
              <span>RYU</span>
              <span className="bg-accent text-black px-2 py-0.5 border-2 border-accent not-italic font-black text-sm shadow-neo-sm">
                TOPUP
              </span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              className="px-4 py-2 border-2 border-transparent hover:border-accent-orange hover:bg-accent-orange hover:text-black text-sm font-extrabold text-white transition-all uppercase tracking-wider hover:shadow-neo-sm rounded-none"
            >
              Beranda
            </Link>
            <Link
              href="/game"
              className="px-4 py-2 border-2 border-transparent hover:border-accent-purple hover:bg-accent-purple hover:text-black text-sm font-extrabold text-white transition-all uppercase tracking-wider hover:shadow-neo-sm rounded-none"
            >
              Semua Game
            </Link>
            <Link
              href="/lacak"
              className="px-4 py-2 border-2 border-transparent hover:border-accent hover:bg-accent hover:text-black text-sm font-extrabold text-white transition-all uppercase tracking-wider hover:shadow-neo-sm rounded-none"
            >
              Lacak Pesanan
            </Link>
          </nav>

          {/* SEARCH BAR */}
          <div className="hidden md:flex flex-1 max-w-[320px] items-center gap-2 bg-black border-2 border-white hover:shadow-neo-accent focus-within:shadow-neo-accent transition-all px-4 py-2 text-white">
            <FiSearch className="w-[16px] h-[16px] text-white shrink-0" />
            <input
              type="text"
              placeholder="Cari game favoritmu..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="bg-transparent border-none outline-none text-white w-full text-xs font-semibold placeholder-white/50"
            />
          </div>

          {/* CS BUTTON / MOBILE HAMBURGER */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={`https://wa.me/${csWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center justify-center gap-2 font-black text-xs text-black bg-accent border-2 border-accent shadow-neo-orange hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all px-4.5 py-2.5 uppercase tracking-wide rounded-none"
            >
              <FiMessageCircle className="w-4 h-4 text-black" />
              Hubungi CS
            </a>

            {/* MOBILE HAMBURGER TOGGLE */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex w-[40px] h-[40px] items-center justify-center bg-black border-2 border-accent shadow-neo-accent hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none text-white transition-all rounded-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FiX className="w-5 h-5 text-accent" /> : <FiMenu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* MOBILE DROPDOWN NAV */}
        {isMenuOpen && (
          <div className="md:hidden border-t-3 border-white bg-black px-4 py-6 flex flex-col gap-5 animate-fadeIn">
            {/* SEARCH BAR MOBILE */}
            <div className="flex items-center gap-2 bg-black border-2 border-white px-4 py-2.5 text-white">
              <FiSearch className="w-4 h-4 text-white shrink-0" />
              <input
                type="text"
                placeholder="Cari game favoritmu..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="bg-transparent border-none outline-none text-white w-full text-xs font-semibold placeholder-white/50"
              />
            </div>

            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 border-2 border-transparent hover:border-accent-orange hover:bg-accent-orange hover:text-black text-sm font-bold text-white transition-all uppercase tracking-wider rounded-none"
              >
                <FiHome className="w-[18px] h-[18px]" />
                <span>Beranda</span>
              </Link>
              <Link
                href="/game"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 border-2 border-transparent hover:border-accent-purple hover:bg-accent-purple hover:text-black text-sm font-bold text-white transition-all uppercase tracking-wider rounded-none"
              >
                <FaGamepad className="w-[18px] h-[18px]" />
                <span>Semua Game</span>
              </Link>
              <Link
                href="/lacak"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 border-2 border-transparent hover:border-accent hover:bg-accent hover:text-black text-sm font-bold text-white transition-all uppercase tracking-wider rounded-none"
              >
                <FiSearch className="w-[18px] h-[18px]" />
                <span>Lacak Pesanan</span>
              </Link>
            </nav>

            <div className="pt-4 border-t-2 border-white">
              <a
                href={`https://wa.me/${csWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 font-black text-sm text-black bg-accent-green border-2 border-accent-green shadow-neo-purple hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all py-3.5 uppercase tracking-wide rounded-none"
              >
                <FiMessageCircle className="w-4 h-4 text-black" />
                Hubungi WhatsApp CS
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
