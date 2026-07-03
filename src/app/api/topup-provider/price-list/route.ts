import { NextResponse } from 'next/server';
import { getPriceList } from '@/lib/topupProvider';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cmd = searchParams.get('cmd') || 'prepaid'; // prepaid or postpaid
    
    const data = await getPriceList(cmd);
    
    if (data && data.data) {
      return NextResponse.json({
        success: true,
        data: data.data
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
      error: error.message || 'Failed to fetch price list'
    }, { status: 500 });
  }
}
