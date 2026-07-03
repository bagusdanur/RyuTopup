import { FaSpinner } from "react-icons/fa";

type SummaryStickyProps = {
  gameName: string;
  selectedItem: any;
  selectedPayment: any;
  discountAmount: number;
  totalPrice: number;
  checkoutError: string | null;
  isSubmitting: boolean;
  isLoadingNickname: boolean;
  onCheckoutClick: () => void;
  // Promo code props
  voucherCode: string;
  setVoucherCode: (val: string) => void;
  promoError: string | null;
  setPromoError: (val: string | null) => void;
  promoSuccess: string | null;
  setPromoSuccess: (val: string | null) => void;
  onApplyPromo: () => void;
  isCheckingPromo: boolean;
};

export default function TopupSummarySticky({
  gameName,
  selectedItem,
  selectedPayment,
  discountAmount,
  totalPrice,
  checkoutError,
  isSubmitting,
  isLoadingNickname,
  onCheckoutClick,
  voucherCode,
  setVoucherCode,
  promoError,
  setPromoError,
  promoSuccess,
  setPromoSuccess,
  onApplyPromo,
  isCheckingPromo,
}: SummaryStickyProps) {
  return (
    <aside className="lg:sticky lg:top-[94px] w-full space-y-5">
      {/* Panel Promo Code */}
      <div className="bg-black border-2 border-white p-5 space-y-3.5 rounded-none shadow-neo">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider">Kode Promo</h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Masukkan kode voucher"
            value={voucherCode}
            onChange={(e) => {
              setVoucherCode(e.target.value);
              setPromoError(null);
              setPromoSuccess(null);
            }}
            className="bg-black border-2 border-white text-white rounded-none px-4 py-2.5 text-[13px] md:text-[13.5px] focus:shadow-neo outline-none transition-all placeholder-white/40 flex-1 font-bold uppercase"
          />
          <button 
            onClick={onApplyPromo}
            disabled={isCheckingPromo}
            className="bg-accent border-2 border-accent text-black rounded-none px-5 font-black text-xs md:text-sm select-none transition-all shadow-neo-orange hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            {isCheckingPromo ? "Cek..." : "Pakai"}
          </button>
        </div>
        {promoError && <div className="text-[11px] text-rose-500 font-bold uppercase tracking-wide">{promoError}</div>}
        {promoSuccess && <div className="text-[11px] text-accent-green font-bold uppercase tracking-wide">{promoSuccess}</div>}
      </div>

      {/* Sticky Order Summary */}
      <div className="bg-black border-3 border-white p-6 space-y-5 rounded-none shadow-neo-lg">
        <h3 className="text-sm font-black text-white uppercase tracking-wider pb-3 border-b-2 border-dashed border-white">Ringkasan Pesanan</h3>
        
        <div className="flex justify-between items-center text-[13.5px] font-bold">
          <span className="text-white/60 uppercase text-xs">Produk</span>
          <span className="text-white uppercase tracking-wider">{gameName}</span>
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

        {discountAmount > 0 && (
          <div className="flex justify-between items-center text-[13.5px] font-bold text-accent-green">
            <span className="uppercase text-xs">Diskon Promo</span>
            <span>- Rp {discountAmount.toLocaleString("id-ID")}</span>
          </div>
        )}

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
          onClick={onCheckoutClick}
          className="w-full mt-3 bg-accent border-2 border-accent text-black py-4 font-black text-sm shadow-neo-orange hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase tracking-widest disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
          disabled={!selectedItem || isSubmitting || isLoadingNickname}
        >
          {isSubmitting || isLoadingNickname ? (
            <>
              <FaSpinner className="animate-spin w-4 h-4" />
              {isLoadingNickname ? "Mengecek ID..." : "Memproses..."}
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
  );
}
