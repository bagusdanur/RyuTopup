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

  return <GameClient initialGames={games || []} />;
}
