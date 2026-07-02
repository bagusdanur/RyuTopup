"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FiCopy, FiCheck, FiArrowRight, FiInfo, FiAlertCircle, FiChevronDown, FiChevronUp, FiDownload } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";
import TopupHeader from "@/components/TopupHeader";
import TopupFooter from "@/components/TopupFooter";
import { GAME_DATA } from "@/lib/gameData";

interface TrackedOrder {
  invoiceId: string;
  gameName: string;
  gameId: string;
  item: string;
  targetId: string;
  paymentMethod: string;
  price: string;
  priceBase?: number;
  priceFee?: number;
  priceTotal?: number;
  createdAt?: string;
  date: string;
  status: "pending" | "processing" | "success" | "failed";
  pgPaymentNumber?: string;
  pgExpiredAt?: string;
  pgFee?: number;
}

export default function PesananPage() {
  const params = useParams();
  const invoiceId = params.invoiceId as string;
  const csWhatsapp = process.env.NEXT_PUBLIC_CS_WHATSAPP || "628123456789";

  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      setErrorMsg("");
      const res = await fetch(`/api/topup/track?invoiceId=${encodeURIComponent(invoiceId)}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Pesanan tidak ditemukan.");
      } else {
        setOrder(data);
      }
    } catch (err: any) {
      setErrorMsg("Gagal menghubungi server untuk memuat detail pesanan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId) {
      fetchOrderDetails();
    }
  }, [invoiceId]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const formatDate = (isoString?: string, fallback: string = "") => {
    if (!isoString) return fallback;
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return fallback;
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    } catch {
      return fallback;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Belum Bayar";
      case "processing":
        return "Sedang Diproses";
      case "success":
        return "Berhasil";
      case "failed":
        return "Gagal";
      default:
        return status;
    }
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case "pending":
        return "text-[#f59e0b]";
      case "processing":
        return "text-[#06b6d4]";
      case "success":
        return "text-[#10b981]";
      case "failed":
        return "text-[#ef4444]";
      default:
        return "text-white";
    }
  };

  const getFriendlyPaymentMethod = (method: string) => {
    const m = method.toLowerCase();
    if (m === "qris") return "QRIS Untuk Semua Pembayaran";
    if (m === "shopeepay") return "ShopeePay";
    if (m === "gopay") return "GoPay";
    if (m === "dana") return "DANA";
    if (m === "ovo") return "OVO";
    if (m === "alfamart") return "Alfamart";
    if (m === "indomaret") return "Indomaret";
    if (m.includes("bni")) return "BNI Virtual Account";
    if (m.includes("bri")) return "BRI Virtual Account";
    if (m.includes("mandiri")) return "Mandiri Virtual Account";
    if (m.includes("bsi")) return "BSI Virtual Account";
    if (m.includes("danamon")) return "Danamon Virtual Account";
    if (m.includes("cimb")) return "CIMB Virtual Account";
    if (m.includes("bnc")) return "BNC Virtual Account";
    return method;
  };

  const parseTargetId = (targetId: string, gameId: string) => {
    const match = targetId.trim().match(/^([^(]+)(?:\(([^)]+)\))?$/);
    if (!match) return { userId: targetId };

    const userId = match[1].trim();
    const zoneId = match[2]?.trim();

    if (!zoneId) return { userId };

    let zoneLabel = "ID Zone";
    if (gameId === "genshin-impact" || isNaN(Number(zoneId))) {
      zoneLabel = "Server";
    }

    return { userId, zoneId, zoneLabel };
  };

  // Extract item icon from GAME_DATA
  const gameData = order ? GAME_DATA[order.gameId] : null;
  const itemData = gameData ? gameData.items.find((i: any) => i.name === order?.item) : null;
  const itemIcon = itemData?.icon;

  // Determine payment category type
  const getPaymentCategoryInfo = (method: string) => {
    const m = method.toLowerCase();
    if (
      m.includes("qris") ||
      m.includes("shopeepay") ||
      m.includes("gopay") ||
      m.includes("dana") ||
      m.includes("ovo")
    ) {
      return {
        type: "qris",
        title: "Cara Melakukan Pembayaran Dengan Upload Gambar QRIS Di Semua E-wallet",
        header: "Melalui Semua E-wallet",
        steps: [
          "Masuk ke aplikasi E-wallet Yang Anda Gunakan, kemudian klik tombol Scanner atau Bayar.",
          "Setelah itu, klik ikon Upload QR dari Galeri yang terdapat di kanan atas tampilan.",
          "Pilih gambar QRIS yang Kamu Download Atau Screenshot Di RyuTopup Yang telah disimpan di galeri.",
          "Klik OK untuk melanjutkan ke proses berikutnya.",
          "Klik Bayar Sekarang untuk menyelesaikan proses transaksi."
        ]
      };
    }

    if (m.includes("alfa") || m.includes("indomaret")) {
      const storeName = m.includes("alfa") ? "Alfamart" : "Indomaret";
      return {
        type: "retail",
        title: "Cara Melakukan Pembayaran Di Gerai Retail",
        header: `Melalui Gerai ${storeName}`,
        code: `88998${invoiceId.replace(/\D/g, "") || "082224227"}`,
        steps: [
          `Datang ke gerai ${storeName} terdekat.`,
          "Sampaikan ke kasir ingin melakukan pembayaran tagihan merchant RyuTopup.",
          "Tunjukkan kode pembayaran di atas kepada kasir.",
          "Bayar sesuai nominal tagihan yang disebutkan oleh kasir.",
          "Simpan struk pembayaran sebagai bukti transaksi yang sah."
        ]
      };
    }

    // Default to Virtual Account
    const bankName = method.toUpperCase();
    return {
      type: "va",
      title: "Cara Melakukan Pembayaran Transfer Virtual Account",
      header: `Melalui Transfer ${bankName}`,
      code: `8806${invoiceId.replace(/\D/g, "") || "082224227"}`,
      steps: [
        "Buka aplikasi Mobile Banking Anda atau kunjungi ATM terdekat.",
        "Pilih menu Transfer / Pembayaran > Virtual Account.",
        "Masukkan nomor Virtual Account (VA) yang tertera di atas.",
        "Pastikan nama penerima adalah RyuTopup dan nominal transfer sudah sesuai.",
        "Masukkan PIN Anda dan selesaikan transaksi."
      ]
    };
  };

  return (
    <div className="bg-black text-white font-sans min-h-screen flex flex-col antialiased">
      <TopupHeader searchQuery="" onSearchChange={() => {}} />

      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-8 md:py-10 space-y-5">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <FaSpinner className="w-8 h-8 animate-spin text-white" />
            <span className="text-white/70 text-sm font-black uppercase tracking-wider">Memuat invoice pesanan...</span>
          </div>
        ) : errorMsg ? (
          <div className="bg-black border-2 border-white p-8 text-center space-y-4 shadow-neo rounded-none">
            <div className="w-12 h-12 rounded-none border-2 border-white bg-white text-black flex items-center justify-center mx-auto text-lg">
              <FiAlertCircle />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Invoice Tidak Ditemukan</h2>
            <p className="text-xs text-white/80 max-w-xs mx-auto leading-relaxed font-bold">
              {errorMsg}
            </p>
            <div className="pt-2">
              <Link href="/" className="inline-flex bg-white border-2 border-white text-black text-xs font-black px-5 py-2.5 rounded-none shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase tracking-wider">
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        ) : order ? (
          (() => {
            const parsedTarget = parseTargetId(order.targetId, order.gameId);
            const gameInfo = GAME_DATA[order.gameId];
            const gameLogo = gameInfo?.cover || gameInfo?.logo || "https://upload.wikimedia.org/wikipedia/en/2/23/Mobile_Legends_Bang_Bang_logo.png";
            const gameName = gameInfo?.name || order.gameName;

            const baseVal = order.priceBase || 0;
            const feeVal = order.priceFee || 0;
            const totalVal = order.priceTotal || 0;
            const uniqueCode = totalVal - (baseVal + feeVal);

            const payInfo = getPaymentCategoryInfo(order.paymentMethod);
            const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=RyuTopup-Invoice-${order.invoiceId}`;
            
            // Override with actual PG data if available
            if (order.pgPaymentNumber && payInfo.type !== "qris") {
              payInfo.code = order.pgPaymentNumber;
            }

            return (
              <div className="space-y-4 animate-fadeIn">
                
                {/* DYNAMIC QRIS DISPLAY (If QRIS & pending) */}
                {order.status === "pending" && payInfo.type === "qris" && (
                  <div className="bg-black border-2 border-white p-4 flex flex-col items-center gap-3 text-center shadow-neo rounded-none">
                    <h4 className="text-xs font-black uppercase text-white/70 tracking-wider">Scan Kode QRIS</h4>
                    
                    {order.pgExpiredAt && (
                      <span className="text-[10px] text-accent-orange font-black uppercase tracking-wider block bg-accent-orange/10 px-3 py-1 border border-accent-orange">
                        Batas Bayar: {formatDate(order.pgExpiredAt)}
                      </span>
                    )}

                    <div className="bg-white p-2.5 border-2 border-white rounded-none shadow-neo-sm relative overflow-hidden">
                      {order.pgPaymentNumber ? (
                        <QRCodeSVG value={order.pgPaymentNumber} size={160} level="M" />
                      ) : (
                        <img src={qrDataUrl} alt="QRIS Code" className="w-[160px] h-[160px] object-contain" />
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (order.pgPaymentNumber) {
                           copyToClipboard(order.pgPaymentNumber, "qris-text");
                        } else {
                           window.open(qrDataUrl, "_blank");
                        }
                      }}
                      className="flex items-center gap-1.5 bg-white border-2 border-white text-black font-black text-[11px] px-3.5 py-2 rounded-none transition-all shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer uppercase tracking-wider"
                    >
                      {order.pgPaymentNumber ? (
                         <>
                           {copiedText === "qris-text" ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                           Salin String QRIS
                         </>
                      ) : (
                         <>
                           <FiDownload className="w-3 h-3" />
                           Unduh QRIS
                         </>
                      )}
                    </button>
                  </div>
                )}

                {/* UNIFIED COMPACT RECEIPT CARD */}
                <div className="bg-black border-2 border-white p-5 shadow-neo rounded-none space-y-4 relative">
                  {/* Receipts Header */}
                  <div className="flex justify-between items-start gap-4 pb-3 border-b-2 border-white">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-white/50 font-black uppercase tracking-wider block">No. Invoice</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-white font-mono break-all tracking-wider">{order.invoiceId}</span>
                        <button
                          onClick={() => copyToClipboard(order.invoiceId, "invoice")}
                          className="p-0.5 text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
                          title="Salin nomor pesanan"
                        >
                          {copiedText === "invoice" ? <FiCheck className="text-white w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-white/50 font-black uppercase tracking-wider block">Status</span>
                      <span className={`text-xs font-black block uppercase tracking-wider ${getStatusColorClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Customer / Game Info Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs border-b border-white/20 border-dashed pb-4">
                    <div>
                      <span className="text-white/50 font-black uppercase block text-[9.5px] tracking-wider mb-0.5">Game</span>
                      <span className="font-bold text-white uppercase break-words">{gameName}</span>
                    </div>
                    <div>
                      <span className="text-white/50 font-black uppercase block text-[9.5px] tracking-wider mb-0.5">Metode Bayar</span>
                      <span className="font-bold text-white uppercase break-words">{getFriendlyPaymentMethod(order.paymentMethod)}</span>
                    </div>
                    <div>
                      <span className="text-white/50 font-black uppercase block text-[9.5px] tracking-wider mb-0.5">ID Pelanggan</span>
                      <span className="font-bold text-white font-mono break-all">{parsedTarget.userId} {parsedTarget.zoneId ? `(${parsedTarget.zoneId})` : ""}</span>
                    </div>
                    <div>
                      <span className="text-white/50 font-black uppercase block text-[9.5px] tracking-wider mb-0.5">Tanggal</span>
                      <span className="font-bold text-white uppercase">{formatDate(order.createdAt, order.date)}</span>
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
                        <span className="uppercase tracking-wide">{order.item}</span>
                      </div>
                      <span className="shrink-0 font-mono">Rp {baseVal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between items-center text-white/60">
                      <span className="uppercase tracking-wide text-[10.5px]">Biaya Admin</span>
                      <span className="font-mono">Rp {feeVal.toLocaleString("id-ID")}</span>
                    </div>
                    {uniqueCode > 0 && (
                      <div className="flex justify-between items-center text-white/60">
                        <span className="uppercase tracking-wide text-[10.5px]">Kode Unik</span>
                        <span className="font-mono">Rp {uniqueCode.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                  </div>

                  {/* Total Payment (Dashed top) */}
                  <div className="pt-4 border-t-2 border-white border-dashed flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-white/70">Total Bayar</span>
                    <div className="flex items-center gap-2 select-all">
                      <span className="text-lg md:text-xl font-black text-white font-mono">
                        Rp {totalVal.toLocaleString("id-ID")},-
                      </span>
                      <button
                        onClick={() => copyToClipboard(totalVal.toString(), "total")}
                        className="p-1 text-white bg-black border border-white hover:bg-white hover:text-black transition-colors cursor-pointer shrink-0 rounded-none shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                        title="Salin nominal total"
                      >
                        {copiedText === "total" ? <FiCheck className="text-white w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* SUCCESS / PROCESSING INVOICE BANNER */}
                {(order.status === "success" || order.status === "processing") && (
                  <div className="bg-black border-2 border-white text-white text-xs rounded-none p-4 flex items-start gap-2.5 shadow-neo-sm font-bold">
                    <FiCheck className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                    <div className="space-y-1 leading-relaxed">
                      <span className="font-black uppercase tracking-wider block">Pembayaran Diterima!</span>
                      <span className="text-white/70 text-[11px] block font-bold leading-relaxed mt-0.5">
                        Pesanan Anda sedang diproses secara otomatis. Silakan klik tombol pelacakan di bawah untuk memantau status secara real-time.
                      </span>
                    </div>
                  </div>
                )}

                {/* CARD 3: PETUNJUK PEMBAYARAN */}
                <div className="space-y-2">
                  <div className="text-xs font-black text-white/70 uppercase tracking-wider px-1">
                    {payInfo.title}
                  </div>
                  
                  <div className="bg-black border-2 border-white rounded-none overflow-hidden shadow-neo">
                    {/* ACCORDION HEADER */}
                    <div
                      onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                      className={`flex items-center justify-between p-3.5 cursor-pointer select-none transition-colors border-white ${
                        isAccordionOpen ? "bg-white text-black border-b-2" : "bg-black text-white hover:bg-white/5"
                      }`}
                    >
                      <span className="text-xs md:text-[13px] font-black uppercase tracking-wider">
                        {payInfo.header}
                      </span>
                      {isAccordionOpen ? (
                        <FiChevronUp className="w-4 h-4" />
                      ) : (
                        <FiChevronDown className="w-4 h-4" />
                      )}
                    </div>

                    {/* ACCORDION CONTENT */}
                    <div
                      className={`transition-all duration-200 ease-in-out overflow-hidden ${
                        isAccordionOpen ? "max-h-[800px] p-5 opacity-100 bg-black border-t-0" : "max-h-0 opacity-0 pointer-events-none"
                      }`}
                    >
                      {/* Code Display for VA / Retail */}
                      {order.status === "pending" && payInfo.code && (
                        <div className="bg-black border-2 border-white p-4.5 mb-4 text-center space-y-3 rounded-none shadow-neo-sm">
                          <span className="text-[10px] font-black uppercase text-white/60 tracking-wider">
                            {payInfo.type === "retail" ? "Kode Pembayaran Retail" : "Nomor Virtual Account"}
                          </span>
                          <span className="text-xl md:text-2xl font-black font-mono text-white tracking-wide mt-1 block select-all">
                            {payInfo.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(payInfo.code!, "code")}
                            className="inline-flex items-center gap-1.5 bg-white border-2 border-white text-black font-black text-xs px-4 py-2 rounded-none transition-all cursor-pointer select-none shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none uppercase tracking-wider"
                          >
                            {copiedText === "code" ? (
                              <>
                                <FiCheck className="w-3.5 h-3.5 text-black" />
                                Berhasil Disalin!
                              </>
                            ) : (
                              <>
                                <FiCopy className="w-3.5 h-3.5 text-black" />
                                Salin Kode Tagihan
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Numbered Steps */}
                      <ol className="list-decimal pl-4.5 space-y-3 text-[12px] text-white/80 leading-relaxed font-bold">
                        {payInfo.steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>

                {/* ACTION CTAs */}
                <div className="space-y-3 pt-2">
                  <Link
                    href={`/lacak?invoiceId=${order.invoiceId}`}
                    className="w-full bg-white border-2 border-white text-black py-4.5 font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-neo transition-all select-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none rounded-none"
                  >
                    Lacak Status Real-time
                    <FiArrowRight className="w-4.5 h-4.5" />
                  </Link>
                  
                  <Link
                    href="/"
                    className="w-full bg-black hover:bg-white/5 border-2 border-white text-white py-3.5 font-black text-xs uppercase tracking-wider text-center block transition-all cursor-pointer rounded-none"
                  >
                    Kembali ke Beranda
                  </Link>
                </div>

                {/* CS WHATSAPP HELP */}
                <div className="pt-2 text-center">
                  <p className="text-[11px] text-white/50 leading-relaxed max-w-xs mx-auto font-bold uppercase tracking-wider">
                    Mengalami kendala pembayaran? Silakan <a href={`https://wa.me/${csWhatsapp}`} target="_blank" rel="noopener noreferrer" className="text-white font-black hover:underline">Hubungi CS WhatsApp →</a>
                  </p>
                </div>

              </div>
            );
          })()
        ) : null}

      </main>

      {/* FOOTER */}
      <TopupFooter />
    </div>
  );
}
