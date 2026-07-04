import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// GET — ambil semua settings atau satu setting by key
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

// POST — upsert satu setting
export async function POST(req: NextRequest) {
  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

  const { error } = await supabaseServer
    .from("site_settings")
    .upsert({ key, value }, { onConflict: "key" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, key, value });
}
