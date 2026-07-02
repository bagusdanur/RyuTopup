"use client";

import TopupHeader from "@/components/TopupHeader";
import TopupFooter from "@/components/TopupFooter";

export default function SyaratKetentuanPage() {
  return (
    <div className="bg-black text-white font-sans min-h-screen flex flex-col antialiased">
      {/* HEADER */}
      <TopupHeader searchQuery="" onSearchChange={() => {}} />

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-10">
        
        {/* Page Title */}
        <div className="space-y-4 border-b-4 border-white pb-6 text-center md:text-left">
          <span className="text-[12px] font-black tracking-[0.2em] uppercase text-white/50 bg-white/10 px-3 py-1 border-2 border-white/20 inline-block">
            Legal & Policy
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight uppercase tracking-wider">Syarat & Ketentuan</h1>
          <p className="text-white/70 text-xs md:text-sm font-bold max-w-2xl">
            Terakhir Diperbarui: 21 Juni 2026. Harap baca syarat dan ketentuan ini dengan saksama sebelum menggunakan layanan RyuTopup.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-white/80 text-[13px] md:text-sm leading-relaxed font-bold">
          
          <section className="bg-black border-2 border-white p-6 shadow-neo space-y-4">
            <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-3 uppercase tracking-wider">
              <span className="w-8 h-8 border-2 border-white bg-white text-black flex items-center justify-center font-black shrink-0 text-sm">
                1
              </span>
              Ketentuan Umum
            </h2>
            <p className="pl-0 md:pl-11">
              Dengan mengakses dan menggunakan situs web <strong className="font-black text-accent-yellow">RyuTopup</strong>, Anda secara otomatis menyatakan bahwa Anda telah membaca, memahami, dan menyetujui untuk terikat oleh seluruh Syarat & Ketentuan Pengguna yang berlaku di platform kami.
            </p>
            <p className="pl-0 md:pl-11">
              RyuTopup berhak untuk mengubah, memodifikasi, menambah, atau menghapus bagian mana pun dari Syarat & Ketentuan ini sewaktu-waktu tanpa pemberitahuan terlebih dahulu. Penggunaan platform secara terus-menerus setelah adanya pembaruan menandakan persetujuan Anda terhadap perubahan tersebut.
            </p>
          </section>

          <section className="bg-black border-2 border-white p-6 shadow-neo space-y-4">
            <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-3 uppercase tracking-wider">
              <span className="w-8 h-8 border-2 border-white bg-white text-black flex items-center justify-center font-black shrink-0 text-sm">
                2
              </span>
              Kewenangan Transaksi
            </h2>
            <p className="pl-0 md:pl-11">
              RyuTopup bertindak sebagai platform penyedia layanan pembayaran untuk memfasilitasi transaksi top-up game Anda. Kami memiliki hak penuh untuk:
            </p>
            <ul className="list-disc pl-5 md:pl-16 space-y-2 text-white/70">
              <li>Menolak atau membatalkan pesanan atau transaksi kapan saja tanpa memberikan penjelasan atau pemberitahuan terlebih dahulu demi alasan keamanan sistem.</li>
              <li>Membatasi jumlah pembelian pada akun pengguna tertentu jika dicurigai melakukan aktivitas yang tidak wajar atau melanggar hukum.</li>
              <li>Melakukan penyesuaian harga produk sewaktu-waktu sesuai dengan fluktuasi harga distributor atau server game.</li>
            </ul>
          </section>

          <section className="bg-black border-2 border-white p-6 shadow-neo space-y-4">
            <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-3 uppercase tracking-wider">
              <span className="w-8 h-8 border-2 border-white bg-white text-black flex items-center justify-center font-black shrink-0 text-sm">
                3
              </span>
              Tanggung Jawab Data Pengguna
            </h2>
            <p className="pl-0 md:pl-11">
              Selaku pembeli, Anda memikul tanggung jawab penuh atas akurasi data informasi pelanggan yang Anda masukkan pada saat checkout transaksi (termasuk namun tidak terbatas pada <strong className="font-black text-white">User ID</strong>, <strong className="font-black text-white">Zone ID / Server</strong>, dan <strong className="font-black text-white">Nomor WhatsApp</strong>).
            </p>
            <div className="ml-0 md:ml-11 mt-4 bg-accent-red border-2 border-white text-white p-4 text-[12px] md:text-[13px] font-black uppercase tracking-wide shadow-neo-sm">
              ⚠️ PENTING: RyuTopup tidak bertanggung jawab atas kesalahan pengiriman diamonds, UC, atau item game lainnya yang disebabkan oleh kesalahan input data player oleh pembeli. Transaksi yang telah diproses secara otomatis oleh sistem tidak dapat ditarik kembali, dibatalkan, atau dialihkan ke akun lain.
            </div>
          </section>

          <section className="bg-black border-2 border-white p-6 shadow-neo space-y-4">
            <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-3 uppercase tracking-wider">
              <span className="w-8 h-8 border-2 border-white bg-white text-black flex items-center justify-center font-black shrink-0 text-sm">
                4
              </span>
              Metode Pembayaran & Biaya Admin
            </h2>
            <p className="pl-0 md:pl-11">
              RyuTopup mendukung berbagai metode pembayaran yang sah seperti QRIS, E-wallet (DANA, OVO, GoPay, ShopeePay), Transfer Virtual Account Bank, dan Gerai Retail (Alfamart / Indomaret).
            </p>
            <p className="pl-0 md:pl-11">
              Setiap metode pembayaran memiliki admin fee (biaya administrasi) yang berbeda-beda yang ditentukan secara otomatis oleh payment gateway kami. Jumlah total yang harus Anda bayarkan (termasuk biaya admin dan kode unik pembayaran jika ada) akan ditampilkan dengan jelas sebelum Anda menyelesaikan pemesanan.
            </p>
          </section>

          <section className="bg-black border-2 border-white p-6 shadow-neo space-y-4">
            <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-3 uppercase tracking-wider">
              <span className="w-8 h-8 border-2 border-white bg-white text-black flex items-center justify-center font-black shrink-0 text-sm">
                5
              </span>
              Pengembalian Dana (Refund Policy)
            </h2>
            <p className="pl-0 md:pl-11">
              Seluruh transaksi pembelian di RyuTopup bersifat final. Pengembalian dana (refund) hanya dapat dilakukan apabila:
            </p>
            <ul className="list-disc pl-5 md:pl-16 space-y-2 text-white/70">
              <li>Terjadi kegagalan sistem pada sisi platform kami yang mengakibatkan produk gagal terkirim dan tidak dapat dipulihkan dalam kurun waktu 24 jam.</li>
              <li>Stok item game yang Anda pesan sedang kosong atau tidak tersedia pada sistem distributor kami.</li>
            </ul>
            <p className="pl-0 md:pl-11 mt-4 text-accent-orange font-black uppercase tracking-wide text-xs">
              Refund tidak akan diberikan jika status transaksi di sistem kami telah dinyatakan sukses, atau jika kesalahan disebabkan oleh kelalaian pembeli (salah memasukkan data game).
            </p>
          </section>

          <section className="bg-black border-2 border-white p-6 shadow-neo space-y-4">
            <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-3 uppercase tracking-wider">
              <span className="w-8 h-8 border-2 border-white bg-white text-black flex items-center justify-center font-black shrink-0 text-sm">
                6
              </span>
              Hak Kekayaan Intelektual
            </h2>
            <p className="pl-0 md:pl-11">
              Seluruh konten yang terdapat di dalam situs web RyuTopup (termasuk namun tidak terbatas pada teks, grafik, logo, ikon, gambar, klip audio, unduhan digital, kompilasi data, dan perangkat lunak) adalah milik eksklusif <strong className="font-black text-white">RyuTopup</strong> atau penyedia kontennya, dan dilindungi oleh undang-undang hak cipta nasional serta hukum kekayaan intelektual yang berlaku.
            </p>
          </section>

          <section className="bg-black border-2 border-white p-6 shadow-neo space-y-4">
            <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-3 uppercase tracking-wider">
              <span className="w-8 h-8 border-2 border-white bg-white text-black flex items-center justify-center font-black shrink-0 text-sm">
                7
              </span>
              Kontak CS & Pengaduan
            </h2>
            <p className="pl-0 md:pl-11">
              Apabila Anda mengalami kendala pembayaran, keterlambatan pemrosesan item top-up, atau ingin menanyakan tentang status pengembalian dana, Anda dapat menghubungi Customer Service resmi kami melalui tombol WhatsApp CS yang tersedia di bagian bawah platform. Hubungi kami dengan menyertakan bukti transaksi dan nomor invoice pesanan Anda demi kelancaran investigasi kendala.
            </p>
          </section>

        </div>

      </main>

      {/* FOOTER */}
      <TopupFooter />
    </div>
  );
}
