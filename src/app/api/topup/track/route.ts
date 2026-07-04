import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const invoiceId = searchParams.get("invoiceId");

  if (!invoiceId) {
    return NextResponse.json(
      { error: "Nomor Invoice harus diisi." },
      { status: 400 }
    );
  }

  try {
    // Query database securely via service role to get transaction state
    const { data, error } = await supabaseServer
      .from("topup_transactions")
      .select("*")
      .eq("id", invoiceId.trim().toUpperCase())
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Pesanan dengan nomor invoice tersebut tidak ditemukan." },
        { status: 404 }
      );
    }

    // Check if review exists
    const { data: reviewData } = await supabaseServer
      .from("reviews")
      .select("id")
      .eq("invoice_id", data.id)
      .maybeSingle();

    // Map database fields back to the frontend shape
    const responseData = {
      invoiceId: data.id,
      gameName: data.game_id.replace(/-/g, " ").toUpperCase(),
      gameId: data.game_id,
      item: data.item_name,
      targetId: data.target_id,
      username: data.username,
      paymentMethod: data.payment_method.toUpperCase(),
      price: `Rp ${Number(data.price_total).toLocaleString("id-ID")}`,
      priceBase: Number(data.price_base),
      priceFee: Number(data.price_fee),
      priceTotal: Number(data.price_total),
      promoCode: data.promo_code,
      discountAmount: data.discount_amount ? Number(data.discount_amount) : 0,
      createdAt: data.created_at,
      date: new Date(data.created_at).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }) + " WIB",
      status: data.payment_status === "failed" ? "failed" 
           : (data.payment_status === "success" && data.topup_status === "pending") ? "processing" 
           : data.topup_status, // pending, processing, success, failed
      hasReviewed: !!reviewData,
      pgPaymentNumber: data.pg_payment_number,
      pgExpiredAt: data.pg_expired_at,
      pgFee: data.pg_fee,
    };

    return NextResponse.json(responseData);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server: " + err.message },
      { status: 500 }
    );
  }
}
