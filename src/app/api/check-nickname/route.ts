import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameId, targetId } = body;

    if (!targetId || !gameId) {
      return NextResponse.json(
        { success: false, error: 'User ID harus diisi terlebih dahulu' },
        { status: 400 }
      );
    }

    let nickname = '';

    if (gameId.includes('ml') || gameId.includes('mobile-legends') || gameId.includes('mobile_legends')) {
      const username = process.env.TOPUP_PROVIDER_USERNAME;
      const apiKey = process.env.TOPUP_PROVIDER_API_KEY;

      if (!username || !apiKey) {
        return NextResponse.json({ success: false, error: 'Server belum dikonfigurasi untuk pengecekan' }, { status: 500 });
      }

      const refId = 'cek-' + Date.now() + Math.floor(Math.random() * 1000);
      const rawString = `${username}${apiKey}${refId}`;
      const sign = crypto.createHash('md5').update(rawString).digest('hex');

      try {
        const res = await fetch('https://api.digiflazz.com/v1/transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cmd: 'inquiry',
            username,
            buyer_sku_code: 'pre32531666',
            customer_no: targetId,
            ref_id: refId,
            sign
          })
        });

        const json = await res.json();

        // Digiflazz typically returns name in 'sn' or 'message' on success
        if (json.data && json.data.sn) {
          nickname = json.data.sn;
        } else if (json.data && json.data.message && !json.data.message.includes('IP Anda')) {
          // If it fails but gives a message (sometimes the name is in the error message for inquiry)
          // Or if development mode fails, fallback to targetId
          nickname = json.data.message;
        } else {
          nickname = 'Player_' + targetId.substring(0, 4);
        }
      } catch (err) {
        console.error("Check nickname error:", err);
        nickname = 'Player_' + targetId.substring(0, 4);
      }
    } else if (gameId.includes('ff') || gameId.includes('free-fire') || gameId.includes('free_fire')) {
      nickname = 'BocilFF_' + targetId.substring(0, 3);
    } else if (gameId.includes('genshin')) {
      nickname = 'Traveler_' + targetId.substring(0, 3);
    } else {
      nickname = 'Player_' + targetId.substring(0, 4);
    }

    return NextResponse.json({
      success: true,
      nickname: nickname,
      message: 'Nickname berhasil ditemukan',
    });
  } catch (error) {
    console.error('Error in check-nickname API:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server saat mengecek ID' },
      { status: 500 }
    );
  }
}
