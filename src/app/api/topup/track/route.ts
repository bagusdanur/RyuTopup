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

    // Map database fields back to the frontend shape
    const responseData = {
      invoiceId: data.id,
      gameName: data.game_id.replace("-", " ").toUpperCase(),
      gameId: data.game_id,
      item: data.item_name,
      targetId: data.target_id,
      paymentMethod: data.payment_method.toUpperCase(),
      price: `Rp ${Number(data.price_total).toLocaleString("id-ID")}`,
      priceBase: Number(data.price_base),
      priceFee: Number(data.price_fee),
      priceTotal: Number(data.price_total),
      createdAt: data.created_at,
      date: new Date(data.created_at).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }) + " WIB",
      status: data.topup_status, // pending, processing, success, failed
    };

    return NextResponse.json(responseData);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server: " + err.message },
      { status: 500 }
    );
  }
}
