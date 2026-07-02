"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [show, setShow] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Only run on initial load
    const hasLoadedBefore = sessionStorage.getItem("hasLoadedRyutopup");
    
    if (hasLoadedBefore) {
      setShow(false);
      return;
    }

    // Keep it black for 1.2s, then trigger fade out animation
    const timer1 = setTimeout(() => {
      setIsFading(true);
    }, 1200);

    // Completely remove from DOM after fade out completes (e.g. 500ms later)
    const timer2 = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("hasLoadedRyutopup", "true");
    }, 1700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-transform duration-500 ease-in-out ${
        isFading ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{
        backgroundImage: "linear-gradient(#111 1px, transparent 1px)",
        backgroundSize: "100% 4px"
      }}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <span className="text-4xl md:text-6xl font-black italic tracking-wide text-white flex items-center gap-1 animate-pulse">
          <span>RYU</span>
          <span className="bg-accent text-black px-3 py-1 border-4 border-accent not-italic font-black text-2xl md:text-4xl shadow-neo">
            TOPUP
          </span>
        </span>
        
        <div className="flex items-center gap-2 mt-8">
          <span className="w-3 h-3 bg-accent-red animate-ping rounded-full"></span>
          <span className="text-accent-red font-mono text-sm font-black uppercase tracking-widest">
            INSERT COIN...
          </span>
        </div>
      </div>
    </div>
  );
}
