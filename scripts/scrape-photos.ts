/**
 * Scrapes Space Invader photos from invader-spotter.art and stores them
 * in Supabase Storage, then updates the invaders table with image_url.
 *
 * Usage:
 *   npm run scrape:photos
 *
 * URL format confirmed: /grosplan/{CITY}/{CITY}_XXXX-grosplan.png (4-digit zero-padded)
 * Example: https://www.invader-spotter.art/grosplan/PA/PA_0001-grosplan.png
 *
 * Resume: reads/writes .scraper-progress.json to resume after interruption.
 */

import { createClient } from "@supabase/supabase-js";
import { allInvaders, invadersByCity } from "../lib/data/invaders";
import * as fs from "fs";
import * as path from "path";

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY\n" +
    "Add them to .env.local and run: npm run scrape:photos"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BASE_URL = "https://www.invader-spotter.art/grosplan";
const BUCKET = "invader-photos";
const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 300;
const RETRY_DELAY_MS = 5000;
const PROGRESS_FILE = path.join(process.cwd(), ".scraper-progress.json");

// ─── Progress tracking ────────────────────────────────────────────────────────

interface Progress {
  lastProcessedIndex: number;
  found: number;
  notFound: number;
  errors: number;
}

function loadProgress(): Progress {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      const raw = fs.readFileSync(PROGRESS_FILE, "utf-8");
      const p = JSON.parse(raw) as Progress;
      console.log(
        `Resuming from index ${p.lastProcessedIndex} ` +
        `(found: ${p.found}, notFound: ${p.notFound}, errors: ${p.errors})`
      );
      return p;
    } catch {
      console.warn("Could not parse progress file, starting fresh");
    }
  }
  return { lastProcessedIndex: -1, found: 0, notFound: 0, errors: 0 };
}

function saveProgress(p: Progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

// ─── ID formatter ────────────────────────────────────────────────────────────

/**
 * Padding is determined by city invader count:
 *   <  100 invaders → 2-digit: VRS_01
 *   < 1000 invaders → 3-digit: TK_001, NY_001
 *  1000+  invaders → 4-digit: PA_0001
 */
function getPaddingForCity(cityCode: string): number {
  const count = invadersByCity[cityCode]?.length ?? 0;
  if (count >= 1000) return 4;
  if (count >= 100) return 3;
  return 2;
}

function formatInvaderId(id: string): string {
  const [city, num] = id.split("_");
  const padding = getPaddingForCity(city);
  return `${city}_${num.padStart(padding, "0")}`;
}

// ─── Storage setup ───────────────────────────────────────────────────────────

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);

  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5 MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });
    if (error) {
      console.error(`Failed to create bucket "${BUCKET}":`, error.message);
      process.exit(1);
    }
    console.log(`Created bucket "${BUCKET}"`);
  } else {
    console.log(`Bucket "${BUCKET}" already exists`);
  }
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

async function headRequest(url: string): Promise<number> {
  const res = await fetch(url, { method: "HEAD" });
  return res.status;
}

async function getImageBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} returned ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ─── Per-invader processing ───────────────────────────────────────────────────

async function processInvader(
  id: string,
  city: string
): Promise<"found" | "not_found" | "error"> {
  const formattedId = formatInvaderId(id);
  const imageUrl = `${BASE_URL}/${city}/${formattedId}-grosplan.png`;

  let status: number;
  try {
    status = await headRequest(imageUrl);
  } catch {
    return "error";
  }

  // Rate limiting signals
  if (status === 403 || status === 429) {
    console.log(`  Rate limited (${status}) on ${id} — pausing ${RETRY_DELAY_MS}ms`);
    await sleep(RETRY_DELAY_MS);
    try {
      status = await headRequest(imageUrl);
    } catch {
      return "error";
    }
    if (status === 403 || status === 429) {
      console.log("Rate limited — stopping");
      process.exit(1);
    }
  }

  if (status !== 200) {
    return "not_found";
  }

  // Fetch the image
  let buffer: Buffer;
  try {
    buffer = await getImageBuffer(imageUrl);
  } catch (err) {
    // Retry once
    try {
      await sleep(1000);
      buffer = await getImageBuffer(imageUrl);
    } catch {
      console.error(`  Error fetching ${id}: ${(err as Error).message}`);
      return "error";
    }
  }

  // Upload to Supabase Storage
  const storagePath = `${city}/${id}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadError) {
    console.error(`  Upload failed for ${id}: ${uploadError.message}`);
    return "error";
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  const publicUrl = urlData.publicUrl;

  // Update invaders table
  const { error: dbError } = await supabase
    .from("invaders")
    .update({ image_url: publicUrl })
    .eq("id", id);

  if (dbError) {
    console.error(`  DB update failed for ${id}: ${dbError.message}`);
    return "error";
  }

  return "found";
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nSpace Invader photo scraper`);
  console.log(`Total invaders: ${allInvaders.length}\n`);

  await ensureBucket();

  const progress = loadProgress();
  const startIndex = progress.lastProcessedIndex + 1;

  if (startIndex >= allInvaders.length) {
    console.log("All invaders already processed.");
    return;
  }

  const remaining = allInvaders.slice(startIndex);
  let { found, notFound, errors } = progress;
  let processed = startIndex;

  console.log(`Starting at index ${startIndex} (${remaining.length} remaining)\n`);

  for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
    const batch = remaining.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map((inv) => processInvader(inv.id, inv.city))
    );

    for (const result of results) {
      if (result === "found") found++;
      else if (result === "not_found") notFound++;
      else errors++;
    }

    processed += batch.length;
    const globalIndex = startIndex + i + batch.length - 1;

    saveProgress({
      lastProcessedIndex: globalIndex,
      found,
      notFound,
      errors,
    });

    if (processed % 50 < BATCH_SIZE || i + BATCH_SIZE >= remaining.length) {
      console.log(
        `${processed}/${allInvaders.length} — ` +
        `${found} photos found, ${notFound} no image, ${errors} errors`
      );
    }

    if (i + BATCH_SIZE < remaining.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log(`\nDone.`);
  console.log(`  Found:     ${found}`);
  console.log(`  Not found: ${notFound}`);
  console.log(`  Errors:    ${errors}`);
  console.log(`  Total:     ${allInvaders.length}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
