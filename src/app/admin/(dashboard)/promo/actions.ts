"use server";

import { supabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export async function createPromoCode(data: {
  code: string;
  discount_amount?: number;
  discount_percentage?: number;
  max_discount?: number;
  min_purchase?: number;
  quota?: number;
}) {
  const upperCode = data.code.trim().toUpperCase();
  
  if (!upperCode) throw new Error("Kode promo wajib diisi");

  if (!data.discount_amount && !data.discount_percentage) {
    throw new Error("Diskon nominal atau persentase wajib diisi");
  }

  const { error } = await supabaseServer
    .from("promo_codes")
    .insert({
      code: upperCode,
      discount_amount: data.discount_amount || null,
      discount_percentage: data.discount_percentage || null,
      max_discount: data.max_discount || null,
      min_purchase: data.min_purchase || null,
      quota: data.quota || null,
      is_active: true
    });

  if (error) {
    console.error("Create Promo Error:", error);
    if (error.code === '23505') {
      throw new Error("Kode promo ini sudah ada!");
    }
    throw new Error("Gagal membuat kode promo");
  }

  revalidatePath("/admin/promo");
}

export async function togglePromoStatus(id: string, isActive: boolean) {
  const { error } = await supabaseServer
    .from("promo_codes")
    .update({ is_active: !isActive })
    .eq("id", id);

  if (error) throw new Error("Gagal mengupdate status promo");
  revalidatePath("/admin/promo");
}

export async function deletePromoCode(id: string) {
  const { error } = await supabaseServer
    .from("promo_codes")
    .delete()
    .eq("id", id);

  if (error) throw new Error("Gagal menghapus kode promo");
  revalidatePath("/admin/promo");
}
