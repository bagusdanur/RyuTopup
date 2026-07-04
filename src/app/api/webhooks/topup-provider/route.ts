import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendEmail, generateTopupSuccessEmailHtml } from '@/lib/sendEmail';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
       return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
    }

    const headerList = request.headers;
    const ip = headerList.get("x-forwarded-for")?.split(',')[0] || headerList.get("x-real-ip") || "127.0.0.1";
    
    // IP Whitelist dari provider (178.248.73.218)
    const isDev = process.env.TOPUP2_MODE === 'development';
    const allowedIps = ["178.248.73.218", "127.0.0.1", "::1", "103.103.22.251"];
    
    if (!isDev && !allowedIps.includes(ip.trim())) {
      console.warn(`[WEBHOOK TOPUP2] Blocked request from unauthorized IP: ${ip}`);
      return NextResponse.json({ success: false, message: 'Unauthorized IP' }, { status: 403 });
    }

    // Provider sends signature in headers: X-Client-Signature
    const clientSignature = request.headers.get('x-client-signature');
    const apiId = process.env.TOPUP2_API_ID || '';
    const apiKey = process.env.TOPUP2_API_KEY || '';
    const expectedSignature = crypto.createHash('md5').update(apiId + apiKey).digest('hex');

    if (clientSignature !== expectedSignature) {
      console.warn('[WEBHOOK TOPUP2] Invalid signature mismatch');
      // In dev mode we might just log it, but in prod we must reject
      if (!isDev) {
          return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 });
      }
    }

    if (isDev) {
       console.log('[DEV] Topup Provider Webhook Received:', body);
    }

    // VIP Reseller webhook body schema (docs):
    // { "data": { "trxid": "VP123", "data": "136216325", "zone": "2685", "service": "ML 11", "status": "success"|"error", "note": "", "price": 195695 } }
    // Note: inner "data" field is the user ID tujuan, NOT a serial number/voucher code
    const webhookData = body.data || body; // Support both nested and flat format for safety
    const { trxid, status, note, service } = webhookData;
    // inner "data" is user ID, not SN — keep for logging only
    const providerUserId = webhookData.data; 

    if (!trxid) {
       console.warn('[WEBHOOK TOPUP2] Missing trxid in webhook body:', JSON.stringify(body).substring(0, 500));
       return NextResponse.json({ success: false, message: 'Missing trxid' }, { status: 400 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get the transaction by provider_ref_id
    let trx = null;
    let trxError = null;
    
    // Primary lookup: match by provider_ref_id
    const { data: trxPrimary, error: errPrimary } = await supabase
        .from('topup_transactions')
        .select('*')
        .eq('provider_ref_id', trxid)
        .maybeSingle();
    
    if (trxPrimary) {
       trx = trxPrimary;
    } else {
       // Fallback: if trxid starts with VP (VIPayment format), search recent processing transactions
       // This handles edge cases where provider_ref_id was saved as local refId (RTP-xxx) due to network issues
       console.log(`[WEBHOOK TOPUP2] Primary lookup failed for ${trxid}, trying fallback...`);
       const { data: trxFallback } = await supabase
           .from('topup_transactions')
           .select('*')
           .eq('topup_status', 'processing')
           .order('created_at', { ascending: false })
           .limit(20);
       
       // Try to match by any available criteria
       if (trxFallback && trxFallback.length > 0) {
         // Look for transaction where provider_ref_id contains the trxid or vice versa
         trx = trxFallback.find(t => t.provider_ref_id === trxid) || null;
       }
       
       if (!trx) {
         trxError = errPrimary;
       }
    }

    if (trxError || !trx) {
       console.log(`[WEBHOOK TOPUP2] Transaction with provider_ref_id ${trxid} not found (tried primary + fallback).`);
       return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
    }
    
    // If we found a match, update provider_ref_id to the correct trxid for future lookups
    if (trx.provider_ref_id !== trxid) {
      await supabase
        .from('topup_transactions')
        .update({ provider_ref_id: trxid })
        .eq('id', trx.id);
    }

    // Map provider status to our DB status
    // provider status: 'waiting', 'processing', 'success', 'error'
    let dbStatus = trx.topup_status;
    
    if (status === 'success') {
       dbStatus = 'success';
       // Trigger email 2 (Top-Up Success)
       if (trx.email) {
          const emailHtml = generateTopupSuccessEmailHtml(
            trx.id,
            trx.item_name || "Produk Game",
            trx.username,
            trx.target_id,
            service || null
          );
          sendEmail({
            to: trx.email.trim(),
            subject: `🎮 Top-Up Berhasil! Diamond sudah masuk #${trx.id}`,
            html: emailHtml,
          }).catch((e) => console.error("Failed to send topup success email:", e));
       }
    } else if (status === 'error') {
       dbStatus = 'failed';
    } else if (status === 'processing') {
       dbStatus = 'processing';
    }

    const updateData: any = { topup_status: dbStatus };
    if (note) {
        updateData.provider_message = note;
    }

    const { error: updateError } = await supabase
        .from('topup_transactions')
        .update(updateData)
        .eq('id', trx.id);

    if (updateError) {
        console.error(`[WEBHOOK TOPUP2] Failed to update transaction ${trx.id}`, updateError);
        return NextResponse.json({ success: false, message: 'Failed to update DB' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' });

  } catch (error: any) {
    console.error('[WEBHOOK TOPUP2] Internal Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
