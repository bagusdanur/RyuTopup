import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { sendEmail, generateInvoiceEmailHtml } from "@/lib/sendEmail";

// Generate unique invoice ID in the format: RTP-YYYYMMDD-XXXXX
function generateInvoiceId(): string {
  const jakartaDate = new Date();
  // Adjust to GMT+7 (WIB) just to be aligned with local timezone
  const utc = jakartaDate.getTime() + jakartaDate.getTimezoneOffset() * 60000;
  const wibDate = new Date(utc + 3600000 * 7);

  const year = wibDate.getFullYear();
  const month = String(wibDate.getMonth() + 1).padStart(2, "0");
  const day = String(wibDate.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomStr = "";
  for (let i = 0; i < 5; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RTP-${dateStr}-${randomStr}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      waNumber,
      email,
      gameId,
      targetId,
      itemCode,
      itemName,
      priceBase,
      priceFee,
      priceTotal,
      paymentMethod,
    } = body;

    // Validate required inputs
    if (
      !waNumber ||
      !gameId ||
      !targetId ||
      !itemCode ||
      !itemName ||
      priceBase === undefined ||
      priceFee === undefined ||
      priceTotal === undefined ||
      !paymentMethod
    ) {
      return NextResponse.json(
        { error: "Mohon lengkapi seluruh data transaksi." },
        { status: 400 }
      );
    }

    const invoiceId = generateInvoiceId();

    // --- PAYMENT GATEWAY INTEGRATION ---
    const pgUrl = process.env.PAYMENT_GATEWAY_URL;
    const pgMerchant = process.env.PAYMENT_GATEWAY_MERCHANT_ID;
    const pgApiKey = process.env.PAYMENT_GATEWAY_API_KEY;
    
    let pgPaymentNumber = null;
    let pgExpiredAt = null;
    let pgFee = null;

    if (pgUrl && pgMerchant && pgApiKey) {
      // Map local payment method to generic PG method
      let mappedMethod = paymentMethod.toLowerCase();
      if (['shopeepay', 'gopay', 'dana', 'ovo', 'qris'].includes(mappedMethod)) {
        mappedMethod = 'qris';
      } else if (['bni', 'bri', 'cimb', 'bnc'].includes(mappedMethod)) {
        mappedMethod = `${mappedMethod}_va`;
        if (mappedMethod === 'cimb_va') mappedMethod = 'cimb_niaga_va';
      } else if (['mandiri', 'bsi', 'danamon'].includes(mappedMethod)) {
        // Fallback for VA not explicitly listed in PG
        mappedMethod = 'atm_bersama_va';
      }

      // 1. Call PG API (e.g. POST /transactioncreate/{mappedMethod})
      // Using generic endpoint structure (adaptable to Pakasir/Tripay style)
      try {
        const pgResponse = await fetch(`${pgUrl}/transactioncreate/${mappedMethod}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            project: pgMerchant,
            order_id: invoiceId,
            amount: priceBase, // PG usually calculates its own fee based on base amount
            api_key: pgApiKey
          })
        });

        if (pgResponse.ok) {
          const pgData = await pgResponse.json();
          // Assuming typical PG response structure:
          if (pgData && pgData.payment) {
            pgPaymentNumber = pgData.payment.payment_number;
            pgExpiredAt = pgData.payment.expired_at;
            pgFee = pgData.payment.fee;
          }
        } else {
          console.error("PG API Error:", await pgResponse.text());
          // We don't block the transaction completely if PG fails, we just don't have PG data. 
          // Or you can choose to return an error here.
        }
      } catch (pgErr) {
        console.error("Failed to connect to Payment Gateway:", pgErr);
      }
    }
    // -----------------------------------

    // Insert new transaction row in the database securely via the server-side service role client
    const { data, error } = await supabaseServer
      .from("topup_transactions")
      .insert({
        id: invoiceId,
        wa_number: waNumber.trim(),
        email: email ? email.trim() : null,
        game_id: gameId.trim(),
        target_id: targetId.trim(),
        item_name: itemName.trim(),
        item_code: itemCode.trim(),
        price_base: priceBase,
        price_fee: priceFee,
        price_total: priceTotal,
        payment_method: paymentMethod.trim(),
        payment_status: "pending",
        topup_status: "pending",
        pg_payment_number: pgPaymentNumber,
        pg_expired_at: pgExpiredAt,
        pg_fee: pgFee
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json(
        { error: `Gagal memproses transaksi di database: ${error.message}` },
        { status: 500 }
      );
    }

    // --- SEND INVOICE EMAIL ---
    if (email && email.trim() !== "") {
      const emailHtml = generateInvoiceEmailHtml(invoiceId, itemName, priceTotal);
      // Fire and forget (don't await) so it doesn't slow down checkout
      sendEmail({
        to: email.trim(),
        subject: `Tagihan Pembayaran #${invoiceId} - RyuTopup`,
        html: emailHtml,
      }).catch((e) => console.error("Failed to send invoice email:", e));
    }

    return NextResponse.json({
      success: true,
      invoiceId: data.id,
      message: "Transaksi berhasil dibuat",
    });
  } catch (err: any) {
    console.error("Checkout Server Error:", err);
    return NextResponse.json(
      { error: `Terjadi kesalahan server: ${err.message}` },
      { status: 500 }
    );
  }
}
