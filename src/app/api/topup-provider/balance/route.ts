import { NextResponse } from 'next/server';
import { checkBalance } from '@/lib/topupProvider';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await checkBalance();
    
    // VIP Reseller balance format:
    // { result: true, data: { balance: 0, ... } }
    if (data && data.result === true && data.data && data.data.balance !== undefined) {
      const balance = data.data.balance;

      // Simpan saldo terbaru ke site_settings (background, tidak blocking)
      ;(async () => {
        try {
          await supabaseServer.from('site_settings').upsert(
            { key: 'provider_balance', value: balance.toString() },
            { onConflict: 'key' }
          );
        } catch (e: any) {
          console.error('[balance] Failed to save to DB:', e?.message);
        }
      })();

      return NextResponse.json({
        success: true,
        balance: balance
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Format data tidak sesuai dari provider',
      raw: data
    }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check balance'
    }, { status: 500 });
  }
}
