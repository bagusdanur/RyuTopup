type ProductInfoProps = {
  gameName: string;
};

export default function TopupProductInfo({ gameName }: ProductInfoProps) {
  const nameLower = gameName.toLowerCase();
  
  let description = `Top up ${gameName} hanya dalam hitungan detik! Cukup masukan data akun Anda, pilih item yang Anda inginkan, selesaikan pembayaran, dan item akan langsung masuk ke akun Anda secara otomatis.`;
  let warning = "⚠️ PASTIKAN DATA AKUN YANG DIMASUKKAN SUDAH BENAR SEBELUM TOP UP!";

  if (nameLower.includes("mobile legends")) {
    description = `Top up Diamond ${gameName} hanya dalam hitungan detik! Cukup masukan ID dan Server Anda, pilih jumlah Diamond yang diinginkan, selesaikan pembayaran, dan item akan langsung masuk ke akun Anda secara otomatis.`;
    warning = "⚠️ KHUSUS SERVER ORIGINAL, TIDAK BISA ISI ADVANCE SERVER. UNTUK WDP (WEEKLY DIAMOND PASS), PASTIKAN CEK SLOT TERSISA TERLEBIH DAHULU SEBELUM TOP UP!";
  } else if (nameLower.includes("free fire")) {
    description = `Top up Diamond & Membership ${gameName} hanya dalam hitungan detik! Cukup masukan Player ID Anda, pilih jumlah yang diinginkan, selesaikan pembayaran, dan item akan langsung masuk.`;
    warning = "⚠️ PASTIKAN PLAYER ID YANG DIMASUKKAN SUDAH BENAR. KESALAHAN INPUT ID BUKAN TANGGUNG JAWAB KAMI.";
  } else if (nameLower.includes("honkai")) {
    description = `Top up Oneiric Shard & Express Supply Pass ${gameName} hanya dalam hitungan detik! Cukup masukan UID & Server Anda, selesaikan pembayaran, dan item akan langsung masuk.`;
    warning = "⚠️ PASTIKAN UID DAN SERVER TUJUAN SUDAH BENAR SEBELUM MELAKUKAN TOP UP.";
  } else if (nameLower.includes("genshin")) {
    description = `Top up Genesis Crystal & Blessing of the Welkin Moon ${gameName} hanya dalam hitungan detik! Cukup masukan UID & Server Anda, selesaikan pembayaran, dan item akan langsung masuk.`;
    warning = "⚠️ PASTIKAN UID DAN SERVER TUJUAN SUDAH BENAR SEBELUM MELAKUKAN TOP UP.";
  } else if (nameLower.includes("valorant")) {
    description = `Top up Valorant Points hanya dalam hitungan detik! Cukup masukan Riot ID Anda, pilih nominal VP, selesaikan pembayaran, dan VP akan langsung masuk.`;
    warning = "⚠️ PASTIKAN RIOT ID (CONTOH: NAMA#TAG) YANG DIMASUKKAN SUDAH BENAR SEBELUM MELAKUKAN TOP UP.";
  } else if (nameLower.includes("honor of kings") || nameLower.includes("hok")) {
    description = `Top up Tokens & Weekly Pass ${gameName} hanya dalam hitungan detik! Cukup masukan Player ID Anda, pilih item yang diinginkan, selesaikan pembayaran, dan item akan langsung masuk.`;
    warning = "⚠️ PASTIKAN PLAYER ID YANG DIMASUKKAN SUDAH BENAR SEBELUM MELAKUKAN TOP UP.";
  } else if (nameLower.includes("magic chess")) {
    description = `Top up Diamond & Weekly Pass ${gameName} hanya dalam hitungan detik! Cukup masukan ID dan Server Anda, pilih item yang diinginkan, selesaikan pembayaran, dan item akan langsung masuk ke akun Anda secara otomatis.`;
    warning = "⚠️ PASTIKAN ID DAN SERVER (ZONE ID) YANG DIMASUKKAN SUDAH BENAR SEBELUM MELAKUKAN TOP UP.";
  } else if (nameLower.includes("pubg")) {
    description = `Top up UC ${gameName} hanya dalam hitungan detik! Cukup masukan Player ID Anda, pilih jumlah UC yang diinginkan, selesaikan pembayaran, dan UC akan langsung masuk ke akun Anda.`;
    warning = "⚠️ PASTIKAN PLAYER ID YANG DIMASUKKAN SUDAH BENAR SEBELUM MELAKUKAN TOP UP.";
  }

  return (
    <div className="order-last lg:order-first bg-black border-2 border-white p-5 space-y-3.5 rounded-none shadow-neo">
      <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider border-b-2 border-white pb-2">
        Informasi Produk
      </h3>
      <p className="text-[12.5px] md:text-[13.5px] text-white/80 leading-relaxed font-bold">
        {description}
      </p>
      <div className="text-[11.5px] md:text-[12.5px] text-white bg-black border-2 border-white p-3.5 font-black uppercase tracking-wider">
        {warning}
      </div>
    </div>
  );
}
