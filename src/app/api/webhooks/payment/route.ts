import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { sendEmail, generateSuccessEmailHtml } from "@/lib/sendEmail";
import { processTopup } from "@/lib/topupProvider2";

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

    // Fetch existing transaction to get email and item_name and target_id and buyer_sku_code
    const { data: trx } = await supabaseServer
      .from("topup_transactions")
      .select("email, item_name, target_id, buyer_sku_code, topup_status, game_id, username, price_base, discount_amount")
      .eq("id", order_id)
      .single();

    if (!trx) {
       return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // --- VERIFY WEBHOOK VIA PAKASIR API ---
    // Pakasir docs suggest checking status using the Transaction Detail API for better security
    const pgMerchant = process.env.PAYMENT_GATEWAY_MERCHANT_ID;
    const pgApiKey = process.env.PAYMENT_GATEWAY_API_KEY;
    const pgUrl = process.env.PAYMENT_GATEWAY_URL || "https://app.pakasir.com/api";

    let localStatus = "pending";

    if (pgMerchant && pgApiKey) {
      const trxAmount = Math.max((trx.price_base || 0) - (trx.discount_amount || 0), 0);
      const verifyUrl = `${pgUrl}/transactiondetail?project=${pgMerchant}&amount=${trxAmount}&order_id=${order_id}&api_key=${pgApiKey}`;
      
      try {
        const verifyRes = await fetch(verifyUrl);
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (verifyData.transaction && verifyData.transaction.status) {
            const apiStatus = verifyData.transaction.status.toLowerCase();
            if (apiStatus === "completed" || apiStatus === "success" || apiStatus === "paid") {
              localStatus = "success";
            } else if (apiStatus === "failed" || apiStatus === "expired" || apiStatus === "cancelled") {
              localStatus = "failed";
            } else if (apiStatus === "processing") {
              localStatus = "processing";
            }
          } else {
            console.error("Pakasir Verification Error (Unexpected Data):", verifyData);
            return NextResponse.json({ error: "Verification failed" }, { status: 400 });
          }
        } else {
          console.error("Pakasir API Error:", await verifyRes.text());
          return NextResponse.json({ error: "Failed to verify transaction with PG" }, { status: 400 });
        }
      } catch (verifyErr) {
        console.error("Pakasir Fetch Error:", verifyErr);
        return NextResponse.json({ error: "Failed to connect to PG verification" }, { status: 500 });
      }
    } else {
      // In production, we MUST NOT trust the payload fallback!
      if (process.env.NODE_ENV === "production") {
        console.error("WEBHOOK ERROR: PG configuration is missing in production!");
        return NextResponse.json({ error: "PG configuration missing" }, { status: 500 });
      }

      // Fallback if PG config is missing (trust payload - only in development)
      const statusStr = status.toLowerCase();
      if (statusStr === "completed" || statusStr === "success" || statusStr === "paid") {
        localStatus = "success";
      } else if (statusStr === "failed" || statusStr === "expired" || statusStr === "cancelled") {
        localStatus = "failed";
      } else if (statusStr === "processing") {
        localStatus = "processing";
      }
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
          
          const isNumericGame = trx.game_id && (trx.game_id.includes("mobile-legends") || trx.game_id.includes("mlbb") || trx.game_id.includes("free-fire"));
          
          let userId = trx.target_id;
          let zoneId = '';
          
          if (trx.game_id && (trx.game_id.includes("mobile-legends") || trx.game_id.includes("mlbb"))) {
             const match = trx.target_id.match(/^(\d+)(?:\(([^)]+)\))?$/);
             if (match) {
               userId = match[1];
               if (match[2]) {
                 zoneId = match[2];
               }
             } else if (trx.target_id.includes('(')) {
               userId = trx.target_id.split('(')[0];
               zoneId = trx.target_id.split('(')[1].replace(')','');
             }
          } else if (isNumericGame) {
             userId = trx.target_id.replace(/\D/g, "");
          }
          
          const topupRes = await processTopup(refId, trx.buyer_sku_code, userId, zoneId);
          
          console.log("[Auto-Topup] Provider Response:", JSON.stringify(topupRes));

          let finalTopupStatus = "processing";
          const providerStatus = topupRes?.data?.status?.toLowerCase();
          
          if (providerStatus === "sukses") {
            finalTopupStatus = "success";
          } else if (providerStatus === "gagal") {
            finalTopupStatus = "failed";
          }

          // Save provider reference ID and immediate status to database
          await supabaseServer
            .from("topup_transactions")
            .update({
              topup_status: finalTopupStatus,
              provider_ref_id: refId,
              provider_message: topupRes?.data?.message || 'Memproses transaksi ke provider',
              provider_sn: topupRes?.data?.sn || null
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
    if (localStatus === "success" && trx.email) {
      const emailHtml = generateSuccessEmailHtml(order_id, trx.item_name || "Produk Game", trx.username);
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
