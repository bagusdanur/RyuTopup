import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { sendEmail, generatePaymentReceivedEmailHtml } from "@/lib/sendEmail";
import { processTopup } from "@/lib/topupProvider";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("=========== WEBHOOK MASUK ===========");
    console.log(JSON.stringify(body, null, 2));
    
    // Generic destructuring to accommodate various PG payloads
    const { order_id, status, bypass_pg_verify } = body;

    if (!order_id || !status) {
      console.log("WEBHOOK GAGAL: order_id atau status tidak ditemukan di payload");
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    // Fetch existing transaction to get email and item_name and target_id and buyer_sku_code
    const { data: trx } = await supabaseServer
      .from("topup_transactions")
      .select("email, item_name, target_id, buyer_sku_code, topup_status, game_id, username, price_base, discount_amount, payment_method, promo_code")
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
    
    // Get sender IP
    const headerList = request.headers;
    const ip = headerList.get("x-forwarded-for")?.split(',')[0] || headerList.get("x-real-ip") || "127.0.0.1";
    
    // Gunakan password rahasia untuk testing bypass DAN pastikan IP dari VPS kita
    const webhookBypassSecret = process.env.WEBHOOK_BYPASS_SECRET;
    const isBypassed = webhookBypassSecret && bypass_pg_verify === webhookBypassSecret && (ip === "103.103.22.251" || ip === "127.0.0.1" || ip === "::1");

    if (pgMerchant && pgApiKey && !isBypassed) {
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
      if (process.env.NODE_ENV === "production" && !isBypassed) {
        console.error("WEBHOOK ERROR: PG configuration is missing in production!");
        return NextResponse.json({ error: "PG configuration missing" }, { status: 500 });
      }

      // Fallback if PG config is missing (trust payload - only in development or if bypassed)
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
      // Securely update promo quota on payment success
      if (trx.promo_code) {
        try {
          // Atomic increment: use raw SQL via rpc or direct update with filter
          // This avoids race conditions by letting the database handle the increment
          const { error: promoError } = await supabaseServer
            .rpc('increment_promo_used', { promo_code_input: trx.promo_code.toUpperCase() });
          
          // Fallback if RPC doesn't exist: use non-atomic update (better than nothing)
          if (promoError) {
            console.warn("RPC increment_promo_used not found, falling back to non-atomic update:", promoError.message);
            const { data: promoData } = await supabaseServer
              .from("promo_codes")
              .select("id, used")
              .eq("code", trx.promo_code.toUpperCase())
              .maybeSingle();

            if (promoData) {
              await supabaseServer
                .from("promo_codes")
                .update({ used: promoData.used + 1 })
                .eq("id", promoData.id);
            }
          }
        } catch (promoErr) {
          console.error("Failed to update promo usage on webhook success:", promoErr);
        }
      }

      // Only trigger if we have a buyer_sku_code
      if (trx.buyer_sku_code && trx.target_id) {
        try {
          console.log(`[Auto-Topup] Triggering topup for Order ${order_id} with SKU ${trx.buyer_sku_code}`);
          const refId = `RTP-${order_id}`; // Unique Ref ID for provider
          
          const isNumericGame = trx.game_id && (
            trx.game_id.includes("free-fire") || 
            trx.game_id.includes("pubg") || 
            trx.game_id.includes("honor-of-kings") || 
            trx.game_id.includes("hok")
          );
          
          const isHoyoGame = trx.game_id && (
            trx.game_id.includes("genshin") || 
            trx.game_id.includes("star-rail") || 
            trx.game_id.includes("hsr")
          );
          
          const isValorant = trx.game_id && trx.game_id.includes("valorant");
          
          let userId = trx.target_id.trim();
          let zoneId = '';
          
          if (trx.game_id && (trx.game_id.includes("mobile-legends") || trx.game_id.includes("mlbb") || trx.game_id.includes("magic-chess"))) {
             const match = trx.target_id.match(/^([^(]+)(?:\(([^)]+)\))?$/);
             if (match) {
               userId = match[1].trim().replace(/\D/g, "");
               if (match[2]) {
                 zoneId = match[2].trim().replace(/\D/g, "");
               }
             } else if (trx.target_id.includes('(')) {
               userId = trx.target_id.split('(')[0].trim().replace(/\D/g, "");
               zoneId = trx.target_id.split('(')[1].replace(')','').trim().replace(/\D/g, "");
             } else {
               userId = trx.target_id.trim().replace(/\D/g, "");
             }
          } else if (isHoyoGame) {
             // Genshin/HSR: extract UID and map server name to VIP Reseller zone codes
             const match = trx.target_id.match(/^([^(]+)(?:\(([^)]+)\))?$/);
             if (match) {
               userId = match[1].trim().replace(/\D/g, "");
               if (match[2]) {
                 const serverName = match[2].trim().toLowerCase();
                 if (serverName.includes("asia")) zoneId = "os_asia";
                 else if (serverName.includes("america") || serverName.includes("usa")) zoneId = "os_usa";
                 else if (serverName.includes("euro")) zoneId = "os_euro";
                 else if (serverName.includes("tw") || serverName.includes("hk") || serverName.includes("mo")) zoneId = "os_cht";
                 else zoneId = serverName; // Pass raw value as fallback
               }
             } else {
               userId = trx.target_id.replace(/\D/g, "");
             }
          } else if (isValorant) {
             // Valorant uses Riot ID (Username#Tag) — keep as-is, don't strip non-numeric
             userId = trx.target_id.trim();
          } else if (isNumericGame) {
             userId = trx.target_id.replace(/\D/g, "");
          }
          
          const topupRes = await processTopup(refId, trx.buyer_sku_code, userId, zoneId);
          
          console.log("[Auto-Topup] Provider Response:", JSON.stringify(topupRes));
 
          let finalTopupStatus = "processing";
          let providerMsg = "Memproses transaksi ke provider";
          
          if (topupRes.success) {
            const providerStatus = topupRes?.data?.status?.toLowerCase();
            if (providerStatus === "sukses") {
              finalTopupStatus = "success";
            } else if (providerStatus === "gagal") {
              finalTopupStatus = "failed";
            }
            providerMsg = topupRes?.data?.note || providerMsg;
          } else {
            finalTopupStatus = "failed";
            providerMsg = topupRes?.message || "Gagal mengirim ke provider";
          }
 
          // Save provider reference ID and immediate status to database
          await supabaseServer
            .from("topup_transactions")
            .update({
              topup_status: finalTopupStatus,
              provider_ref_id: topupRes?.data?.trxid || refId,
              provider_message: providerMsg,
              provider_sn: topupRes?.data?.sn || null
            })
            .eq("id", order_id);
            
        } catch (topupErr) {
          console.error("[Auto-Topup] Provider Error:", topupErr);
          await supabaseServer
            .from("topup_transactions")
            .update({
              topup_status: "failed",
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
      const emailHtml = generatePaymentReceivedEmailHtml(order_id, trx.item_name || "Produk Game", trx.username, trx.target_id, trx.payment_method);
      sendEmail({
        to: trx.email.trim(),
        subject: `✅ Pembayaran Diterima #${order_id} - RyuTopup`,
        html: emailHtml,
      }).catch((e) => console.error("Failed to send success email:", e));
    }

    return NextResponse.json({ success: true, message: `Order ${order_id} updated to ${localStatus}` });
  } catch (err) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
