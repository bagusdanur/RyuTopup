import { supabaseServer } from "@/lib/supabaseServer";
import HomeClient from "@/components/HomeClient";

// Ensure this page is dynamically rendered so it picks up the latest Supabase data
export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch active games from Supabase
  const { data: games, error } = await supabaseServer
    .from("games")
    .select("*")
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching games:", error);
  }

  // Fetch Flash Sales
  const { data: flashSales, error: fsError } = await supabaseServer
    .from("products")
    .select(`
      *,
      games (
        name,
        slug
      )
    `)
    .eq("is_flash_sale", true)
    .eq("is_active", true);

  if (fsError) {
    console.error("Error fetching flash sales:", fsError);
  }

  // Fetch Leaderboard (Top Spenders)
  const { data: topSpenders, error: tsError } = await supabaseServer
    .rpc('get_top_spenders', { limit_count: 5 });

  if (tsError) {
    console.error("Error fetching top spenders:", tsError);
  }

  // Sort games: Mobile Legends first, then alphabetically
  const sortedGames = (games || []).sort((a, b) => {
    const aIsML = a.slug.startsWith("mobile-legends");
    const bIsML = b.slug.startsWith("mobile-legends");
    if (aIsML && !bIsML) return -1;
    if (!aIsML && bIsML) return 1;
    return a.name.localeCompare(b.name);
  });

  // Pass to client component to handle search state and UI
  return <HomeClient initialGames={sortedGames} initialFlashSales={flashSales || []} initialTopSpenders={topSpenders || []} />;
}
