import { createClient } from "@supabase/supabase-js";
import { GAME_DATA } from "./src/lib/gameData";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log("Seeding games and products...");

  for (const [slug, game] of Object.entries(GAME_DATA)) {
    // 1. Insert Game
    const { data: insertedGame, error: gameError } = await supabase
      .from("games")
      .upsert(
        {
          slug,
          name: game.name,
          developer: game.developer,
          logo: game.logo,
          cover: game.cover,
          fields: game.fields,
          is_active: true,
        },
        { onConflict: "slug" }
      )
      .select()
      .single();

    if (gameError || !insertedGame) {
      console.error(`Error inserting game ${slug}:`, gameError);
      continue;
    }

    console.log(`Inserted game: ${game.name} (${insertedGame.id})`);

    // 2. Insert Products
    for (let i = 0; i < game.items.length; i++) {
      const item = game.items[i];
      const isPass = item.name.toLowerCase().includes("pass") || item.name.toLowerCase().includes("starlight");
      
      const { error: productError } = await supabase
        .from("products")
        .insert({
          game_id: insertedGame.id,
          name: item.name,
          price: item.price,
          original_price: item.originalPrice,
          discount: item.discount,
          icon: item.icon,
          is_pass: isPass,
          sort_order: i,
          is_active: true,
        });

      if (productError) {
        console.error(`Error inserting product ${item.name}:`, productError);
      }
    }
    console.log(`Inserted ${game.items.length} products for ${game.name}.`);
  }

  console.log("Seeding complete!");
}

seed();
