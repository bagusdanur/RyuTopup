type ProductInfoProps = {
  gameName: string;
};

export default function TopupProductInfo({ gameName }: ProductInfoProps) {
  return (
    <div className="order-last lg:order-first bg-black border-2 border-white p-5 space-y-3.5 rounded-none shadow-neo">
      <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider border-b-2 border-white pb-2">
        Informasi Produk
      </h3>
      <p className="text-[12.5px] md:text-[13.5px] text-white/80 leading-relaxed font-bold">
        Top up Diamond {gameName} hanya dalam hitungan detik! Cukup masukan data akun Anda, pilih jumlah Diamond yang Anda inginkan, selesaikan pembayaran, dan item akan langsung masuk ke akun Anda secara otomatis.
      </p>
      <div className="text-[11.5px] md:text-[12.5px] text-white bg-black border-2 border-white p-3.5 font-black uppercase tracking-wider">
        ⚠️ Khusus Server Original, tidak bisa isi Advance Server. Untuk WDP (Weekly Diamond Pass), pastikan cek slot tersisa terlebih dahulu sebelum top up!
      </div>
    </div>
  );
}
