"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopupHeader from "@/components/TopupHeader";
import TopupFooter from "@/components/TopupFooter";
import { FaCheckCircle, FaSpinner, FaChevronDown, FaChevronUp } from "react-icons/fa";

type PaymentMethod = {
  id: string;
  name: string;
  group: "QRIS" | "E-Wallet" | "Convenience Store" | "Virtual Account";
  fee: number;
  logo: string;
};

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "qris",
    name: "QRIS",
    group: "QRIS",
    fee: 0,
    logo: "https://sin1.contabostorage.com/20ab04d5e89c402888b2ba814feec970:xc-alk12091as-assets-10x129-empeshop/media/file-1738775662-kcbetm70-file-1737143150-spcmgc35-qris-gambar-1.png?w=160&q=75",
  },
  {
    id: "shopeepay",
    name: "ShopeePay",
    group: "E-Wallet",
    fee: 1200,
    logo: "https://sin1.contabostorage.com/20ab04d5e89c402888b2ba814feec970:xc-alk12091as-assets-10x129-empeshop/media/file-1738775716-fmn2sfib-file-1737143671-9mrhdvag-file-1697904171-eq3ej04i-file-1674630365-9kf6c65s-shopeepay-logo-2-1-1-1.png?w=160&q=75",
  },
  {
    id: "gopay",
    name: "GoPay",
    group: "E-Wallet",
    fee: 1000,
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg",
  },
  {
    id: "dana",
    name: "DANA",
    group: "E-Wallet",
    fee: 1000,
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg",
  },
  {
    id: "ovo",
    name: "OVO",
    group: "E-Wallet",
    fee: 1000,
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/39/Ovo_logo.svg",
  },
  {
    id: "alfamart",
    name: "Alfamart",
    group: "Convenience Store",
    fee: 2500,
    logo: "https://sin1.contabostorage.com/20ab04d5e89c402888b2ba814feec970:xc-alk12091as-assets-10x129-empeshop/media/file-1738775668-4nha5cp3-file-1737142974-nbmk0t1b-alfa-1.png?w=160&q=75",
  },
  {
    id: "indomaret",
    name: "Indomaret",
    group: "Convenience Store",
    fee: 2500,
    logo: "https://sin1.contabostorage.com/20ab04d5e89c402888b2ba814feec970:xc-alk12091as-assets-10x129-empeshop/media/file-1738775665-v5gkgnso-file-1737143060-2i3k401v-indomaret-1.png?w=160&q=75",
  },
  {
    id: "bni",
    name: "BNI VA",
    group: "Virtual Account",
    fee: 2500,
    logo: "https://sin1.contabostorage.com/20ab04d5e89c402888b2ba814feec970:xc-alk12091as-assets-10x129-empeshop/media/file-1738775998-s58ufehm-file-1737144001-l8g1ujbd-file-1697903336-m4kldqee-logo-bni-1-1-1.png?w=160&q=75",
  },
  {
    id: "bri",
    name: "BRI VA",
    group: "Virtual Account",
    fee: 2500,
    logo: "https://sin1.contabostorage.com/20ab04d5e89c402888b2ba814feec970:xc-alk12091as-assets-10x129-empeshop/media/file-1738775991-g4ivn5ni-file-1737144076-29oede25-file-1697903333-5jircd9t-logo-bri-1-1-1-1.png?w=160&q=75",
  },
  {
    id: "mandiri",
    name: "Mandiri VA",
    group: "Virtual Account",
    fee: 2500,
    logo: "https://sin1.contabostorage.com/20ab04d5e89c402888b2ba814feec970:xc-alk12091as-assets-10x129-empeshop/media/file-1738775983-ntpucpk1-file-1737144140-d4sn6v70-file-1697903331-rru92pvi-logo-mandiri-2-1-1-1-1.png?w=160&q=75",
  },
  {
    id: "bsi",
    name: "BSI VA",
    group: "Virtual Account",
    fee: 2500,
    logo: "https://sin1.contabostorage.com/20ab04d5e89c402888b2ba814feec970:xc-alk12091as-assets-10x129-empeshop/media/file-1738775973-j6dgbdre-file-1737144198-ilm13v57-file-1702554080-pj1ko6kt-file-1681684872-2ecd8m3k-bsi-bank-syariah-indonesia-logo-png720p-vector69com-1-1-1-1-1-1.png?w=160&q=75",
  },
  {
    id: "danamon",
    name: "Danamon VA",
    group: "Virtual Account",
    fee: 2500,
    logo: "https://sin1.contabostorage.com/20ab04d5e89c402888b2ba814feec970:xc-alk12091as-assets-10x129-empeshop/media/file-1738775965-5258tari-file-1737144338-95v1bt2l-file-1697903492-ukgnju3q-logo-danamon-1-1-1-1.png?w=160&q=75",
  },
  {
    id: "cimb",
    name: "CIMB VA",
    group: "Virtual Account",
    fee: 2500,
    logo: "https://sin1.contabostorage.com/20ab04d5e89c402888b2ba814feec970:xc-alk12091as-assets-10x129-empeshop/media/file-1738775962-7vajv6fr-file-1737144396-ecjoa4qj-file-1702554201-6o8n1722-zeel7yfw7eu3skmutjuew9wtvk4yd1qotjsw5ltg-1-2-1-1.png?w=160&q=75",
  },
  {
    id: "bnc",
    name: "BNC VA",
    group: "Virtual Account",
    fee: 2500,
    logo: "https://sin1.contabostorage.com/20ab04d5e89c402888b2ba814feec970:xc-alk12091as-assets-10x129-empeshop/media/file-1738775960-996uju6o-file-1737144453-g8jhh4q3-file-1707266058-2nlm7p94-logobnc-1-1-1.png?w=160&q=75",
  },
];

const FAQS = [
  {
    q: "Bagaimana cara membayar lewat Indomaret, Alfamart, Alfamidi?",
    a: "Pilih metode Convenience Store saat checkout, lalu selesaikan pesanan untuk mendapatkan kode pembayaran. Tunjukkan atau sebutkan kode tersebut ke kasir Indomaret, Alfamart, atau Alfamidi terdekat, dan lakukan pembayaran sesuai nominal yang tertera. Diamond akan otomatis terkirim setelah pembayaran terverifikasi.",
  },
  {
    q: "Berapa lama proses pengiriman Diamond?",
    a: "Untuk metode pembayaran instan seperti QRIS dan e-wallet, Diamond biasanya masuk dalam hitungan detik hingga beberapa menit setelah pembayaran berhasil dikonfirmasi.",
  },
  {
    q: "Apakah bisa top up ke Advance Server?",
    a: "Layanan ini hanya untuk Server Original dan tidak dapat digunakan untuk mengisi Advance Server. Pastikan akun yang dimasukkan berada di server original sebelum melakukan pembayaran.",
  },
];

export default function TopupFormClient({ gameId, data }: { gameId: string; data: any }) {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [activePayment, setActivePayment] = useState<string | null>("qris");
  const [accountData, setAccountData] = useState<Record<string, string>>({});
  const [waNumber, setWaNumber] = useState("");
  const [email, setEmail] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [waError, setWaError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "QRIS": true,
    "E-Wallet": false,
    "Convenience Store": false,
    "Virtual Account": false,
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const [isLoadingNickname, setIsLoadingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  const selectedItem = data.items.find((i: any) => i.id === activeItem);
  const selectedPayment = PAYMENT_METHODS.find((p) => p.id === activePayment);
  
  const totalPrice = (selectedItem?.price || 0) + (selectedPayment?.fee || 0);

  const passes = data.items.filter((item: any) => item.isPass);
  const regularItems = data.items.filter((item: any) => !item.isPass);

  const handleInputChange = (fieldId: string, value: string) => {
    setAccountData((prev) => ({ ...prev, [fieldId]: value }));
    if (fieldErrors[fieldId]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
    setCheckoutError(null);
  };

  const handleWaChange = (value: string) => {
    setWaNumber(value);
    setWaError(null);
    setCheckoutError(null);
  };

  const handleCheckNickname = async () => {
    setNicknameError(null);
    setNickname(null);

    // Get the first field for generic ID, or userId/zoneId specifically
    let targetId = accountData.userId ? `${accountData.userId}(${accountData.zoneId||''})` : Object.values(accountData)[0]?.trim();
    
    if (!targetId || targetId.length < 3) {
      setNicknameError("Harap isi User ID dengan benar");
      return;
    }

    setIsLoadingNickname(true);
    
    try {
      const response = await fetch("/api/check-nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, targetId }),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Gagal menemukan Nickname");
      }
      
      setNickname(result.nickname);
    } catch (err: any) {
      setNicknameError(err.message);
    } finally {
      setIsLoadingNickname(false);
    }
  };

  const handleCheckoutClick = () => {
    // Reset errors
    setFieldErrors({});
    setWaError(null);
    setEmailError(null);
    setCheckoutError(null);

    // Check item selection (return early to satisfy TS compiler)
    if (!selectedItem) {
      setCheckoutError("Silakan pilih nominal top up terlebih dahulu!");
      return;
    }
    // Check payment selection (return early to satisfy TS compiler)
    if (!selectedPayment) {
      setCheckoutError("Silakan pilih metode pembayaran terlebih dahulu!");
      return;
    }

    let hasError = false;
    
    // Check fields
    const errors: Record<string, string> = {};
    data.fields.forEach((f: any) => {
      const val = accountData[f.id]?.trim();
      if (!val) {
        errors[f.id] = `${f.label} tidak boleh kosong`;
        hasError = true;
      }
    });

    // WhatsApp validation
    const cleanWa = waNumber.trim().replace(/\D/g, "");
    if (!cleanWa) {
      setWaError("Nomor WhatsApp tidak boleh kosong");
      hasError = true;
    } else if (!/^(08|62|8)\d{8,13}$/.test(cleanWa)) {
      setWaError("Format nomor WhatsApp tidak valid (contoh: 081234567890)");
      hasError = true;
    }
    
    // Email validation
    if (!email.trim()) {
      setEmailError("ALAMAT EMAIL TIDAK BOLEH KOSONG");
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("FORMAT EMAIL TIDAK VALID");
      hasError = true;
    }

    // Input values validation (only numbers for numeric fields)
    const numericRegex = /^\d+$/;
    if (accountData.userId && !numericRegex.test(accountData.userId.trim())) {
      errors.userId = "User ID harus berupa angka!";
      hasError = true;
    }
    if (accountData.zoneId && !numericRegex.test(accountData.zoneId.trim())) {
      errors.zoneId = "Zone ID harus berupa angka!";
      hasError = true;
    }
    if (accountData.playerId && !numericRegex.test(accountData.playerId.trim())) {
      errors.playerId = "Player ID harus berupa angka!";
      hasError = true;
    }
    if (accountData.uid && !numericRegex.test(accountData.uid.trim())) {
      errors.uid = "UID Player harus berupa angka!";
      hasError = true;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
    }

    if (hasError) {
      setTimeout(() => {
        const errorElement = document.querySelector('[data-error="true"]');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const executeCheckout = async () => {
    setShowConfirmModal(false);
    
    if (!selectedItem || !selectedPayment) return;

    setIsSubmitting(true);
    setCheckoutError(null);

    const cleanWa = waNumber.trim().replace(/\D/g, "");

    // Format Target ID dynamically to match the specific game standards
    let formattedTargetId = "";
    if (gameId === "mobile-legends" || gameId === "magic-chess-gogo") {
      formattedTargetId = `${accountData.userId.trim()} (${accountData.zoneId.trim()})`;
    } else if (gameId === "genshin-impact") {
      formattedTargetId = `${accountData.uid.trim()} (${accountData.server.trim()})`;
    } else {
      // Valorant, PUBG, Free Fire, Honor of Kings
      formattedTargetId = Object.values(accountData)[0]?.trim() || "";
    }

    try {
      const response = await fetch("/api/topup/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          waNumber: cleanWa,
          email: email.trim() || undefined,
          gameId,
          targetId: formattedTargetId,
          itemCode: selectedItem.id,
          itemName: selectedItem.name,
          priceBase: selectedItem.price,
          priceFee: selectedPayment.fee,
          priceTotal: totalPrice,
          paymentMethod: selectedPayment.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal melakukan checkout. Silakan coba lagi.");
      }

      // Redirect to the dedicated invoice page
      router.push(`/pesanan/${result.invoiceId}`);
    } catch (err: any) {
      setCheckoutError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group payment methods
  const qrisMethods = PAYMENT_METHODS.filter((m) => m.group === "QRIS");
  const eWalletMethods = PAYMENT_METHODS.filter((m) => m.group === "E-Wallet");
  const convenienceMethods = PAYMENT_METHODS.filter((m) => m.group === "Convenience Store");
  const vaMethods = PAYMENT_METHODS.filter((m) => m.group === "Virtual Account");

  return (
    <div className="bg-black text-white font-sans min-h-screen flex flex-col antialiased">
      {/* HEADER */}
      <TopupHeader />

      {/* BREADCRUMB */}
      <div className="hidden md:flex w-full max-w-6xl mx-auto px-4 md:px-6 pt-6 text-[12.5px] text-white/70 items-center gap-1.5 select-none font-bold">
        <Link href="/" className="hover:underline">
          Beranda
        </Link>
        <span>/</span>
        <span className="text-white uppercase tracking-wider">{data.name}</span>
      </div>

      {/* PRODUCT HERO */}
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 flex items-center gap-4 border-b-2 border-white mb-6 md:mb-8">
        <img
          src={data.banner || data.logo}
          alt={data.name}
          className="w-16 h-16 md:w-[96px] md:h-[96px] border-2 border-white object-cover bg-black select-none rounded-none shadow-neo-sm"
        />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="text-[10px] md:text-[11.5px] font-black tracking-[0.1em] uppercase text-white/70">
            {data.developer || "Publisher"}
          </div>
          <h1 className="text-[19px] md:text-2xl font-black text-white leading-tight uppercase tracking-wider truncate md:overflow-visible md:whitespace-normal">{data.name}</h1>
          <div className="hidden md:flex gap-2 mt-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-black border-2 border-white px-3 py-1 text-[11px] font-black text-white uppercase tracking-wider">
              Layanan 24/7
            </span>
            <span className="inline-flex items-center gap-1.5 bg-black border-2 border-white px-3 py-1 text-[11px] font-black text-white uppercase tracking-wider">
              Aman &amp; Terpercaya
            </span>
            <span className="inline-flex items-center gap-1.5 bg-black border-2 border-white px-3 py-1 text-[11px] font-black text-white uppercase tracking-wider">
              Proses Otomatis
            </span>
          </div>
        </div>
      </div>

      {/* LAYOUT BODY */}
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pb-28 lg:pb-16 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 md:gap-8 items-start">
        
        {/* LEFT COLUMN: FORM DETAILS */}
        <div className="flex flex-col gap-5">
          
          {/* Panel 1: Product Info */}
          <div className="order-last lg:order-first bg-black border-2 border-white p-5 space-y-3.5 rounded-none shadow-neo">
            <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider border-b-2 border-white pb-2">Informasi Produk</h3>
            <p className="text-[12.5px] md:text-[13.5px] text-white/80 leading-relaxed font-bold">
              Top up Diamond {data.name} hanya dalam hitungan detik! Cukup masukan data akun Anda, pilih jumlah Diamond yang Anda inginkan, selesaikan pembayaran, dan item akan langsung masuk ke akun Anda secara otomatis.
            </p>
            <div className="text-[11.5px] md:text-[12.5px] text-white bg-black border-2 border-white p-3.5 font-black uppercase tracking-wider">
              ⚠️ Khusus Server Original, tidak bisa isi Advance Server. Untuk WDP (Weekly Diamond Pass), pastikan cek slot tersisa terlebih dahulu sebelum top up!
            </div>
          </div>

          {/* Panel 2: Account fields */}
          <div className="bg-black border-2 border-white p-5 space-y-4 rounded-none shadow-neo">
            <h3 className="text-sm md:text-base font-black text-white flex items-center gap-3 uppercase tracking-wider">
              <div className="w-6 h-6 border-2 border-white bg-white text-black flex items-center justify-center font-black shrink-0 text-[12px]">
                1
              </div>
              <span>Informasi Pelanggan</span>
            </h3>
            
            {/* Dynamic account fields */}
            <div className={`grid gap-3.5 ${data.fields.length >= 2 ? "grid-cols-2" : "grid-cols-1"}`}>
              {data.fields.map((field: any) => (
                <div key={field.id} className="flex flex-col gap-2" data-error={fieldErrors[field.id] ? "true" : undefined}>
                  <label htmlFor={field.id} className="text-[11.5px] md:text-[12.5px] font-black text-white uppercase tracking-wider">{field.label}</label>
                  {field.type === "select" ? (
                    <select
                      id={field.id}
                      value={accountData[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className={`bg-black text-white border-2 border-white px-4 py-3 text-[13px] md:text-[13.5px] font-bold outline-none focus:shadow-neo transition-all cursor-pointer w-full rounded-none ${
                        fieldErrors[field.id] ? "border-rose-500 text-rose-500" : ""
                      }`}
                    >
                      <option value="" disabled className="text-white/50">{field.placeholder}</option>
                      {field.options?.map((opt: string) => (
                        <option key={opt} value={opt} className="bg-black text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={field.id}
                      type="text"
                      placeholder={field.placeholder}
                      value={accountData[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className={`bg-black text-white border-2 border-white px-4 py-3 text-[13px] md:text-[13.5px] font-bold outline-none placeholder-white/40 focus:shadow-neo transition-all w-full rounded-none ${
                        fieldErrors[field.id] ? "border-rose-500 placeholder-rose-500/50" : ""
                      }`}
                    />
                  )}
                  {fieldErrors[field.id] && (
                    <span className="text-[10px] text-rose-400 font-extrabold uppercase tracking-wide">{fieldErrors[field.id]}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Nickname Check */}
            <div className="pt-1">
              <button
                onClick={handleCheckNickname}
                disabled={isLoadingNickname}
                className="bg-accent border-2 border-accent text-black px-4 py-2 text-xs font-black uppercase tracking-wider shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50"
              >
                {isLoadingNickname ? "Mengecek..." : "Cek Nickname"}
              </button>
              
              {nicknameError && (
                <div className="mt-2 text-[11px] text-rose-500 font-bold uppercase">{nicknameError}</div>
              )}
              {nickname && (
                <div className="mt-2 bg-green-500/10 border-2 border-green-500 p-2.5 flex flex-col animate-fadeIn">
                  <span className="text-[10px] text-green-500 font-black uppercase tracking-wider mb-0.5">Nickname Ditemukan:</span>
                  <span className="text-sm text-green-400 font-bold">{nickname}</span>
                </div>
              )}
            </div>

            {/* Global Whatsapp Field */}
            <div className="flex flex-col gap-2 pt-2" data-error={waError ? "true" : undefined}>
              <label htmlFor="wa" className="text-[11.5px] md:text-[12.5px] font-black text-white uppercase tracking-wider">Nomor WhatsApp</label>
              <input
                id="wa"
                type="text"
                placeholder="08xxxxxxxxxx"
                value={waNumber}
                onChange={(e) => handleWaChange(e.target.value)}
                className={`bg-black text-white border-2 border-white px-4 py-3 text-[13px] md:text-[13.5px] font-bold outline-none placeholder-white/40 focus:shadow-neo transition-all w-full rounded-none ${
                  waError ? "border-rose-500 placeholder-rose-500/50" : ""
                }`}
              />
              {waError && (
                <span className="text-[10px] text-rose-400 font-extrabold uppercase tracking-wide">{waError}</span>
              )}
            </div>

            {/* Global Email Field */}
            <div className="flex flex-col gap-2 pt-2" data-error={emailError ? "true" : undefined}>
              <label htmlFor="email" className="text-[11.5px] md:text-[12.5px] font-black text-white uppercase tracking-wider">
                Alamat Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="nama@email.com (Untuk Invoice)"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(null); setCheckoutError(null); }}
                className={`bg-black text-white border-2 border-white px-4 py-3 text-[13px] md:text-[13.5px] font-bold outline-none placeholder-white/40 focus:shadow-neo transition-all w-full rounded-none ${
                  emailError ? "border-rose-500 placeholder-rose-500/50" : ""
                }`}
              />
              {emailError && (
                <span className="text-[10px] text-rose-400 font-extrabold uppercase tracking-wide">{emailError}</span>
              )}
            </div>
          </div>

          {/* Panel 3: Nominal cards selection */}
          <div className="bg-black border-2 border-white p-5 space-y-4 rounded-none shadow-neo">
            <h3 className="text-sm md:text-base font-black text-white flex items-center gap-3 uppercase tracking-wider">
              <div className="w-6 h-6 border-2 border-white bg-white text-black flex items-center justify-center font-black shrink-0 text-[12px]">
                2
              </div>
              <span>Pilih Nominal Top Up</span>
            </h3>

            {passes.length > 0 && (
              <div className="space-y-3.5 mb-6">
                <div className="text-[11px] font-black uppercase text-white/70 tracking-wider">
                  Pilih Membership / Pass
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {passes.map((item: any) => {
                    const isSelected = activeItem === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveItem(item.id);
                          setCheckoutError(null);
                        }}
                        className={`relative border-2 p-3 flex flex-col justify-between min-h-[90px] md:min-h-[100px] cursor-pointer group transition-all text-left overflow-hidden select-none rounded-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-neo-sm ${
                          isSelected
                            ? "bg-accent border-accent shadow-none text-black font-black"
                            : "bg-black border-white text-white"
                        }`}
                      >
                        {/* Item Name */}
                        <span className={`text-[11px] md:text-[12.5px] font-black uppercase tracking-wide leading-snug mb-2 pr-6 ${isSelected ? "text-black" : "text-white"}`}>
                          {item.name}
                        </span>

                        {/* Price & Icon row */}
                        <div className="flex items-center gap-1.5 mt-auto">
                          <span className="w-5 h-5 md:w-6 md:h-6 select-none shrink-0 flex items-center justify-center">
                            {typeof item.icon === "string" && item.icon.startsWith("http") ? (
                              <img src={item.icon} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-[14px] md:text-[18px]">{item.icon}</span>
                            )}
                          </span>
                          <span className={`text-[12px] md:text-[13.5px] font-black leading-none ${isSelected ? "text-black" : "text-white"}`}>
                            Rp {item.price.toLocaleString("id-ID")},-
                          </span>
                        </div>

                        {/* Discount badge */}
                        {item.discount && (
                          <span className={`absolute bottom-0 right-0 border-t-2 border-l-2 border-white text-[9px] font-black px-2 py-0.5 select-none rounded-none uppercase ${
                            isSelected ? "bg-black text-accent border-black" : "bg-accent-red text-white border-accent-red"
                          }`}>
                            {item.discount} OFF
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {regularItems.length > 0 && (
              <div className="space-y-3.5">
                {passes.length > 0 && (
                  <div className="text-[11px] font-black uppercase text-white/70 tracking-wider">
                    Pilih Nominal Top Up
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {regularItems.map((item: any) => {
                    const isSelected = activeItem === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveItem(item.id);
                          setCheckoutError(null);
                        }}
                        className={`relative border-2 p-3 flex flex-col justify-between min-h-[90px] md:min-h-[100px] cursor-pointer group transition-all text-left overflow-hidden select-none rounded-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-neo-sm ${
                          isSelected
                            ? "bg-accent border-accent shadow-none text-black font-black"
                            : "bg-black border-white text-white"
                        }`}
                      >
                        {/* Item Name */}
                        <span className={`text-[11px] md:text-[12.5px] font-black uppercase tracking-wide leading-snug mb-2 pr-6 ${isSelected ? "text-black" : "text-white"}`}>
                          {item.name}
                        </span>

                        {/* Price & Icon row */}
                        <div className="flex items-center gap-1.5 mt-auto">
                          <span className="w-5 h-5 md:w-6 md:h-6 select-none shrink-0 flex items-center justify-center">
                            {typeof item.icon === "string" && item.icon.startsWith("http") ? (
                              <img src={item.icon} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-[14px] md:text-[18px]">{item.icon}</span>
                            )}
                          </span>
                          <span className={`text-[12px] md:text-[13.5px] font-black leading-none ${isSelected ? "text-black" : "text-white"}`}>
                            Rp {item.price.toLocaleString("id-ID")},-
                          </span>
                        </div>

                        {/* Discount badge */}
                        {item.discount && (
                          <span className={`absolute bottom-0 right-0 border-t-2 border-l-2 border-white text-[9px] font-black px-2 py-0.5 select-none rounded-none uppercase ${
                            isSelected ? "bg-black text-accent border-black" : "bg-accent-red text-white border-accent-red"
                          }`}>
                            {item.discount} OFF
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Panel 4: Payment Methods */}
          <div className="bg-black border-2 border-white p-5 space-y-4 rounded-none shadow-neo">
            <h3 className="text-sm md:text-base font-black text-white flex items-center gap-3 uppercase tracking-wider">
              <div className="w-6 h-6 border-2 border-white bg-white text-black flex items-center justify-center font-black shrink-0 text-[12px]">
                3
              </div>
              <span>Pilih Pembayaran</span>
            </h3>

            <div className="space-y-3">
              {[
                { name: "QRIS", methods: qrisMethods },
                { name: "E-Wallet", methods: eWalletMethods },
                { name: "Convenience Store", methods: convenienceMethods },
                { name: "Virtual Account", methods: vaMethods },
              ].map((group) => {
                const isOpen = expandedGroups[group.name];
                const activeInGroup = group.methods.some((m) => m.id === activePayment);
                
                return (
                  <div key={group.name} className="border-2 border-white rounded-none overflow-hidden bg-black">
                    {/* ACCORDION HEADER */}
                    <div
                      onClick={() => {
                        setExpandedGroups((prev) => ({
                          ...prev,
                          [group.name]: !prev[group.name],
                        }));
                      }}
                      className={`flex items-center justify-between p-3.5 cursor-pointer select-none transition-colors border-white ${
                        isOpen ? "bg-white text-black border-b-2" : "bg-black text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 border border-current ${activeInGroup ? "bg-accent-orange border-accent-orange" : "bg-transparent"}`}></span>
                        <span className="text-[11.5px] md:text-[13px] font-black uppercase tracking-wider">{group.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Logo previews (hide on open) */}
                        {!isOpen && (
                          <div className="flex items-center gap-1.5 opacity-80">
                            {group.methods.slice(0, 3).map((m) => (
                              <img key={m.id} src={m.logo} alt={m.name} className="h-3 md:h-3.5 w-auto object-contain max-w-[45px]" />
                            ))}
                            {group.methods.length > 3 && (
                              <span className="text-[8.5px] font-black text-black bg-white px-1.5 py-0.5 border border-white">+{group.methods.length - 3}</span>
                            )}
                          </div>
                        )}
                        
                        {isOpen ? (
                          <FaChevronUp className="text-[10px] md:text-[11.5px]" />
                        ) : (
                          <FaChevronDown className="text-[10px] md:text-[11.5px]" />
                        )}
                      </div>
                    </div>

                    {/* ACCORDION CONTENT */}
                    <div
                      className={`transition-all duration-200 ease-in-out overflow-hidden ${
                        isOpen ? "max-h-[500px] p-4 opacity-100 bg-black border-t-0" : "max-h-0 opacity-0 pointer-events-none"
                      }`}
                    >
                      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
                        {group.methods.map((method) => {
                          const isSelected = activePayment === method.id;
                          return (
                            <button
                              key={method.id}
                              onClick={() => {
                                setActivePayment(method.id);
                                setCheckoutError(null);
                                setExpandedGroups((prev) => ({ ...prev, [group.name]: true }));
                              }}
                              className={`border-2 rounded-none p-3 flex flex-col items-center justify-center gap-1.5 hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] shadow-[2px_2px_0px_white] transition-all text-center cursor-pointer relative min-h-[70px] ${
                                isSelected ? "bg-accent border-accent text-black font-black shadow-none" : "bg-black border-white text-white"
                              }`}
                            >
                              <img src={method.logo} alt={method.name} className={`h-5 w-auto object-contain max-w-[65px] mb-0.5 ${isSelected ? "" : "opacity-80"}`} />
                              <div className="flex flex-col items-center leading-none">
                                <span className={`text-[9.5px] md:text-[10px] font-black uppercase ${isSelected ? "text-black" : "text-white/80"}`}>{method.name}</span>
                                <span className={`text-[8.5px] md:text-[9.5px] font-bold mt-1 ${isSelected ? "text-black/80" : "text-white/40"}`}>
                                  {selectedItem 
                                    ? `Rp ${(selectedItem.price + method.fee).toLocaleString("id-ID")}`
                                    : `+Rp ${method.fee.toLocaleString("id-ID")}`
                                  }
                                </span>
                              </div>
                              {isSelected && (
                                <span className="absolute top-1 right-1.5 text-[8.5px] font-black bg-black text-accent-orange px-1 py-0 border border-black uppercase">OK</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel 5: Promo Code */}
          <div className="bg-black border-2 border-white p-5 space-y-3.5 rounded-none shadow-neo">
            <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider">Kode Promo</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Masukkan kode voucher"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                className="bg-black border-2 border-white text-white rounded-none px-4 py-2.5 text-[13px] md:text-[13.5px] focus:shadow-neo outline-none transition-all placeholder-white/40 flex-1 font-bold"
              />
              <button className="bg-accent border-2 border-accent text-black rounded-none px-5 font-black text-xs md:text-sm select-none transition-all shadow-neo-orange hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none uppercase tracking-wider cursor-pointer">
                Pakai Voucher
              </button>
            </div>
          </div>

          {/* Panel 6: FAQ Accordion */}
          <div className="bg-black border-2 border-white p-5 space-y-1.5 rounded-none shadow-neo">
            <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider mb-2">Pertanyaan yang Sering Diajukan</h3>
            
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="border-b-2 border-white last:border-none">
                  <div
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex justify-between items-center py-3.5 text-[12.5px] md:text-[13.5px] font-black cursor-pointer select-none text-white hover:underline uppercase tracking-wide gap-4"
                  >
                    <span>{faq.q}</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className={`text-white transition-transform duration-200 shrink-0 ${isOpen ? "rotate-45" : ""}`}
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                  
                  <div
                    className="transition-all duration-200 ease-in-out overflow-hidden"
                    style={{ maxHeight: isOpen ? "300px" : "0px", opacity: isOpen ? 1 : 0 }}
                  >
                    <p className="text-[12px] md:text-[13px] text-white/80 pb-4 leading-relaxed font-bold">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT COLUMN: STICKY ORDER SUMMARY */}
        <aside className="lg:sticky lg:top-[94px] w-full">
          <div className="bg-black border-3 border-white p-6 space-y-5 rounded-none shadow-neo-lg">
            <h3 className="text-sm font-black text-white uppercase tracking-wider pb-3 border-b-2 border-dashed border-white">Ringkasan Pesanan</h3>
            
            <div className="flex justify-between items-center text-[13.5px] font-bold">
              <span className="text-white/60 uppercase text-xs">Produk</span>
              <span className="text-white uppercase tracking-wider">{data.name}</span>
            </div>

            <div className="flex justify-between items-start text-[13.5px] gap-4 font-bold">
              <span className="text-white/60 uppercase text-xs shrink-0">Item</span>
              <span className="text-white text-right leading-tight uppercase tracking-wide">
                {selectedItem ? selectedItem.name : "Belum memilih nominal"}
              </span>
            </div>

            <div className="flex justify-between items-center text-[13.5px] font-bold">
              <span className="text-white/60 uppercase text-xs">Harga</span>
              <span className="text-white">
                {selectedItem ? `Rp ${selectedItem.price.toLocaleString("id-ID")}` : "-"}
              </span>
            </div>

            <div className="flex justify-between items-center text-[13.5px] font-bold">
              <span className="text-white/60 uppercase text-xs">Biaya Admin</span>
              <span className="text-white">
                {selectedPayment ? `Rp ${selectedPayment.fee.toLocaleString("id-ID")}` : "Rp 0"}
              </span>
            </div>

            <div className="flex justify-between items-center text-[14.5px] pt-4 border-t-2 border-dashed border-white font-black">
              <span className="text-white/70 uppercase text-xs">Total Bayar</span>
              <span className="text-[20px] text-white font-mono">
                {selectedItem ? `Rp ${totalPrice.toLocaleString("id-ID")}` : "-"}
              </span>
            </div>

            {checkoutError && (
              <div className="flex items-start gap-2.5 text-xs text-white bg-black border-2 border-white p-3.5 rounded-none shadow-neo-sm animate-fadeIn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                <span className="font-bold leading-relaxed text-left uppercase tracking-wide">{checkoutError}</span>
              </div>
            )}

            <button
              onClick={handleCheckoutClick}
              className="w-full mt-3 bg-accent border-2 border-accent text-black py-4 font-black text-sm shadow-neo-orange hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase tracking-widest disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
              disabled={!selectedItem || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin w-4 h-4" />
                  Memproses...
                </>
              ) : (
                "Beli Sekarang"
              )}
            </button>

            <div className="flex items-center gap-2 text-[11px] text-white/50 pt-1 justify-center font-bold uppercase tracking-wider">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white shrink-0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
              Transaksi Aman &amp; Terenkripsi
            </div>
            
            <p className="text-[11px] text-white/50 leading-relaxed pt-3 border-t-2 border-white/20 font-bold uppercase tracking-wide">
              Halaman konfirmasi akan muncul setelah tombol ditekan. Pastikan User ID dan Server sudah benar sebelum melakukan transaksi.
            </p>
          </div>
        </aside>

      </div>

      {/* BOTTOM STICKY BAR FOR MOBILE/TABLET */}
      {selectedItem && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black border-t-3 border-white p-4 shadow-none flex items-center justify-between gap-4 rounded-none">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-white/70 font-black uppercase tracking-wider">Total Bayar</span>
            <span className="text-[18px] font-black text-white font-mono truncate leading-none mt-1.5 block">
              Rp {totalPrice.toLocaleString("id-ID")}
            </span>
            <span className="text-[10.5px] text-white/50 truncate font-black mt-1 block uppercase tracking-wide">
              {selectedItem.name}
            </span>
          </div>
          <button
            onClick={handleCheckoutClick}
            disabled={isSubmitting}
            className="bg-accent border-2 border-accent text-black px-6 py-3.5 font-black text-xs md:text-sm shadow-neo-orange hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none uppercase tracking-wider transition-all min-w-[140px] rounded-none cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin w-3.5 h-3.5" />
                Memproses...
              </>
            ) : (
              "Beli Sekarang"
            )}
          </button>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-fadeIn">
          <div className="bg-black border-3 border-white rounded-none p-6 w-full max-w-sm shadow-neo-lg space-y-5 text-left">
            <div className="text-center space-y-1.5 mb-1">
              <h3 className="text-base font-black text-white tracking-wide uppercase">Detail Pesanan</h3>
              <p className="text-[11.5px] text-white/70 leading-normal font-semibold">
                Jika Data Pesanan Kamu Sudah Benar Klik <span className="text-white font-bold">Beli Sekarang</span>
              </p>
            </div>

            {/* Section 1: Data Player */}
            <div className="space-y-2">
              <div className="flex items-center text-xs font-black text-white uppercase tracking-wider">
                <span className="mr-1.5 font-black">—</span> Data Player
              </div>
              <div className="bg-black border-2 border-white p-3.5 space-y-2.5 rounded-none shadow-neo-sm">
                {data.fields.map((f: any) => (
                  <div key={f.id} className="flex justify-between items-center text-xs font-bold">
                    <span className="text-white/60 uppercase">{f.label}</span>
                    <span className="font-black text-white text-right uppercase">{accountData[f.id] || "-"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Ringkasan Pembelian */}
            <div className="space-y-2">
              <div className="flex items-center text-xs font-black text-white uppercase tracking-wider">
                <span className="mr-1.5 font-black">—</span> Ringkasan Pembelian
              </div>
              <div className="bg-black border-2 border-white p-3.5 space-y-2.5 rounded-none shadow-neo-sm">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-white/60 uppercase">Nomor Handphone</span>
                  <span className="font-black text-white text-right">{waNumber}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-white/60 uppercase">Harga</span>
                  <span className="font-black text-white text-right">Rp {selectedItem?.price.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-white/60 uppercase">Fee</span>
                  <span className="font-black text-white text-right">Rp {selectedPayment?.fee.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-white/60 uppercase">Sistem Pembayaran</span>
                  <span className="font-black text-white text-right uppercase tracking-wide">{selectedPayment?.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2.5 border-t border-white/20 border-dashed font-black">
                  <span className="text-white/70 uppercase">Total Pembayaran</span>
                  <span className="text-white">Rp {totalPrice.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1.5">
              <button
                onClick={executeCheckout}
                disabled={isSubmitting}
                className="w-full bg-accent border-2 border-accent text-black py-3.5 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-neo-orange transition-all select-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin w-4 h-4" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Beli Sekarang
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mt-0.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-full text-white/50 hover:text-white py-1.5 text-xs font-black uppercase tracking-wider cursor-pointer transition-colors text-center hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <TopupFooter />
    </div>
  );
}
