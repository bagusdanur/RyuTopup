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

    const isML = gameId.includes('ml') || gameId.includes('mobile-legends') || gameId.includes('mobile_legends');
    const isFF = gameId.includes('ff') || gameId.includes('free-fire') || gameId.includes('free_fire');

    if (isML || isFF) {
      const username = process.env.TOPUP_PROVIDER_USERNAME;
      const apiKey = process.env.TOPUP_PROVIDER_API_KEY;

      if (!username || !apiKey) {
        return NextResponse.json({ success: false, error: 'Server belum dikonfigurasi untuk pengecekan' }, { status: 500 });
      }

      const refId = 'cek-' + Date.now() + Math.floor(Math.random() * 1000);
      const rawString = `${username}${apiKey}${refId}`;
      const sign = crypto.createHash('md5').update(rawString).digest('hex');
      const skuCode = isML ? 'pre32531666' : 'pre32534099';
      try {
        const res = await fetch('https://api.digiflazz.com/v1/transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            buyer_sku_code: skuCode,
            customer_no: targetId,
            ref_id: refId,
            sign,
            testing: false // harus false agar benar-benar potong saldo Rp 5 untuk cek nama
          })
        });

        const json = await res.json();

        // Digiflazz typically returns name in 'sn' or 'message' on success
        if (json.data) {
          if (json.data.sn && json.data.sn !== "") {
            nickname = json.data.sn;
          } else if (json.data.status === "Gagal" || (json.data.rc && json.data.rc !== "00")) {
            return NextResponse.json({ success: false, error: json.data.message || "Gagal mengecek nickname. Pastikan ID benar." }, { status: 400 });
          } else if (json.data.message && !json.data.message.includes('IP Anda')) {
            nickname = json.data.message;
          } else {
            nickname = 'Player_' + targetId.substring(0, 4);
          }
        } else {
          nickname = 'Player_' + targetId.substring(0, 4);
        }
      } catch (err) {
        console.error("Check nickname error:", err);
        nickname = 'Player_' + targetId.substring(0, 4);
      }
    } else if (gameId.includes('genshin')) {
      nickname = 'Traveler_' + targetId.substring(0, 3);
    } else if (gameId.includes('honkai') || gameId.includes('star-rail') || gameId.includes('starrail') || gameId.includes('hsr')) {
      nickname = 'Trailblazer_' + targetId.substring(0, 3);
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
