import { NextResponse } from 'next/server';

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

    // Simulasi delay API provider (misal: VIP Reseller / Digiflazz)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Validasi mock sederhana
    if (targetId.length < 5) {
      return NextResponse.json(
        { success: false, error: 'User ID tidak valid atau tidak ditemukan' },
        { status: 404 }
      );
    }

    // Generate mock nickname berdasarkan targetId
    let mockNickname = 'Player_' + targetId.substring(0, 4);

    if (gameId.includes('ml') || gameId.includes('mobile-legends') || gameId.includes('mobile_legends')) {
      mockNickname = 'SultanML_' + targetId.substring(0, 3);
    } else if (gameId.includes('ff') || gameId.includes('free-fire') || gameId.includes('free_fire')) {
      mockNickname = 'BocilFF_' + targetId.substring(0, 3);
    } else if (gameId.includes('genshin')) {
      mockNickname = 'Traveler_' + targetId.substring(0, 3);
    }

    return NextResponse.json({
      success: true,
      nickname: mockNickname,
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
