"use server";

import { createClient } from "@/lib/supabase/server";
import type { ScanStatus } from "@/lib/types/scan";

export async function upsertScan(invaderId: string, scanStatus: ScanStatus) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("user_scans").upsert(
    { user_id: user.id, invader_id: invaderId, scan_status: scanStatus },
    { onConflict: "user_id,invader_id" }
  );

  return { error: error?.message ?? null };
}

export async function deleteScan(invaderId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("user_scans")
    .delete()
    .eq("user_id", user.id)
    .eq("invader_id", invaderId);

  return { error: error?.message ?? null };
}

export async function getUserScans() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { scans: [], error: null };

  const { data, error } = await supabase
    .from("user_scans")
    .select("invader_id, scan_status, scanned_at")
    .eq("user_id", user.id);

  return { scans: data ?? [], error: error?.message ?? null };
}
