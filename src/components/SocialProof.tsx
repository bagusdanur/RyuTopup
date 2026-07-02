"use client";

import { useState, useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa";

interface Order {
  wa: string;
  item: string;
}

export default function SocialProof() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fetch recent orders from our cached API
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/recent-orders");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setOrders(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch social proof:", error);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length === 0) return;

    // Show popup every 12 seconds
    const interval = setInterval(() => {
      // Pick next order
      setCurrentIndex((prev) => (prev + 1) % orders.length);
      setIsVisible(true);

      // Hide popup after 4 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 4000);

    }, 12000);

    return () => clearInterval(interval);
  }, [orders]);

  if (!isVisible || orders.length === 0) return null;

  const currentOrder = orders[currentIndex];

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-fadeInUp">
      <div className="bg-black/90 backdrop-blur-md border border-white/20 p-3 flex items-center gap-3 shadow-neo-sm">
        <div className="w-10 h-10 bg-accent-green flex items-center justify-center shrink-0">
          <FaShoppingCart className="text-black w-4 h-4" />
        </div>
        <div>
          <p className="text-xs text-white/70">Baru saja membeli</p>
          <p className="text-sm font-black text-white leading-tight">
            {currentOrder.item}
          </p>
          <p className="text-xs font-mono text-accent-green mt-0.5">
            {currentOrder.wa}
          </p>
        </div>
      </div>
    </div>
  );
}
