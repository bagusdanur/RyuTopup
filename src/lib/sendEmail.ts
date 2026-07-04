import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'RyuTopup <cs@ryutopup.web.id>',
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email via Resend:', error);
      return { success: false, error };
    }

    console.log('Email sent via Resend: %s', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error in sendEmail (Resend):', error);
    return { success: false, error };
  }
}

export function generateInvoiceEmailHtml(
  invoiceId: string, 
  itemName: string, 
  total: number, 
  promoCode?: string | null, 
  discountAmount?: number | null,
  username?: string | null
) {
  const promoHtml = promoCode && discountAmount 
    ? `<p style="margin: 5px 0; color: #00ffcc;"><strong>Diskon Promo (${promoCode}):</strong> - Rp ${discountAmount.toLocaleString("id-ID")}</p>`
    : "";
    
  const usernameHtml = username
    ? `<p style="margin: 5px 0;"><strong>Username / Nickname:</strong> ${username}</p>`
    : "";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111; color: #fff; border: 2px solid #fff; padding: 20px;">
      <h1 style="color: #00ffcc; text-transform: uppercase; margin-top: 0;">Tagihan Baru - RyuTopup</h1>
      <p>Halo,</p>
      <p>Pesanan Anda telah berhasil dibuat. Berikut adalah rincian tagihan Anda:</p>
      <div style="background-color: #222; padding: 15px; border: 1px solid #fff; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Nomor Pesanan:</strong> ${invoiceId}</p>
        <p style="margin: 5px 0;"><strong>Produk:</strong> ${itemName}</p>
        ${usernameHtml}
        ${promoHtml}
        <p style="margin: 5px 0; color: #00ffcc; font-weight: bold; font-size: 18px;"><strong>Total Tagihan:</strong> Rp ${total.toLocaleString("id-ID")}</p>
      </div>
      <p>Silakan lakukan pembayaran agar pesanan Anda dapat segera kami proses.</p>
      <a href="https://ryutopup.web.id/pesanan/${invoiceId}" style="display: inline-block; background-color: #00ffcc; color: #000; padding: 10px 20px; text-decoration: none; font-weight: bold; margin-top: 10px; border: 2px solid #000;">BAYAR SEKARANG</a>
      <p style="margin-top: 30px; font-size: 12px; color: #888;">
        Email ini dikirim otomatis oleh sistem RyuTopup. Mohon tidak membalas email ini.
      </p>
    </div>
  `;
}

export function generatePaymentReceivedEmailHtml(invoiceId: string, itemName: string, username?: string | null, targetId?: string | null, paymentMethod?: string | null) {
  const usernameHtml = username
    ? `<p style="margin: 5px 0;"><strong>Username / Nickname:</strong> ${username}</p>`
    : "";
  const targetIdHtml = targetId
    ? `<p style="margin: 5px 0;"><strong>ID Player:</strong> ${targetId}</p>`
    : "";
  const paymentMethodHtml = paymentMethod
    ? `<p style="margin: 5px 0;"><strong>Metode Bayar:</strong> ${paymentMethod}</p>`
    : "";
    
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111; color: #fff; border: 2px solid #fff; padding: 20px;">
      <h1 style="color: #ff9900; text-transform: uppercase; margin-top: 0;">Pembayaran Diterima</h1>
      <p>Halo,</p>
      <p>Terima kasih! Kami telah menerima pembayaran untuk pesanan Anda.</p>
      <div style="background-color: #222; padding: 15px; border: 1px solid #fff; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Nomor Pesanan:</strong> ${invoiceId}</p>
        <p style="margin: 5px 0;"><strong>Produk:</strong> ${itemName}</p>
        ${targetIdHtml}
        ${usernameHtml}
        ${paymentMethodHtml}
        <p style="margin: 5px 0; color: #ff9900; font-weight: bold;"><strong>Status:</strong> Sedang Diproses</p>
      </div>
      <p>Pesanan Anda sedang dalam antrean pengiriman. Biasanya item akan masuk dalam hitungan detik hingga beberapa menit.</p>
      <a href="https://ryutopup.web.id/pesanan/${invoiceId}" style="display: inline-block; background-color: #ff9900; color: #000; padding: 10px 20px; text-decoration: none; font-weight: bold; margin-top: 10px; border: 2px solid #000;">LACAK PESANAN</a>
      <p style="margin-top: 30px; font-size: 12px; color: #888;">
        Email ini dikirim otomatis oleh sistem RyuTopup. Mohon tidak membalas email ini.
      </p>
    </div>
  `;
}

export function generateTopupSuccessEmailHtml(invoiceId: string, itemName: string, username?: string | null, targetId?: string | null, sn?: string | null) {
  const usernameHtml = username
    ? `<p style="margin: 5px 0;"><strong>Username / Nickname:</strong> ${username}</p>`
    : "";
  const targetIdHtml = targetId
    ? `<p style="margin: 5px 0;"><strong>ID Player:</strong> ${targetId}</p>`
    : "";
  const snHtml = sn
    ? `<p style="margin: 10px 0; padding: 10px; background-color: #333; border-left: 4px solid #00ffcc;"><strong>Kode Voucher / SN:</strong><br><span style="font-size: 16px; font-family: monospace;">${sn}</span></p>`
    : "";
    
  // Time in WIB
  const dateWIB = new Date(new Date().getTime() + 7 * 3600 * 1000).toUTCString().replace(/ GMT$/, "") + " WIB";
    
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111; color: #fff; border: 2px solid #00ffcc; padding: 20px;">
      <h1 style="color: #00ffcc; text-transform: uppercase; margin-top: 0;">🎮 Top-Up Berhasil!</h1>
      <p>Halo,</p>
      <p>Hore! Pesanan Anda telah berhasil diproses dan dikirimkan.</p>
      <div style="background-color: #222; padding: 15px; border: 1px solid #00ffcc; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Nomor Pesanan:</strong> ${invoiceId}</p>
        <p style="margin: 5px 0;"><strong>Produk:</strong> ${itemName}</p>
        ${targetIdHtml}
        ${usernameHtml}
        ${snHtml}
        <p style="margin: 10px 0 5px 0; color: #00ffcc; font-weight: bold;"><strong>Status:</strong> Sukses</p>
        <p style="margin: 5px 0; font-size: 12px; color: #aaa;">Waktu Selesai: ${dateWIB}</p>
      </div>
      <p>Terima kasih telah berbelanja di RyuTopup! Ditunggu orderan selanjutnya ya.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #888;">
        Email ini dikirim otomatis oleh sistem RyuTopup. Mohon tidak membalas email ini.
      </p>
    </div>
  `;
}
