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

// Mock data for predefined sample invoices
interface TrackedOrder {
  invoiceId: string;
  gameName: string;
  gameId: string;
  item: string;
  targetId: string;
  paymentMethod: string;
  price: string;
  priceBase?: number;
  promoCode?: string;
  discountAmount?: number;
  date: string;
  status: "pending" | "processing" | "success" | "failed";
}


export default function LacakPesananPage() {
  const csWhatsapp = process.env.NEXT_PUBLIC_CS_WHATSAPP || "628123456789";
  const [searchId, setSearchId] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchedOrder, setSearchedOrder] = useState<TrackedOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

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
        setErrorMsg(data.error || "Pesanan tidak ditemukan.");
      } else {
        setSearchedOrder(data);
        if (data.hasReviewed) setReviewSubmitted(true);
      }
    } catch (err: any) {
      setErrorMsg("Gagal menghubungi server untuk melacak pesanan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (searchedOrder && (searchedOrder.status === 'pending' || searchedOrder.status === 'processing')) {
      interval = setInterval(() => {
        fetch(`/api/topup/track?invoiceId=${encodeURIComponent(searchedOrder.invoiceId)}`)
          .then(res => res.json())
          .then(data => {
            if (data && !data.error) {
              setSearchedOrder(data);
              if (data.hasReviewed) setReviewSubmitted(true);
            }
          })
          .catch(err => console.error(err));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [searchedOrder?.status, searchedOrder?.invoiceId]);

  const handleSubmitReview = async () => {
    if (!searchedOrder) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: searchedOrder.invoiceId,
          rating,
          comment: reviewComment
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setReviewSubmitted(true);
      } else {
        alert("Gagal mengirim ulasan: " + (data.error || ""));
      }
    } catch (e) {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmittingReview(false);
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
                  searchedOrder.status === "failed" ? "text-red-500" :
                  searchedOrder.status === "processing" ? "text-cyan-400" : "text-amber-400"
                }`}>
                  {searchedOrder.status === "success" && "Berhasil"}
                  {searchedOrder.status === "failed" && "Transaksi Gagal"}
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
              {searchedOrder.discountAmount ? (
                <div className="flex justify-between items-start gap-4 text-white/70">
                  <span className="uppercase tracking-wide">Harga Asli</span>
                  <span className="shrink-0 font-mono">Rp {searchedOrder.priceBase?.toLocaleString('id-ID')}</span>
                </div>
              ) : null}

              <div className="flex justify-between items-start gap-4 text-white">
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-wide">{searchedOrder.item}</span>
                </div>
                <span className="shrink-0 font-mono">{searchedOrder.price}</span>
              </div>
              
              {searchedOrder.promoCode && searchedOrder.discountAmount ? (
                <div className="flex justify-between items-start gap-4 text-accent-green mt-1">
                  <span className="uppercase tracking-wide">Diskon Promo ({searchedOrder.promoCode})</span>
                  <span className="shrink-0 font-mono">- Rp {searchedOrder.discountAmount.toLocaleString('id-ID')}</span>
                </div>
              ) : null}
            </div>


            {/* Review Form */}
            {searchedOrder.status === "success" && (
              <div className="pt-4 border-t-2 border-white/20 border-dashed">
                {reviewSubmitted ? (
                  <div className="bg-accent/20 border-2 border-accent p-4 text-center space-y-2">
                    <div className="flex justify-center text-accent mb-2">
                      <FiCheck className="w-8 h-8" />
                    </div>
                    <div className="font-black text-white uppercase tracking-wider text-sm">Terima Kasih!</div>
                    <p className="text-xs text-white/80 font-bold">Ulasan Anda sangat berarti bagi kami.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Bagaimana pengalaman top-up Anda?</h4>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`text-2xl transition-transform hover:scale-110 ${
                            rating >= star ? "text-accent-orange" : "text-white/20"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Bagikan ulasan Anda di sini (opsional)..."
                      className="w-full bg-black border-2 border-white p-3 text-xs font-bold text-white outline-none focus:border-accent resize-none placeholder-white/40"
                      rows={3}
                    />
                    <button
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview}
                      className="bg-white text-black px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      {isSubmittingReview ? "Mengirim..." : "Kirim Ulasan"}
                    </button>
                  </div>
                )}
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
