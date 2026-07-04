import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// Global rate limit map (memory based)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

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

    // Validasi Nomor WA (Hanya angka, mulai dari 08 atau 628, panjang 10-15 karakter)
    const cleanWa = waNumber.replace(/\D/g, "");
    if (!/^(08|628)\d{8,13}$/.test(cleanWa)) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tidak valid. Gunakan format 08xxx atau 628xxx" },
        { status: 400 }
      );
    }

    // Rate Limiting (Mencegah spam dari IP yang sama)
    const ip = request.headers.get("x-forwarded-for")?.split(',')[0] || request.headers.get("x-real-ip") || "127.0.0.1";
    
    // Check if IP is in rate limit map
    const now = Date.now();
    const limitWindowMs = 10 * 60 * 1000; // 10 menit
    const maxRequests = 5;

    let rateData = rateLimitMap.get(ip);
    if (!rateData) {
      rateData = { count: 1, resetTime: now + limitWindowMs };
      rateLimitMap.set(ip, rateData);
    } else {
      if (now > rateData.resetTime) {
        // Reset window
        rateData.count = 1;
        rateData.resetTime = now + limitWindowMs;
      } else {
        rateData.count++;
        if (rateData.count > maxRequests) {
          return NextResponse.json(
            { error: "Terlalu banyak pesanan. Silakan coba lagi setelah 10 menit." },
            { status: 429 }
          );
        }
      }
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

    // Default fee — will be overridden by Pakasir PG response if configured
    let validatedPriceFee = 0;

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

          // Promo validation passed successfully. Quota is updated upon payment success.
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
