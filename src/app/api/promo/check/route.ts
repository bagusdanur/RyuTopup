import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { code, originalPrice, waNumber } = await req.json();

    if (!code || !originalPrice || !waNumber) {
      return NextResponse.json({ success: false, error: "Data tidak lengkap" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // use service role for full access
    const supabase = createClient(supabaseUrl, supabaseKey);

    const upperCode = code.trim().toUpperCase();

    // 1. Get Promo Code
    const { data: promo, error: promoError } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", upperCode)
      .maybeSingle();

    if (promoError || !promo) {
      return NextResponse.json({ success: false, error: "Kode Promo tidak valid atau tidak ditemukan." }, { status: 404 });
    }

    if (!promo.is_active) {
      return NextResponse.json({ success: false, error: "Kode Promo ini sudah tidak aktif." }, { status: 400 });
    }

    // 2. Check Expiry
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: "Kode Promo ini sudah kadaluarsa." }, { status: 400 });
    }

    // 2b. Check Min Purchase
    if (promo.min_purchase && originalPrice < Number(promo.min_purchase)) {
      return NextResponse.json({ success: false, error: `Minimal belanja untuk promo ini adalah Rp ${Number(promo.min_purchase).toLocaleString("id-ID")}` }, { status: 400 });
    }

    // 3. Check Quota
    if (promo.quota !== null && promo.used >= promo.quota) {
      return NextResponse.json({ success: false, error: "Kuota Kode Promo ini sudah habis digunakan." }, { status: 400 });
    }

    // 4. Check 1 per WA restriction (Ensure WA hasn't used this code in a pending/success transaction)
    const { count: waUsageCount, error: waError } = await supabase
      .from("topup_transactions")
      .select("*", { count: "exact", head: true })
      .eq("wa_number", waNumber)
      .eq("promo_code", upperCode)
      .in("payment_status", ["pending", "success"]);

    if (waError) {
      console.error("WA Check Error:", waError);
      return NextResponse.json({ success: false, error: "Terjadi kesalahan server saat memvalidasi WA." }, { status: 500 });
    }

    if (waUsageCount && waUsageCount > 0) {
      return NextResponse.json({ success: false, error: "Nomor WA ini sudah pernah menggunakan Kode Promo tersebut." }, { status: 400 });
    }

    // 5. Calculate Discount
    let calculatedDiscount = 0;

    if (promo.discount_amount) {
      calculatedDiscount = Number(promo.discount_amount);
    } else if (promo.discount_percentage) {
      let percDisc = Math.floor((Number(originalPrice) * Number(promo.discount_percentage)) / 100);
      if (promo.max_discount && percDisc > Number(promo.max_discount)) {
        percDisc = Number(promo.max_discount);
      }
      calculatedDiscount = percDisc;
    }

    // Discount cannot exceed original price
    if (calculatedDiscount >= originalPrice) {
      calculatedDiscount = originalPrice - 1; // At least pay Rp 1 to avoid negative or 0 transactions which midtrans blocks
    }

    if (calculatedDiscount <= 0) {
      return NextResponse.json({ success: false, error: "Diskon tidak valid (potongan terlalu kecil)." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      discount: calculatedDiscount,
      finalPrice: originalPrice - calculatedDiscount
    });

  } catch (err: any) {
    console.error("Promo API Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
