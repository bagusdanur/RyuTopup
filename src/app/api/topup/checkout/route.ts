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
      promoCode,
      discountAmount,
      username,
    } = body;

    // Validate required inputs
    if (!waNumber || !gameId || !targetId || !itemCode || !itemName || !paymentMethod) {
      return NextResponse.json(
        { error: "Mohon lengkapi seluruh data transaksi." },
        { status: 400 }
      );
    }

    const invoiceId = generateInvoiceId();

    // 1. SECURE SERVER-SIDE VALIDATION OF PRODUCT PRICE
    const { data: productData, error: productError } = await supabaseServer
      .from("products")
      .select("price, buyer_sku_code")
      .eq("id", itemCode)
      .single();

    if (productError || !productData) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan atau tidak aktif." },
        { status: 404 }
      );
    }

    const validatedPriceBase = Number(productData.price);

    // 2. SECURE SERVER-SIDE VALIDATION OF PAYMENT FEES
    let validatedPriceFee = 2500; // default VA fee
    const cleanMethod = paymentMethod.toLowerCase();
    if (cleanMethod === "qris") {
      validatedPriceFee = 0;
    } else if (["shopeepay", "gopay", "dana", "ovo"].includes(cleanMethod)) {
      validatedPriceFee = cleanMethod === "shopeepay" ? 1200 : 1000;
    } else if (["bni", "bri", "mandiri", "bsi", "danamon", "cimb", "bnc"].includes(cleanMethod)) {
      validatedPriceFee = 2500;
    }

    // 3. SECURE SERVER-SIDE VALIDATION OF PROMO CODES
    let validatedDiscount = 0;
    if (promoCode) {
      const upperCode = promoCode.trim().toUpperCase();
      const { data: promoData } = await supabaseServer
        .from("promo_codes")
        .select("*")
        .eq("code", upperCode)
        .eq("is_active", true)
        .maybeSingle();

      if (promoData) {
        const isNotExpired = !promoData.expires_at || new Date(promoData.expires_at) >= new Date();
        const hasQuota = promoData.quota === null || promoData.used < promoData.quota;
        const meetsMin = !promoData.min_purchase || validatedPriceBase >= Number(promoData.min_purchase);

        if (isNotExpired && hasQuota && meetsMin) {
          if (promoData.discount_amount) {
            validatedDiscount = Number(promoData.discount_amount);
          } else if (promoData.discount_percentage) {
            let percDisc = Math.floor((validatedPriceBase * Number(promoData.discount_percentage)) / 100);
            if (promoData.max_discount && percDisc > Number(promoData.max_discount)) {
              percDisc = Number(promoData.max_discount);
            }
            validatedDiscount = percDisc;
          }
          
          if (validatedDiscount >= validatedPriceBase) {
            validatedDiscount = validatedPriceBase - 1; // at least pay Rp 1
          }

          // Securely update promo quota/usage on checkout creation
          await supabaseServer
            .from("promo_codes")
            .update({ used: promoData.used + 1 })
            .eq("id", promoData.id);
        }
      }
    }

    let validatedPriceTotal = Math.max(validatedPriceBase + validatedPriceFee - validatedDiscount, 0);

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
        mappedMethod = 'atm_bersama_va';
      }

      // Call PG API (e.g. POST /transactioncreate/{mappedMethod})
      try {
        const pgResponse = await fetch(`${pgUrl}/transactioncreate/${mappedMethod}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            project: pgMerchant,
            order_id: invoiceId,
            amount: Math.max(validatedPriceBase - (validatedDiscount || 0), 0),
            api_key: pgApiKey
          })
        });

        if (pgResponse.ok) {
          const pgData = await pgResponse.json();
          if (pgData && pgData.payment) {
            pgPaymentNumber = pgData.payment.payment_number;
            pgExpiredAt = pgData.payment.expired_at;
            pgFee = pgData.payment.fee;
            
            // OVERRIDE local fee and total with Pakasir's actual calculated fee and total (including unique codes)
            if (pgData.payment.fee !== undefined) {
              validatedPriceFee = Number(pgData.payment.fee);
            }
            if (pgData.payment.total_payment !== undefined) {
              validatedPriceTotal = Number(pgData.payment.total_payment);
            }
          }
        } else {
          console.error("PG API Error:", await pgResponse.text());
        }
      } catch (pgErr) {
        console.error("Failed to connect to Payment Gateway:", pgErr);
      }
    }

    // Insert new transaction row in the database securely
    const { data, error } = await supabaseServer
      .from("topup_transactions")
      .insert({
        id: invoiceId,
        wa_number: waNumber.trim(),
        email: email ? email.trim() : null,
        game_id: gameId.trim(),
        target_id: targetId.trim(),
        username: username ? username.trim() : null,
        item_name: itemName.trim(),
        item_code: itemCode.trim(),
        price_base: validatedPriceBase,
        price_fee: validatedPriceFee,
        price_total: validatedPriceTotal,
        payment_method: paymentMethod.trim(),
        payment_status: "pending",
        topup_status: "pending",
        pg_payment_number: pgPaymentNumber,
        pg_expired_at: pgExpiredAt,
        pg_fee: pgFee,
        promo_code: promoCode ? promoCode.trim().toUpperCase() : null,
        discount_amount: validatedDiscount,
        buyer_sku_code: productData?.buyer_sku_code || null
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
      const emailHtml = generateInvoiceEmailHtml(invoiceId, itemName, validatedPriceTotal, promoCode, validatedDiscount, username);
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
