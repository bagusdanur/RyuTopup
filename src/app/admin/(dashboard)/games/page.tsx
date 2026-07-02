import { supabaseServer } from "@/lib/supabaseServer";
import GamesClient from "./GamesClient";

export const dynamic = "force-dynamic";

export default async function AdminGamesPage() {
  const { data: games } = await supabaseServer.from("games").select("*").order("created_at");

  return <GamesClient initialGames={games || []} />;
}
