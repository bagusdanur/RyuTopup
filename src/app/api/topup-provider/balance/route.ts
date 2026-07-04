import { NextResponse } from 'next/server';
import { checkBalance } from '@/lib/topupProvider';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await checkBalance();
    
    // VIP Reseller balance format:
    // { result: true, data: { balance: 0, ... } }
    if (data && data.result === true && data.data && data.data.balance !== undefined) {
      return NextResponse.json({
        success: true,
        balance: data.data.balance
      });
    }

    // Digiflazz fallback if still using digiflazz
    if (data && data.data && data.data.deposit !== undefined) {
      return NextResponse.json({
        success: true,
        balance: data.data.deposit
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
