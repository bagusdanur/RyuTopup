import { NextResponse } from 'next/server';
import { checkBalance } from '@/lib/topupProvider';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await checkBalance();
    
    // Asumsikan struktur data balasan Digiflazz:
    // { data: { deposit: 1000000 } }
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
