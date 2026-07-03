import { FaSpinner } from "react-icons/fa";

type ConfirmModalProps = {
  showConfirmModal: boolean;
  onClose: () => void;
  fields: any[];
  accountData: Record<string, string>;
  nickname: string | null;
  waNumber: string;
  selectedItem: any;
  selectedPayment: any;
  discountAmount: number;
  totalPrice: number;
  onConfirmCheckout: () => void;
  isSubmitting: boolean;
};

export default function TopupConfirmModal({
  showConfirmModal,
  onClose,
  fields,
  accountData,
  nickname,
  waNumber,
  selectedItem,
  selectedPayment,
  discountAmount,
  totalPrice,
  onConfirmCheckout,
  isSubmitting,
}: ConfirmModalProps) {
  if (!showConfirmModal) return null;

  return (
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
            {fields.map((f: any) => (
              <div key={f.id} className="flex justify-between items-center text-xs font-bold">
                <span className="text-white/60 uppercase">{f.label}</span>
                <span className="font-black text-white text-right uppercase">{accountData[f.id] || "-"}</span>
              </div>
            ))}
            {nickname && (
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-white/60 uppercase">Nickname</span>
                <span className="font-black text-white text-right uppercase">{nickname}</span>
              </div>
            )}
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
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-xs font-bold text-accent-green">
                <span className="uppercase">Diskon Promo</span>
                <span className="font-black text-right">- Rp {discountAmount.toLocaleString("id-ID")}</span>
              </div>
            )}
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
            onClick={onConfirmCheckout}
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
            onClick={onClose}
            className="w-full text-white/50 hover:text-white py-1.5 text-xs font-black uppercase tracking-wider cursor-pointer transition-colors text-center hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
