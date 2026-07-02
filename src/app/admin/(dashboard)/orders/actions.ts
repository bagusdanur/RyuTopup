"use server";

import { supabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, action: string) {
  let updateData: any = {};
  
  if (action === 'processing') {
    // Admin marks payment as received manually -> topup starts processing
    updateData = { payment_status: 'success', topup_status: 'processing' };
  } else if (action === 'success') {
    // Admin simulates sending diamond manually -> topup success
    updateData = { topup_status: 'success' };
  } else if (action === 'failed') {
    // Cancel the order entirely
    updateData = { payment_status: 'failed', topup_status: 'failed' };
  }

  const { error } = await supabaseServer
    .from("topup_transactions")
    .update(updateData)
    .eq("id", orderId);

  if (error) {
    throw new Error(error.message);
  }

  // Refresh both admin page and tracking page caches
  revalidatePath("/admin/orders");
  revalidatePath("/lacak");
}
