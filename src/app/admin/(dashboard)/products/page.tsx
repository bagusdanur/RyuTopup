import { supabaseServer } from "@/lib/supabaseServer";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const { data: games } = await supabaseServer.from("games").select("id, name").order("name");
  const { data: products } = await supabaseServer.from("products").select("*").order("sort_order");

  return <ProductsClient initialGames={games || []} initialProducts={products || []} />;
}
