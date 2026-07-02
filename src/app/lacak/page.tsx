"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FiSearch, 
  FiCopy, 
  FiCheck, 
  FiClock, 
  FiAlertCircle, 
  FiUser, 
  FiShoppingBag, 
  FiCreditCard,
  FiCalendar
} from "react-icons/fi";
import { FaGamepad, FaSpinner } from "react-icons/fa";
import TopupHeader from "@/components/TopupHeader";
import TopupFooter from "@/components/TopupFooter";
import { GAME_DATA } from "@/lib/gameData";

// Mock data for predefined sample invoices
interface TrackedOrder {
  invoiceId: string;
  gameName: string;
  gameId: string;
  item: string;
  targetId: string;
  paymentMethod: string;
  price: string;
  date: string;
  status: "pending" | "processing" | "success" | "failed";
}

const SAMPLE_ORDERS: Record<string, TrackedOrder> = {
  "RTP-987213": {
    invoiceId: "RTP-987213",
    gameName: "Mobile Legends",
    gameId: "mobile-legends",
    item: "284 Diamonds (254 + 30 Bonus)",
    targetId: "12345678 (2991)",
    paymentMethod: "QRIS (ShopeePay)",
    price: "Rp 84.500",
    date: "20 Juni 2026, 15:30 WIB",
    status: "success"
  },
  "RTP-776219": {
    invoiceId: "RTP-776219",
    gameName: "PUBG Mobile",
    gameId: "pubg-mobile",
    item: "325 Unknown Cash",
    targetId: "5821904712",
    paymentMethod: "GoPay",
    price: "Rp 72.000",
    date: "20 Juni 2026, 18:45 WIB",
    status: "processing"
  },
  "RTP-312904": {
    invoiceId: "RTP-312904",
    gameName: "Genshin Impact",
    gameId: "genshin-impact",
    item: "Blessing of the Welkin Moon",
    targetId: "802194122 (Asia)",
    paymentMethod: "Mandiri Virtual Account",
    price: "Rp 79.000",
    date: "20 Juni 2026, 19:10 WIB",
    status: "pending"
  }
};

export default function LacakPesananPage() {
  const csWhatsapp = process.env.NEXT_PUBLIC_CS_WHATSAPP || "628123456789";
  const [searchId, setSearchId] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchedOrder, setSearchedOrder] = useState<TrackedOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Extract item icon from GAME_DATA
  const gameData = searchedOrder ? GAME_DATA[searchedOrder.gameId] : null;
  const itemData = gameData ? gameData.items.find((i: any) => i.name === searchedOrder?.item) : null;
  const itemIcon = itemData?.icon;

  const handleSearch = async (invoiceId: string) => {
    const trimmedId = invoiceId.trim();
    if (!trimmedId) {
      setErrorMsg("Silakan masukkan Nomor Invoice terlebih dahulu.");
      setSearchedOrder(null);
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSearchedOrder(null);

    try {
      const res = await fetch(`/api/topup/track?invoiceId=${encodeURIComponent(trimmedId)}`);
      const data = await res.json();

      if (!res.ok) {
        // Fallback to sample data for local testing if database doesn't have it
        const upperId = trimmedId.toUpperCase();
        if (SAMPLE_ORDERS[upperId]) {
          setSearchedOrder(SAMPLE_ORDERS[upperId]);
        } else {
          setErrorMsg(data.error || "Pesanan tidak ditemukan.");
        }
      } else {
        setSearchedOrder(data);
      }
    } catch (err: any) {
      setErrorMsg("Gagal menghubungi server untuk melacak pesanan.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-search from URL query parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryInvoiceId = params.get("invoiceId");
      if (queryInvoiceId) {
        const uppercaseId = queryInvoiceId.toUpperCase();
        setSearchId(uppercaseId);
        handleSearch(uppercaseId);
      }
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-black text-white font-sans min-h-screen flex flex-col antialiased">
      {/* HEADER */}
      <TopupHeader searchQuery="" onSearchChange={() => {}} />

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 py-12 space-y-8">
        
        {/* PAGE TITLE */}
        <div className="text-center space-y-3.5">
          <h1 className="text-3xl md:text-4xl font-black tracking-wide flex items-center justify-center gap-2">
            <span>LACAK</span>
            <span className="bg-white text-black px-2.5 py-0.5 border-2 border-white font-black text-xl md:text-2xl tracking-normal">
              PESANAN
            </span>
          </h1>
          <p className="text-xs md:text-sm text-white/70 max-w-md mx-auto font-semibold">
            Pantau status transaksi top-up game Anda secara real-time. Masukkan nomor invoice di bawah.
          </p>
        </div>

        {/* SEARCH BOX CARD */}
        <div className="bg-black border-2 border-white p-6 shadow-neo rounded-none max-w-xl mx-auto">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(searchId);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label htmlFor="invoice-search" className="text-xs font-black text-white tracking-wider uppercase block">
                Nomor Invoice / Pesanan
              </label>
              <div className="relative flex items-center bg-black border-2 border-white focus-within:shadow-neo rounded-none overflow-hidden transition-all px-3 py-1">
                <FiSearch className="text-white w-5 h-5 mr-2 shrink-0" />
                <input
                  id="invoice-search"
                  type="text"
                  placeholder="Contoh: RTP-987213"
                  value={searchId}
                  onChange={(e) => {
                    setSearchId(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  className="bg-transparent border-none outline-none text-white text-sm py-3.5 flex-grow placeholder-white/40 font-bold"
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
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 font-black text-xs text-black bg-accent border-2 border-accent shadow-neo-orange hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all py-3.5 uppercase tracking-wide cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin w-4 h-4" />
                  Mencari...
                </>
              ) : (
                <>
                  <FiSearch className="w-4 h-4" />
                  Lacak Sekarang
                </>
              )}
            </button>
          </form>


        </div>

        {/* RESULTS CARD */}
        {searchedOrder && (
          <div className="bg-black border-2 border-white shadow-neo-lg rounded-none transition-all animate-fadeIn space-y-4 max-w-xl mx-auto p-5">
            {/* Receipts Header */}
            <div className="flex justify-between items-start gap-4 pb-3 border-b-2 border-white">
              <div className="space-y-0.5">
                <span className="text-[10px] text-white/50 font-black uppercase tracking-wider block">No. Invoice</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-white font-mono break-all tracking-wider">{searchedOrder.invoiceId}</span>
                  <button
                    onClick={() => copyToClipboard(searchedOrder.invoiceId)}
                    className="p-0.5 text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Salin No. Invoice"
                  >
                    {copiedId === searchedOrder.invoiceId ? <FiCheck className="text-white w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-white/50 font-black uppercase tracking-wider block">Status</span>
                <span className={`text-xs font-black block uppercase tracking-wider ${
                  searchedOrder.status === "success" ? "text-emerald-400" :
                  searchedOrder.status === "processing" ? "text-cyan-400" : "text-amber-400"
                }`}>
                  {searchedOrder.status === "success" && "Berhasil"}
                  {searchedOrder.status === "processing" && "Diproses"}
                  {searchedOrder.status === "pending" && "Menunggu Pembayaran"}
                </span>
              </div>
            </div>

            {/* Customer / Game Info Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs border-b border-white/20 border-dashed pb-4">
              <div>
                <span className="text-white/50 font-black uppercase block text-[9.5px] tracking-wider mb-0.5">Game</span>
                <span className="font-bold text-white uppercase break-words">{searchedOrder.gameName}</span>
              </div>
              <div>
                <span className="text-white/50 font-black uppercase block text-[9.5px] tracking-wider mb-0.5">Metode Bayar</span>
                <span className="font-bold text-white uppercase break-words">{searchedOrder.paymentMethod}</span>
              </div>
              <div>
                <span className="text-white/50 font-black uppercase block text-[9.5px] tracking-wider mb-0.5">ID Pelanggan</span>
                <span className="font-bold text-white font-mono break-all">{searchedOrder.targetId}</span>
              </div>
              <div>
                <span className="text-white/50 font-black uppercase block text-[9.5px] tracking-wider mb-0.5">Tanggal</span>
                <span className="font-bold text-white uppercase">{searchedOrder.date}</span>
              </div>
            </div>

            {/* Line Items Pricing */}
            <div className="space-y-2 text-xs font-bold pt-1">
              <div className="flex justify-between items-start gap-4 text-white">
                <div className="flex items-center gap-2">
                  {itemIcon && (
                    <span className="w-4 h-4 md:w-5 md:h-5 shrink-0 flex items-center justify-center">
                      {typeof itemIcon === "string" && itemIcon.startsWith("http") ? (
                        <img src={itemIcon} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[12px] md:text-[14px]">{itemIcon}</span>
                      )}
                    </span>
                  )}
                  <span className="uppercase tracking-wide">{searchedOrder.item}</span>
                </div>
                <span className="shrink-0 font-mono">{searchedOrder.price}</span>
              </div>
            </div>

            {/* Whatsapp Box for Pending status */}
            {searchedOrder.status === "pending" && (
              <div className="bg-black border border-white/20 p-4 space-y-3 rounded-none shadow-neo-sm">
                <p className="text-[11.5px] text-white/85 leading-relaxed font-bold">
                  Untuk mempercepat proses verifikasi dan pengisian diamond, silakan kirim bukti pembayaran atau lakukan konfirmasi langsung ke WhatsApp Customer Service kami.
                </p>
                <a
                  href={`https://wa.me/${csWhatsapp}?text=${encodeURIComponent(
                    `Halo CS RyuTopup, saya ingin mengonfirmasi pembayaran untuk transaksi berikut:\n\n` +
                    `• No. Invoice: ${searchedOrder.invoiceId}\n` +
                    `• Game: ${searchedOrder.gameName}\n` +
                    `• Item: ${searchedOrder.item}\n` +
                    `• Target ID: ${searchedOrder.targetId}\n` +
                    `• Metode Bayar: ${searchedOrder.paymentMethod}\n` +
                    `• Total Bayar: ${searchedOrder.price}\n\n` +
                    `Berikut saya sertakan bukti transfer pembayarannya. Mohon segera diproses ya Kak, terima kasih!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 font-black text-xs text-black bg-white border-2 border-white shadow-neo py-3 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none uppercase tracking-wider cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5"><path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.46 3.473 1.332 4.984L2 22l5.244-1.376a9.92 9.92 0 0 0 4.767 1.21h.005c5.506 0 9.987-4.483 9.987-9.99A9.957 9.957 0 0 0 12.012 2zm0 1.832c4.498 0 8.156 3.658 8.156 8.156 0 4.5-3.658 8.158-8.156 8.158a8.106 8.106 0 0 1-4.148-1.129l-.298-.176-3.084.81.823-3.006-.194-.308a8.118 8.118 0 0 1-1.127-4.19c.002-4.498 3.66-8.155 8.158-8.155zm-1.846 2.378c-.256-.008-.528.058-.724.238-.344.316-.948.966-.948 2.355 0 1.39 1.01 2.73 1.15 2.92.14.19 1.94 3.03 4.76 4.14.67.26 1.19.42 1.6.55.67.21 1.28.18 1.77.11.54-.08 1.67-.68 1.9-1.34.23-.66.23-1.22.16-1.34-.07-.12-.26-.19-.55-.33-.29-.14-1.7-.84-1.96-.94-.26-.09-.45-.14-.64.14-.19.28-.73.94-.9 1.13-.16.19-.33.21-.62.07-.29-.14-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.12-.59.13-.13.29-.34.44-.5.15-.17.2-.28.3-.47.1-.19.05-.36-.02-.5-.07-.14-.64-1.54-.87-2.1-.23-.55-.47-.48-.64-.49z"/></svg>
                  Kirim Konfirmasi ke WhatsApp
                </a>
              </div>
            )}

            {/* Action Footer */}
            <div className="pt-4 border-t-2 border-white flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-white/50 font-bold uppercase tracking-wider text-center w-full">
              <span>Ada masalah dengan transaksi Anda? Silakan hubungi CS kami.</span>
              <Link href="/" className="text-white font-black hover:underline shrink-0">
                Kembali ke Beranda →
              </Link>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <TopupFooter />
    </div>
  );
}
