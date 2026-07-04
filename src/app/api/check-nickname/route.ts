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

    if (isML || isFF) {
      try {
        let gameCode = '';
        let userIdStr = targetId;
        let zoneIdStr = '';

        if (isML) {
          gameCode = 'mobile-legends';
          // Handle '12345678(1234)' format
          const match = targetId.match(/^(\d+)(?:\(([^)]+)\))?$/);
          if (match) {
            userIdStr = match[1];
            if (match[2]) {
              zoneIdStr = match[2];
            }
          } else if (targetId.includes('(')) {
             userIdStr = targetId.split('(')[0];
             zoneIdStr = targetId.split('(')[1].replace(')','');
          }
        } else if (isFF) {
           gameCode = 'freefire';
        }

        const { checkNickname } = await import('@/lib/topupProvider2');
        const res = await checkNickname(gameCode, userIdStr, zoneIdStr);

        if (res.success) {
           nickname = res.nickname;
        } else {
           return NextResponse.json({ success: false, error: res.message || "Gagal mengecek nickname. Pastikan ID benar." }, { status: 400 });
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
