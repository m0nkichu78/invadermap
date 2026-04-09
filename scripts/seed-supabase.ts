/**
 * Upserts all invaders from world_space_invaders.json into the Supabase
 * `invaders` table in batches of 500.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... npm run seed:db
 *
 * Or just `npm run seed:db` if .env.local is present (tsx loads it automatically).
 */

import { createClient } from "@supabase/supabase-js";
import { allInvaders } from "../lib/data/invaders";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key to bypass RLS for seeding.
// Get it from: Supabase dashboard → Settings → API → service_role (secret)
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY\n" +
    "   Add SUPABASE_SERVICE_ROLE_KEY to .env.local\n" +
    "   (Supabase dashboard → Settings → API → service_role)"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BATCH_SIZE = 500;

async function seed() {
  console.log(`\n🚀  Seeding ${allInvaders.length} invaders…\n`);

  const rows = allInvaders.map((inv) => ({
    id: inv.id,
    city: inv.city,
    lat: inv.lat,
    lng: inv.lng,
    points: inv.points,
    status: inv.status,
    hint: inv.hint ?? null,
    image_url: null,
  }));

  let inserted = 0;
  const batches = Math.ceil(rows.length / BATCH_SIZE);

  for (let i = 0; i < batches; i++) {
    const batch = rows.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);

    const { error } = await supabase
      .from("invaders")
      .upsert(batch, { onConflict: "id" });

    if (error) {
      console.error(`❌  Batch ${i + 1}/${batches} failed:`, error.message);
      process.exit(1);
    }

    inserted += batch.length;
    const pct = ((inserted / rows.length) * 100).toFixed(0);
    console.log(`   Batch ${i + 1}/${batches} — ${inserted}/${rows.length} rows (${pct}%)`);
  }

  // Verify final count
  const { count, error: countErr } = await supabase
    .from("invaders")
    .select("*", { count: "exact", head: true });

  if (countErr) {
    console.warn("⚠️  Could not verify final count:", countErr.message);
  } else {
    console.log(`\n✅  Done. ${count} invaders in database.\n`);
  }
}

seed().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
