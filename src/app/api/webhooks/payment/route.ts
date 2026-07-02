import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { sendEmail, generateSuccessEmailHtml } from "@/lib/sendEmail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("=========== WEBHOOK MASUK ===========");
    console.log(JSON.stringify(body, null, 2));
    
    // Generic destructuring to accommodate various PG payloads
    // Example Pakasir payload: { order_id: "...", status: "completed", amount: 22000, ... }
    const { order_id, status } = body;

    if (!order_id || !status) {
      console.log("WEBHOOK GAGAL: order_id atau status tidak ditemukan di payload");
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    // Map PG status to our local status
    let localStatus = "pending";
    const statusStr = status.toLowerCase();
    
    if (statusStr === "completed" || statusStr === "success" || statusStr === "paid") {
      localStatus = "success";
    } else if (statusStr === "failed" || statusStr === "expired" || statusStr === "cancelled") {
      localStatus = "failed";
    } else if (statusStr === "processing") {
      localStatus = "processing";
    }

    if (localStatus === "pending") {
      return NextResponse.json({ message: "Status unchanged" });
    }

    // Fetch existing transaction to get email and item_name
    const { data: trx } = await supabaseServer
      .from("topup_transactions")
      .select("email, item_name")
      .eq("id", order_id)
      .single();

    // Update transaction in database
    const { error } = await supabaseServer
      .from("topup_transactions")
      .update({
        payment_status: localStatus,
        // If payment is success, topup should generally be set to processing 
        // to be handled by the next Auto-Topup integration (Digiflazz, etc.)
        topup_status: localStatus === "success" ? "processing" : "pending"
      })
      .eq("id", order_id);

    if (error) {
      console.error("Webhook DB Update Error:", error);
      return NextResponse.json({ error: "Failed to update database" }, { status: 500 });
    }

    // --- SEND SUCCESS EMAIL ---
    if (localStatus === "success" && trx?.email && trx.email.trim() !== "") {
      const emailHtml = generateSuccessEmailHtml(order_id, trx.item_name || "Produk Game");
      sendEmail({
        to: trx.email.trim(),
        subject: `Pembayaran Berhasil #${order_id} - RyuTopup`,
        html: emailHtml,
      }).catch((e) => console.error("Failed to send success email:", e));
    }

    return NextResponse.json({ success: true, message: `Order ${order_id} updated to ${localStatus}` });
  } catch (err) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
