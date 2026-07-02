import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoiceId, rating, comment } = body;

    if (!invoiceId || !rating) {
      return NextResponse.json({ error: 'Data ulasan tidak lengkap' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Cek apakah invoice ini sudah pernah di-rating
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('invoice_id', invoiceId)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json({ error: 'Invoice ini sudah pernah diberi ulasan' }, { status: 400 });
    }

    // Simpan ke tabel reviews
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        { 
          invoice_id: invoiceId, 
          rating, 
          comment: comment || ''
        }
      ]);

    if (error) {
      console.error('Error saving review:', error);
      return NextResponse.json({ error: 'Gagal menyimpan ulasan' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Ulasan berhasil disimpan' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createClient();
    
    // Ambil 10 ulasan terbaru dengan rating 4/5
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .gte('rating', 4)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: 'Gagal memuat ulasan' }, { status: 500 });
    }

    return NextResponse.json({ reviews: data });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
