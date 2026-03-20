import { createClient } from "./client";

/** Sends a magic link to the given email. */
export async function signInWithMagicLink(email: string) {
  const supabase = createClient();
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${location.origin}/auth/callback`,
    },
  });
}

/** Signs in anonymously (creates a temporary session). */
export async function signInAnonymously() {
  const supabase = createClient();
  return supabase.auth.signInAnonymously();
}

/** Signs the current user out. */
export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}

/** Returns the current session (null if not signed in). */
export async function getSession() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session;
}
