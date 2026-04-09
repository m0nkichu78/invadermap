import { createClient } from "./client";

/** Creates a new user account with email and password. */
export async function signUp(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
}

/** Signs in with email and password. */
export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
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
