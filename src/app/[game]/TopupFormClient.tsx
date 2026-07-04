"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopupHeader from "@/components/TopupHeader";
import TopupFooter from "@/components/TopupFooter";
import { FaSpinner } from "react-icons/fa";

// Import modular subcomponents
import TopupProductInfo from "@/components/topup/TopupProductInfo";
import TopupCustomerForm from "@/components/topup/TopupCustomerForm";
import TopupItemGrid from "@/components/topup/TopupItemGrid";
import TopupPaymentList from "@/components/topup/TopupPaymentList";
import TopupSummarySticky from "@/components/topup/TopupSummarySticky";
import TopupConfirmModal from "@/components/topup/TopupConfirmModal";

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
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [waError, setWaError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    QRIS: true,
    "E-Wallet": false,
    "Convenience Store": false,
    "Virtual Account": false,
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const [isLoadingNickname, setIsLoadingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [errorModalMsg, setErrorModalMsg] = useState<string | null>(null);
  const [providerBalance, setProviderBalance] = useState<number>(Infinity); // default Infinity = semua item tersedia
  const [dynamicStockEnabled, setDynamicStockEnabled] = useState(false);

  // Fetch saldo provider dari DB + status fitur dynamic stock
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/settings?key=provider_balance").then(r => r.json()),
      fetch("/api/admin/settings?key=enable_dynamic_stock").then(r => r.json()),
    ]).then(([balanceData, stockData]) => {
      if (balanceData?.value) setProviderBalance(parseInt(balanceData.value, 10));
      setDynamicStockEnabled(stockData?.value === "true");
    }).catch(() => {}); // Gagal = biarkan default (semua item tersedia)
  }, []);

  const selectedItem = data.items.find((i: any) => i.id === activeItem);
  const selectedPayment = PAYMENT_METHODS.find((p) => p.id === activePayment);
  const totalPrice = Math.max((selectedItem?.price || 0) + (selectedPayment?.fee || 0) - discountAmount, 0);

  const validItems = data.items.filter((item: any) => !item.name.toUpperCase().includes("CEK USERNAME"));

  const isItemPass = (item: any) => {
    if (item.isPass) return true;
    const nameUpper = item.name.toUpperCase();
    return nameUpper.includes("PASS") || nameUpper.includes("MEMBER") || nameUpper.includes("BUNDLE") || nameUpper.includes("STARLIGHT");
  };

  const passes = validItems.filter(isItemPass).sort((a: any, b: any) => a.price - b.price);
  const regularItems = validItems.filter((item: any) => !isItemPass(item)).sort((a: any, b: any) => a.price - b.price);

  const shortenName = (name: string) => {
    let shortened = name;

    shortened = shortened.replace(/WEEKLY DIAMOND PASS/gi, "WDP");
    shortened = shortened.replace(/EXPRESS SUPPLY PASS/gi, "Supply Pass");
    shortened = shortened.replace(/STARLIGHT PLUS MEMBER/gi, "Starlight Plus");
    shortened = shortened.replace(/STARLIGHT MEMBER/gi, "Starlight");
    shortened = shortened.replace(/STARLIGHT MEMBERSHIP/gi, "Starlight");
    
    shortened = shortened.replace(/HONKAI:?\s*STAR\s*RAIL/gi, "");
    shortened = shortened.replace(/HONKAI\s*STARRAIL/gi, "");
    shortened = shortened.replace(/HSR/gi, "");
    shortened = shortened.replace(/GENSHIN\s*IMPACT/gi, "");
    shortened = shortened.replace(/GENSHIN/gi, "");
    shortened = shortened.replace(/MOBILE\s*LEGENDS:?\s*BANG\s*BANG/gi, "");
    shortened = shortened.replace(/MOBILE\s*LEGENDS/gi, "");
    shortened = shortened.replace(/MLBB/gi, "");
    shortened = shortened.replace(/VALORANT/gi, "");
    shortened = shortened.replace(/PUBG\s*MOBILE/gi, "");
    shortened = shortened.replace(/PUBG/gi, "");
    shortened = shortened.replace(/FREE\s*FIRE/gi, "");
    shortened = shortened.replace(/FF/gi, "");

    shortened = shortened.replace(/\(INDONESIA\)|\(GLOBAL\)|\(ID\)|\(REGION INDONESIA\)/gi, "");
    shortened = shortened.replace(/^[\s\-:+]+|[\s\-:+]+$/g, "").trim();

    if (!shortened) return name;
    
    const words = shortened.toLowerCase().split(' ');
    for (let i = 0; i < words.length; i++) {
      if (words[i]) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
      }
    }
    shortened = words.join(' ');
    
    shortened = shortened.replace(/\bWdp\b/g, "WDP");
    shortened = shortened.replace(/\bVip\b/g, "VIP");
    shortened = shortened.replace(/\bMcl\b/g, "MCL");
    
    return shortened;
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setAccountData((prev) => ({ ...prev, [fieldId]: value }));
    setNickname(null);
    setNicknameError(null);
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

    let targetId = "";
    
    if (accountData.userId && accountData.zoneId) {
      targetId = `${accountData.userId}(${accountData.zoneId})`;
    } else if (accountData.uid && accountData.server) {
      targetId = `${accountData.uid}(${accountData.server})`;
    } else {
      // Fallback for single field games like Free Fire, Valorant, etc.
      targetId = Object.values(accountData)[0]?.trim();
    }
    
    if (!targetId || targetId.length < 3) {
      setNicknameError("Harap isi Data Akun dengan benar");
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

  const handleApplyPromo = async () => {
    setPromoError(null);
    setPromoSuccess(null);
    setDiscountAmount(0);

    if (!voucherCode.trim()) {
      setPromoError("Masukkan kode voucher terlebih dahulu");
      return;
    }
    if (!selectedItem) {
      setPromoError("Pilih nominal top up terlebih dahulu");
      return;
    }
    const cleanWa = waNumber.trim().replace(/\D/g, "");
    if (!cleanWa) {
      setPromoError("Isi Nomor WhatsApp Anda di atas untuk verifikasi");
      return;
    }

    setIsCheckingPromo(true);
    try {
      const res = await fetch("/api/promo/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: voucherCode, 
          originalPrice: selectedItem.price + (selectedPayment?.fee || 0),
          waNumber: cleanWa
        })
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "Kode promo tidak valid");
      }
      setDiscountAmount(resData.discount);
      setPromoSuccess(`Voucher berhasil! Diskon Rp ${resData.discount.toLocaleString("id-ID")}`);
    } catch (err: any) {
      setPromoError(err.message);
    } finally {
      setIsCheckingPromo(false);
    }
  };

  const handleCheckoutClick = async () => {
    setFieldErrors({});
    setWaError(null);
    setEmailError(null);
    setCheckoutError(null);

    if (!selectedItem) {
      setCheckoutError("Silakan pilih nominal top up terlebih dahulu!");
      return;
    }
    if (!selectedPayment) {
      setCheckoutError("Silakan pilih metode pembayaran terlebih dahulu!");
      return;
    }

    let hasError = false;
    const errors: Record<string, string> = {};
    data.fields.forEach((f: any) => {
      const val = accountData[f.id]?.trim();
      if (!val) {
        errors[f.id] = `${f.label} tidak boleh kosong`;
        hasError = true;
      }
    });

    const cleanWa = waNumber.trim().replace(/\D/g, "");
    if (!cleanWa) {
      setWaError("Nomor WhatsApp tidak boleh kosong");
      hasError = true;
    } else if (!/^(08|62|8)\d{8,13}$/.test(cleanWa)) {
      setWaError("Format nomor WhatsApp tidak valid (contoh: 081234567890)");
      hasError = true;
    }
    
    if (!email.trim()) {
      setEmailError("ALAMAT EMAIL TIDAK BOLEH KOSONG");
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("FORMAT EMAIL TIDAK VALID");
      hasError = true;
    }

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

    if (!nickname) {
      setNicknameError(null);
      setIsLoadingNickname(true);
      setCheckoutError(null);

      let targetId = "";
      if (accountData.userId && accountData.zoneId) {
        targetId = `${accountData.userId}(${accountData.zoneId})`;
      } else if (accountData.uid && accountData.server) {
        targetId = `${accountData.uid}(${accountData.server})`;
      } else {
        targetId = Object.values(accountData)[0]?.trim();
      }      
      try {
        const response = await fetch("/api/check-nickname", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId, targetId }),
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || "Gagal memverifikasi ID Pelanggan. Pastikan ID Anda benar.");
        }
        
        setNickname(result.nickname);
        setShowConfirmModal(true);
      } catch (err: any) {
        setNicknameError(err.message);
        setCheckoutError(err.message);
        setErrorModalMsg(err.message);
      } finally {
        setIsLoadingNickname(false);
      }
    } else {
      setShowConfirmModal(true);
    }
  };

  const executeCheckout = async () => {
    setShowConfirmModal(false);
    if (!selectedItem || !selectedPayment) return;

    setIsSubmitting(true);
    setCheckoutError(null);

    const cleanWa = waNumber.trim().replace(/\D/g, "");

    let formattedTargetId = "";
    if (gameId === "mobile-legends" || gameId === "magic-chess-gogo") {
      formattedTargetId = `${accountData.userId.trim()} (${accountData.zoneId.trim()})`;
    } else if (gameId === "genshin-impact" || gameId === "honkai-star-rail") {
      formattedTargetId = `${accountData.uid.trim()} (${accountData.server.trim()})`;
    } else {
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
          username: nickname || "",
          itemCode: selectedItem.id,
          itemName: nickname ? `${selectedItem.name} - ${nickname}` : selectedItem.name,
          priceBase: selectedItem.price,
          priceFee: selectedPayment.fee,
          priceTotal: totalPrice,
          paymentMethod: selectedPayment.id,
          promoCode: discountAmount > 0 ? voucherCode : null,
          discountAmount: discountAmount
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal melakukan checkout. Silakan coba lagi.");
      }

      router.push(`/pesanan/${result.invoiceId}`);
    } catch (err: any) {
      setCheckoutError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const qrisMethods = PAYMENT_METHODS.filter((m) => m.group === "QRIS");
  const eWalletMethods = PAYMENT_METHODS.filter((m) => m.group === "E-Wallet");
  const convenienceMethods = PAYMENT_METHODS.filter((m) => m.group === "Convenience Store");
  const vaMethods = PAYMENT_METHODS.filter((m) => m.group === "Virtual Account");

  return (
    <div className="bg-black text-white font-sans min-h-screen flex flex-col antialiased">
      <TopupHeader />

      {/* BREADCRUMB */}
      <div className="hidden md:flex w-full max-w-6xl mx-auto px-4 md:px-6 pt-6 text-[12.5px] text-white/70 items-center gap-1.5 select-none font-bold">
        <Link href="/" className="hover:underline">Beranda</Link>
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
            <span className="inline-flex items-center gap-1.5 bg-black border-2 border-white px-3 py-1 text-[11px] font-black text-white uppercase tracking-wider">Layanan 24/7</span>
            <span className="inline-flex items-center gap-1.5 bg-black border-2 border-white px-3 py-1 text-[11px] font-black text-white uppercase tracking-wider">Aman &amp; Terpercaya</span>
            <span className="inline-flex items-center gap-1.5 bg-black border-2 border-white px-3 py-1 text-[11px] font-black text-white uppercase tracking-wider">Proses Otomatis</span>
          </div>
        </div>
      </div>

      {/* LAYOUT BODY */}
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pb-28 lg:pb-16 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 md:gap-8 items-start">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-5">
          <TopupProductInfo gameName={data.name} />
          
          <TopupCustomerForm
            fields={data.fields}
            accountData={accountData}
            fieldErrors={fieldErrors}
            nickname={nickname}
            isLoadingNickname={isLoadingNickname}
            nicknameError={nicknameError}
            onInputChange={handleInputChange}
            onCheckNickname={handleCheckNickname}
          />

          <TopupItemGrid
            passes={passes}
            regularItems={regularItems}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            setCheckoutError={setCheckoutError}
            shortenName={shortenName}
            providerBalance={providerBalance}
            dynamicStockEnabled={dynamicStockEnabled}
          />

          <TopupPaymentList
            qrisMethods={qrisMethods}
            eWalletMethods={eWalletMethods}
            convenienceMethods={convenienceMethods}
            vaMethods={vaMethods}
            expandedGroups={expandedGroups}
            setExpandedGroups={setExpandedGroups}
            activePayment={activePayment}
            setActivePayment={setActivePayment}
            selectedItem={selectedItem}
            setCheckoutError={setCheckoutError}
          />

          {/* Panel 5: Contacts */}
          <div className="bg-black border-2 border-white p-5 space-y-4 rounded-none shadow-neo">
            <h3 className="text-sm md:text-base font-black text-white flex items-center gap-3 uppercase tracking-wider">
              <div className="w-6 h-6 border-2 border-white bg-white text-black flex items-center justify-center font-black shrink-0 text-[12px]">4</div>
              <span>Informasi Kontak</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-2" data-error={waError ? "true" : undefined}>
                <label htmlFor="waNumber" className="text-[11.5px] md:text-[12.5px] font-black text-white uppercase tracking-wider">Nomor WhatsApp</label>
                <input
                  id="waNumber"
                  type="text"
                  placeholder="Contoh: 081234567890"
                  value={waNumber}
                  onChange={(e) => handleWaChange(e.target.value)}
                  className={`bg-black text-white border-2 border-white px-4 py-3 text-[13px] md:text-[13.5px] font-bold outline-none placeholder-white/40 focus:shadow-neo transition-all rounded-none ${waError ? "border-rose-500 placeholder-rose-500/50" : ""}`}
                />
                {waError ? (
                  <span className="text-[10px] text-rose-400 font-extrabold uppercase tracking-wide">{waError}</span>
                ) : (
                  <p className="text-[10.5px] text-white/50 leading-relaxed font-semibold uppercase tracking-wide">
                    Nomor WhatsApp ini digunakan untuk mengirimkan rincian transaksi serta bukti pembayaran Anda.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2" data-error={emailError ? "true" : undefined}>
                <label htmlFor="email" className="text-[11.5px] md:text-[12.5px] font-black text-white uppercase tracking-wider">Alamat Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Contoh: ryu@topup.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                    setCheckoutError(null);
                  }}
                  className={`bg-black text-white border-2 border-white px-4 py-3 text-[13px] md:text-[13.5px] font-bold outline-none placeholder-white/40 focus:shadow-neo transition-all rounded-none ${emailError ? "border-rose-500 placeholder-rose-500/50" : ""}`}
                />
                {emailError ? (
                  <span className="text-[10px] text-rose-400 font-extrabold uppercase tracking-wide">{emailError}</span>
                ) : (
                  <p className="text-[10.5px] text-white/50 leading-relaxed font-semibold uppercase tracking-wide">
                    Bukti tagihan elektronik / invoice akan dikirim ke alamat email yang Anda masukkan di atas.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Panel 6: FAQs */}
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
                    <p className="text-[12px] md:text-[13px] text-white/80 pb-4 leading-relaxed font-bold">{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <TopupSummarySticky
          gameName={data.name}
          selectedItem={selectedItem}
          selectedPayment={selectedPayment}
          discountAmount={discountAmount}
          totalPrice={totalPrice}
          checkoutError={checkoutError}
          isSubmitting={isSubmitting}
          isLoadingNickname={isLoadingNickname}
          onCheckoutClick={handleCheckoutClick}
          voucherCode={voucherCode}
          setVoucherCode={setVoucherCode}
          promoError={promoError}
          setPromoError={setPromoError}
          promoSuccess={promoSuccess}
          setPromoSuccess={setPromoSuccess}
          onApplyPromo={handleApplyPromo}
          isCheckingPromo={isCheckingPromo}
        />

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
            disabled={isSubmitting || isLoadingNickname}
            className="bg-accent border-2 border-accent text-black px-6 py-3.5 font-black text-xs md:text-sm shadow-neo-orange hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none uppercase tracking-wider transition-all min-w-[140px] rounded-none cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isSubmitting || isLoadingNickname ? (
              <>
                <FaSpinner className="animate-spin w-3.5 h-3.5" />
                {isLoadingNickname ? "Mengecek..." : "Memproses..."}
              </>
            ) : (
              "Beli Sekarang"
            )}
          </button>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      <TopupConfirmModal
        showConfirmModal={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        fields={data.fields}
        accountData={accountData}
        nickname={nickname}
        waNumber={waNumber}
        selectedItem={selectedItem}
        selectedPayment={selectedPayment}
        discountAmount={discountAmount}
        totalPrice={totalPrice}
        onConfirmCheckout={executeCheckout}
        isSubmitting={isSubmitting}
      />

      {/* CUSTOM NEOBRUTALISM ERROR POPUP MODAL */}
      {errorModalMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-accent-red border-4 border-black p-6 max-w-sm w-full shadow-neo-lg text-white space-y-4 rounded-none">
            <div className="flex justify-between items-start gap-4">
              <h4 className="text-[14px] font-black uppercase tracking-wider flex items-center gap-1.5 leading-none mt-1">
                ⚠️ Nickname Error
              </h4>
              <button 
                onClick={() => setErrorModalMsg(null)}
                className="bg-black text-white border-2 border-black w-6 h-6 flex items-center justify-center font-black hover:bg-white hover:text-black transition-colors cursor-pointer select-none text-[11px]"
              >
                ✕
              </button>
            </div>
            <p className="text-[11.5px] font-bold leading-relaxed uppercase tracking-wide bg-black/20 p-3 border border-white/20">
              {errorModalMsg}
            </p>
            <button
              onClick={() => setErrorModalMsg(null)}
              className="w-full bg-black text-white hover:bg-white hover:text-black border-2 border-black py-3 text-[11px] font-black uppercase tracking-widest transition-all shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
            >
              Tutup &amp; Periksa ID
            </button>
          </div>
        </div>
      )}

      <TopupFooter />
    </div>
  );
}
