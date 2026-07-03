import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseServer } from '@/lib/supabaseServer';
import { sendEmail, generateSuccessEmailHtml } from '@/lib/sendEmail';

export async function POST(request: Request) {
  try {
    // Digiflazz sends the signature in x-hub-signature header
    // The format is sha1=HMAC_SHA1(payload, secret)
    const signatureHeader = request.headers.get('x-hub-signature') || request.headers.get('x-digiflazz-delivery');
    const secret = process.env.TOPUP_PROVIDER_WEBHOOK_SECRET;

    if (!secret) {
      console.error("[Provider Webhook] Secret is not configured");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // We need the raw body for signature validation
    const rawBody = await request.text();
    
    // Validate signature if header exists
    if (signatureHeader) {
      const hmac = crypto.createHmac('sha1', secret);
      const calculatedSignature = 'sha1=' + hmac.update(rawBody).digest('hex');
      
      if (signatureHeader !== calculatedSignature) {
        console.error("[Provider Webhook] Invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else {
       console.warn("[Provider Webhook] No signature header found, proceeding with caution (dev mode only)");
       if (process.env.NODE_ENV === 'production') {
          return NextResponse.json({ error: "Missing signature" }, { status: 401 });
       }
    }

    const payload = JSON.parse(rawBody);
    console.log("[Provider Webhook] Payload:", JSON.stringify(payload, null, 2));

    // Digiflazz payload structure (data object)
    const { data } = payload;
    if (!data || !data.ref_id) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    const refId = data.ref_id;
    // Our refId format is RTP-{order_id}
    const orderId = refId.replace('RTP-', '');
    const statusStr = data.status?.toLowerCase();
    
    let localTopupStatus = "pending";
    if (statusStr === "sukses") {
      localTopupStatus = "success";
    } else if (statusStr === "gagal") {
      localTopupStatus = "failed";
    } else if (statusStr === "pending") {
      localTopupStatus = "processing";
    } else {
      localTopupStatus = statusStr;
    }

    // Fetch existing transaction
    const { data: trx } = await supabaseServer
      .from("topup_transactions")
      .select("email, item_name, topup_status")
      .eq("id", orderId)
      .single();

    if (!trx) {
       return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (trx.topup_status === "success" || trx.topup_status === "failed") {
       // If it's already in final state, don't update it again
       // return NextResponse.json({ message: "Transaction already finalized" });
    }

    // Update database
    const { error } = await supabaseServer
      .from("topup_transactions")
      .update({
        topup_status: localTopupStatus,
        provider_trx_id: data.trx_id,
        provider_sn: data.sn,
        provider_message: data.message
      })
      .eq("id", orderId);

    if (error) {
      console.error("[Provider Webhook] DB Update Error:", error);
      return NextResponse.json({ error: "Failed to update database" }, { status: 500 });
    }

    // Send email notification to user
    // Note: If payment was successful earlier, an email was already sent. 
    // Here we could send a "Topup Berhasil" email if needed, but the original implementation 
    // sent success email on payment webhook.
    if (localTopupStatus === "success" && trx.email && trx.topup_status !== "success") {
       // Optional: Send item delivery notification (with SN/Voucher code)
       console.log(`[Provider Webhook] Item successfully delivered for ${orderId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Provider Webhook] Error processing webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
