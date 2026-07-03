import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { sendEmail, generateSuccessEmailHtml } from "@/lib/sendEmail";
import { processTopup } from "@/lib/topupProvider";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("=========== WEBHOOK MASUK ===========");
    console.log(JSON.stringify(body, null, 2));
    
    // Generic destructuring to accommodate various PG payloads
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

    // Fetch existing transaction to get email and item_name and target_id and buyer_sku_code
    const { data: trx } = await supabaseServer
      .from("topup_transactions")
      .select("email, item_name, target_id, buyer_sku_code, topup_status")
      .eq("id", order_id)
      .single();

    if (!trx) {
       return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Update transaction payment status in database
    const { error } = await supabaseServer
      .from("topup_transactions")
      .update({
        payment_status: localStatus,
        topup_status: localStatus === "success" && trx.topup_status === "pending" ? "processing" : trx.topup_status
      })
      .eq("id", order_id);

    if (error) {
      console.error("Webhook DB Update Error:", error);
      return NextResponse.json({ error: "Failed to update database" }, { status: 500 });
    }

    // --- AUTO TOPUP INTEGRATION ---
    if (localStatus === "success" && trx.topup_status === "pending") {
      // Only trigger if we have a buyer_sku_code
      if (trx.buyer_sku_code && trx.target_id) {
        try {
          console.log(`[Auto-Topup] Triggering topup for Order ${order_id} with SKU ${trx.buyer_sku_code}`);
          const refId = `RTP-${order_id}`; // Unique Ref ID for provider
          const topupRes = await processTopup(refId, trx.buyer_sku_code, trx.target_id);
          
          console.log("[Auto-Topup] Provider Response:", JSON.stringify(topupRes));

          // Save provider reference ID to database
          await supabaseServer
            .from("topup_transactions")
            .update({
              provider_ref_id: refId,
              provider_message: topupRes?.data?.message || 'Memproses transaksi ke provider'
            })
            .eq("id", order_id);
            
        } catch (topupErr) {
          console.error("[Auto-Topup] Provider Error:", topupErr);
          await supabaseServer
            .from("topup_transactions")
            .update({
              provider_message: "Error menghubungi provider"
            })
            .eq("id", order_id);
        }
      } else {
         console.log(`[Auto-Topup] Skipped for Order ${order_id}: Missing buyer_sku_code or target_id`);
      }
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
