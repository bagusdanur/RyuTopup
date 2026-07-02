"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FiBell, FiX } from "react-icons/fi";

interface Toast {
  id: string;
  invoiceId: string;
  game: string;
  amount: string;
}

export default function AdminNotifier() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Function to synthesize a "Ting!" sound
  const playTing = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Arcade coin/ting sound effect
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio not supported or blocked", e);
    }
  };

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to new topup transactions
    const channel = supabase
      .channel("admin-orders-notifier")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "topup_transactions",
        },
        (payload) => {
          const newOrder = payload.new;
          
          // Play sound
          playTing();
          
          // Add to toast list
          const newToast: Toast = {
            id: newOrder.id,
            invoiceId: newOrder.invoice_id,
            game: newOrder.game_name,
            amount: newOrder.total_amount 
              ? `Rp ${newOrder.total_amount.toLocaleString("id-ID")}` 
              : "Menunggu",
          };
          
          setToasts((prev) => [...prev, newToast]);
          
          // Auto remove after 6 seconds
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
          }, 6000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className="bg-accent border-4 border-black p-4 flex items-start gap-4 shadow-[4px_4px_0_#000] animate-bounce-in pointer-events-auto max-w-sm w-full"
        >
          <div className="w-10 h-10 shrink-0 bg-black text-accent border-2 border-black flex items-center justify-center rounded-none">
            <FiBell className="w-5 h-5 animate-wiggle" />
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-black text-black uppercase tracking-wider text-sm leading-tight">
                Pesanan Baru Masuk!
              </h4>
              <button 
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-black/50 hover:text-black transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-1 space-y-0.5 text-xs text-black font-bold">
              <p>Invoice: <span className="font-mono">{toast.invoiceId}</span></p>
              <p>Game: <span className="uppercase">{toast.game}</span></p>
              <p>Nominal: <span className="font-mono">{toast.amount}</span></p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
