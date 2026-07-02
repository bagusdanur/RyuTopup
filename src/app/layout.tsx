import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Preloader from "@/components/Preloader";
import SocialProof from "@/components/SocialProof";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RyuTopup - Top Up Game Instan Termurah & Tercepat",
    template: "%s | RyuTopup"
  },
  description: "Platform top up game terpercaya, aman, dan instan 24/7. Dukungan berbagai pembayaran e-wallet, QRIS, VA, dan retail.",
  keywords: ["top up game", "top up murah", "top up ml", "top up ff", "top up pubg", "ryutopup", "topup game instan", "diamond ml murah"],
  authors: [{ name: "RyuTopup" }],
  creator: "RyuTopup",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://ryutopup.com",
    title: "RyuTopup - Top Up Game Instan Termurah",
    description: "Top up diamond, UC, dan voucher game favoritmu dengan harga paling miring dan proses secepat kilat. Dukungan pembayaran lengkap!",
    siteName: "RyuTopup",
    images: [
      {
        url: "https://ryutopup.com/og-image.jpg", // Make sure to add this image later
        width: 1200,
        height: 630,
        alt: "RyuTopup - Top Up Game Murah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RyuTopup - Top Up Game Instan",
    description: "Top up diamond, UC, dan voucher game favoritmu dengan harga paling miring dan proses secepat kilat.",
    images: ["https://ryutopup.com/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Preloader />
        <SocialProof />
        {children}
      </body>
    </html>
  );
}
