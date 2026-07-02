import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// Cache this API response for 5 minutes (300 seconds)
// This is critical to save Supabase Egress limits!
export const revalidate = 300;

export async function GET() {
  try {
    // Fetch last 15 successful transactions
    const { data, error } = await supabaseServer
      .from("topup_transactions")
      .select("wa_number, item_name")
      .eq("payment_status", "success")
      .order("created_at", { ascending: false })
      .limit(15);

    if (error) {
      console.error("Error fetching recent orders:", error);
      return NextResponse.json({ success: false, data: [] }, { status: 500 });
    }

    // Mask WA Numbers before sending to client for privacy
    const maskedData = (data || []).map((order) => {
      let masked = "0812****56"; // fallback
      if (order.wa_number && order.wa_number.length >= 8) {
        const wa = String(order.wa_number);
        const start = wa.substring(0, 4);
        const end = wa.substring(wa.length - 2);
        masked = `${start}****${end}`;
      }

      return {
        wa: masked,
        item: order.item_name || "Diamonds",
      };
    });

    return NextResponse.json({ success: true, data: maskedData });
  } catch (error) {
    console.error("Recent orders error:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
