import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { headers } from 'next/headers';

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const LIMIT = 10; // Max 10 inquiries
const WINDOW = 60 * 1000; // per 1 minute

export async function POST(request: Request) {
  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(',')[0] || headerList.get("x-real-ip") || "127.0.0.1";

    const now = Date.now();
    const rateData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - rateData.lastReset > WINDOW) {
      rateData.count = 0;
      rateData.lastReset = now;
    }

    if (rateData.count >= LIMIT) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak permintaan pengecekan. Silakan coba lagi setelah 1 menit.' },
        { status: 429 }
      );
    }

    rateData.count += 1;
    rateLimitMap.set(ip, rateData);

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
    const isGenshin = gameId.includes('genshin');
    const isHSR = gameId.includes('honkai') || gameId.includes('star-rail') || gameId.includes('starrail') || gameId.includes('hsr');
    const isValorant = gameId.includes('valorant');

    if (isML || isFF || isGenshin || isHSR || isValorant) {
      try {
        let gameCode = '';
        let userIdStr = targetId;
        let zoneIdStr = '';

        // Parsing targetId format "userId(zoneId)"
        if (targetId.includes('(') && targetId.includes(')')) {
          const match = targetId.match(/^(.+?)(?:\(([^)]+)\))?$/);
          if (match) {
            userIdStr = match[1];
            if (match[2]) {
              zoneIdStr = match[2];
            }
          }
        }

        if (isML) {
          gameCode = 'mobile-legends';
        } else if (isFF) {
          gameCode = 'freefire';
        } else if (isGenshin) {
          gameCode = 'genshin-impact';
        } else if (isHSR) {
          gameCode = 'honkai-star-rail';
        } else if (isValorant) {
          gameCode = 'valorant';
        }

        const { checkNickname } = await import('@/lib/topupProvider2');
        const res = await checkNickname(gameCode, userIdStr, zoneIdStr);

        if (res.success) {
           nickname = res.nickname;
        } else {
           return NextResponse.json({ success: false, error: res.message || "Gagal mengecek nickname. Pastikan data akun benar." }, { status: 400 });
        }
      } catch (err) {
        console.error("Check nickname error:", err);
        return NextResponse.json({ success: false, error: "Terjadi kesalahan sistem saat mengecek nickname." }, { status: 500 });
      }
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
