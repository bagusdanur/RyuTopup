"use client";

import { useState } from "react";
import { FiDownload } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";

export default function ExportCsvButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const supabase = createClient();
      // Fetch all successful and processing orders for export
      const { data, error } = await supabase
        .from("topup_transactions")
        .select("*")
        .in("topup_status", ["success", "processing", "pending"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        alert("Tidak ada data pesanan untuk di-export.");
        setIsExporting(false);
        return;
      }

      // Format to CSV
      const headers = [
        "Invoice ID", "Tanggal", "Game", "Item", "Target ID", "WhatsApp", 
        "Total Bayar", "Metode Bayar", "Status Topup"
      ];

      const csvRows = [headers.join(",")];

      data.forEach(order => {
        const date = new Date(order.created_at).toLocaleString('id-ID');
        const row = [
          order.id,
          `"${date}"`,
          `"${order.game_id}"`,
          `"${order.item_name}"`,
          `"${order.target_id}"`,
          order.wa_number,
          order.price_total,
          order.payment_method,
          order.topup_status
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Laporan_RyuTopup_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err: any) {
      alert("Gagal export data: " + err.message);
    }
    setIsExporting(false);
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="bg-black text-white px-4 py-2 border-2 border-black font-black uppercase text-xs shadow-neo-sm hover:bg-white hover:text-black transition-all flex items-center gap-2"
    >
      <FiDownload className="w-4 h-4" />
      {isExporting ? "Menyiapkan..." : "Export CSV"}
    </button>
  );
}
