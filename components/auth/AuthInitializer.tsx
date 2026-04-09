"use client";

import { useEffect } from "react";
import { useUserStore } from "@/lib/store/userStore";

/**
 * Mounts once in the root layout.
 * Loads the user session on boot and re-syncs on every auth state change
 * (sign-in, sign-out, token refresh, etc.).
 */
export function AuthInitializer() {
  const loadUser = useUserStore((s) => s.loadUser);

  useEffect(() => {
    loadUser();

    let subscription: { unsubscribe: () => void } | null = null;

    (async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (["SIGNED_IN", "SIGNED_OUT", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)) {
          loadUser();
        }
      });
      subscription = data.subscription;
    })();

    return () => subscription?.unsubscribe();
  }, [loadUser]);

  return null;
}
