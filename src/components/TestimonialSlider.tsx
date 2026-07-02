"use client";

import { useEffect, useState } from "react";
import { FiStar } from "react-icons/fi";

type Review = {
  id: string;
  invoice_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

export default function TestimonialSlider() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/reviews");
        const data = await res.json();
        if (data.reviews) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (isLoading || reviews.length === 0) return null;

  // Duplicate reviews to create an infinite scrolling effect if there are too few
  const displayReviews = [...reviews, ...reviews, ...reviews];

  return (
    <div className="w-full overflow-hidden bg-black border-y-2 border-white py-6 md:py-8 my-10 relative">
      <div className="max-w-6xl mx-auto px-4 md:px-6 mb-6 text-center">
        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest">
          APA KATA MEREKA?
        </h2>
        <p className="text-white/60 text-xs md:text-sm font-bold mt-1">
          Ulasan asli dari pelanggan setia kami
        </p>
      </div>

      <div className="relative flex w-full flex-nowrap overflow-hidden">
        <div className="flex animate-marquee hover:pause-marquee min-w-max gap-4 px-4">
          {displayReviews.map((review, i) => (
            <div
              key={`${review.id}-${i}`}
              className="bg-black border-2 border-white p-4 w-[280px] md:w-[320px] shadow-neo-sm shrink-0 flex flex-col justify-between"
            >
              <div>
                <div className="flex text-accent-orange mb-2 text-lg">
                  {[...Array(5)].map((_, index) => (
                    <FiStar
                      key={index}
                      className={index < review.rating ? "fill-current" : "text-white/20"}
                    />
                  ))}
                </div>
                <p className="text-white/90 text-[11.5px] md:text-xs font-bold leading-relaxed line-clamp-3 mb-3">
                  {review.comment || "Transaksi cepat dan aman, mantap!"}
                </p>
              </div>
              <div className="text-[10px] text-white/50 font-black uppercase tracking-wider border-t border-white/20 pt-2 mt-auto">
                Invoice: {review.invoice_id.substring(0, 8)}***
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .pause-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
