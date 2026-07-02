"use client";

import type { User } from "@supabase/supabase-js";

export function useUserProfile(user: User | null) {
  return {
    avatarUrl: user?.user_metadata?.avatar_url || null,
    displayName:
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "Pengguna",
  };
}
