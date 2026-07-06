import { supabaseServer } from "@/lib/supabaseServer";
import GameClient from "./GameClient";

export const dynamic = "force-dynamic";

export default async function GamePage() {
  const { data: games, error } = await supabaseServer
    .from("games")
    .select("*")
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching games:", error);
  }

  // Sort games: Mobile Legends first, then alphabetically
  const sortedGames = (games || []).sort((a, b) => {
    const aIsML = a.slug.startsWith("mobile-legends");
    const bIsML = b.slug.startsWith("mobile-legends");
    if (aIsML && !bIsML) return -1;
    if (!aIsML && bIsML) return 1;
    return a.name.localeCompare(b.name);
  });

  return <GameClient initialGames={sortedGames} />;
}
