import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { createClient } from "@/lib/supabase/server";

// Helper: cek apakah request berasal dari admin yang terautentikasi
async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
}

// GET — ambil semua settings atau satu setting by key
// GET boleh diakses siapapun (dipakai di frontend topup page untuk baca stok/popup)
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");

  if (key) {
    const { data, error } = await supabaseServer
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ key, value: data?.value ?? null });
  }

  const { data, error } = await supabaseServer
    .from("site_settings")
    .select("key, value");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST — upsert satu setting (HANYA admin yang terautentikasi)
export async function POST(req: NextRequest) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

  // Whitelist keys yang boleh diubah (mencegah arbitrary key injection)
  const ALLOWED_KEYS = ["show_social_proof", "enable_dynamic_stock", "provider_balance"];
  if (!ALLOWED_KEYS.includes(key)) {
    return NextResponse.json({ error: "Key tidak diizinkan" }, { status: 403 });
  }

  const { error } = await supabaseServer
    .from("site_settings")
    .upsert({ key, value }, { onConflict: "key" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, key, value });
}
