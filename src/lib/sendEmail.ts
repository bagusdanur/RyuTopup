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

export function generateSuccessEmailHtml(invoiceId: string, itemName: string, username?: string | null) {
  const usernameHtml = username
    ? `<p style="margin: 5px 0;"><strong>Username / Nickname:</strong> ${username}</p>`
    : "";
    
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111; color: #fff; border: 2px solid #fff; padding: 20px;">
      <h1 style="color: #ff9900; text-transform: uppercase; margin-top: 0;">Pembayaran Berhasil</h1>
      <p>Halo,</p>
      <p>Terima kasih! Kami telah menerima pembayaran untuk pesanan Anda.</p>
      <div style="background-color: #222; padding: 15px; border: 1px solid #fff; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Nomor Pesanan:</strong> ${invoiceId}</p>
        <p style="margin: 5px 0;"><strong>Produk:</strong> ${itemName}</p>
        ${usernameHtml}
        <p style="margin: 5px 0; color: #ff9900; font-weight: bold;"><strong>Status:</strong> Sedang Diproses</p>
      </div>
      <p>Pesanan Anda sedang dalam antrean pengiriman. Biasanya item akan masuk dalam hitungan detik hingga beberapa menit.</p>
      <a href="https://ryutopup.web.id/lacak?invoice=${invoiceId}" style="display: inline-block; background-color: #ff9900; color: #000; padding: 10px 20px; text-decoration: none; font-weight: bold; margin-top: 10px; border: 2px solid #000;">LACAK PESANAN</a>
      <p style="margin-top: 30px; font-size: 12px; color: #888;">
        Email ini dikirim otomatis oleh sistem RyuTopup. Mohon tidak membalas email ini.
      </p>
    </div>
  `;
}
