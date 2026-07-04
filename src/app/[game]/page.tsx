import { notFound } from "next/navigation";
import { Metadata } from "next";
import TopupFormClient from "./TopupFormClient";
import { supabaseServer } from "@/lib/supabaseServer";

interface PageProps {
  params: Promise<{
    game: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { game } = await params;
  
  const { data: gameData } = await supabaseServer
    .from("games")
    .select("name, cover")
    .eq("slug", game)
    .single();

  if (!gameData) return { title: "Game tidak ditemukan" };

  return {
    title: `Top Up ${gameData.name} Termurah`,
    description: `Beli diamond dan item ${gameData.name} harga paling miring, proses otomatis 1 detik langsung masuk.`,
    keywords: [`top up ${gameData.name}`, `beli diamond ${gameData.name}`, `${gameData.name} murah`, `ryutopup`],
    openGraph: {
      title: `Top Up ${gameData.name} Murah - RyuTopup`,
      description: `Beli diamond dan item ${gameData.name} harga paling miring, proses otomatis 1 detik langsung masuk.`,
      images: [
        {
          url: gameData.cover || "https://ryutopup.com/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `Top Up ${gameData.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Top Up ${gameData.name} Murah - RyuTopup`,
      description: `Beli diamond dan item ${gameData.name} harga paling miring, proses otomatis 1 detik.`,
      images: [gameData.cover || "https://ryutopup.com/og-image.jpg"],
    },
  };
}

export default async function TopupGamePage({ params }: PageProps) {
  const { game } = await params;

  // 1. Fetch Game Data
  const { data: gameData } = await supabaseServer
    .from("games")
    .select("*")
    .eq("slug", game)
    .single();

  if (!gameData || !gameData.is_active) notFound();

  // 2. Fetch Products for this game
  const { data: productsData } = await supabaseServer
    .from("products")
    .select("*")
    .eq("game_id", gameData.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // Map to the shape expected by TopupFormClient
  const mappedData = {
    name: gameData.name,
    developer: gameData.developer,
    banner: gameData.cover,
    logo: gameData.logo,
    fields: typeof gameData.fields === "string" ? JSON.parse(gameData.fields) : gameData.fields,
    items: productsData?.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      originalPrice: Number(p.original_price),
      original_price: Number(p.original_price),
      provider_price: Number(p.provider_price) || 0,
      discount: p.discount,
      icon: p.icon,
      isPass: p.is_pass,
    })) || [],
  };

  return (
    <main className="min-h-screen text-white bg-black">
      <TopupFormClient gameId={game} data={mappedData} />
    </main>
  );
}
