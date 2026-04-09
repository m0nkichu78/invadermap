import rawData from "../data/world_space_invaders.json";
import type { RawInvader } from "../lib/types/invader";
import { normalizeInvader } from "../lib/data/normalize";

const invaders = (rawData as RawInvader[]).map(normalizeInvader);

// ── Coordinates ───────────────────────────────────────────────────────────────
const withCoords = invaders.filter((i) => i.hasLocation);
const withoutCoords = invaders.filter((i) => !i.hasLocation);

// ── Status breakdown ──────────────────────────────────────────────────────────
const byStatus = invaders.reduce(
  (acc, i) => {
    acc[i.status] = (acc[i.status] ?? 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);

// ── Points breakdown ──────────────────────────────────────────────────────────
const byPoints = invaders.reduce(
  (acc, i) => {
    const key = String(i.points);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);

// ── City stats ────────────────────────────────────────────────────────────────
const byCity = invaders.reduce(
  (acc, i) => {
    acc[i.city] = (acc[i.city] ?? 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);
const cityCount = Object.keys(byCity).length;
const largestCities = Object.entries(byCity)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

// ── Helpers ───────────────────────────────────────────────────────────────────
const pct = (n: number, total: number) =>
  `${n} (${((n / total) * 100).toFixed(1)}%)`;

const pad = (s: string | number, w: number) => String(s).padEnd(w);

// ── Output ────────────────────────────────────────────────────────────────────
console.log("\n╔════════════════════════════════════════╗");
console.log("║        world_space_invaders.json       ║");
console.log("╚════════════════════════════════════════╝");

console.log("\n── Totals ───────────────────────────────");
console.log(`  Total invaders   : ${invaders.length}`);
console.log(`  Cities           : ${cityCount}`);
console.log(`  With coordinates : ${pct(withCoords.length, invaders.length)}`);
console.log(`  Without coords   : ${pct(withoutCoords.length, invaders.length)}`);

console.log("\n── Status breakdown ─────────────────────");
Object.entries(byStatus)
  .sort((a, b) => b[1] - a[1])
  .forEach(([status, count]) =>
    console.log(`  ${pad(status, 22)}: ${pct(count, invaders.length)}`)
  );

console.log("\n── Points breakdown ─────────────────────");
Object.entries(byPoints)
  .sort((a, b) => Number(a[0]) - Number(b[0]))
  .forEach(([pts, count]) =>
    console.log(`  ${pad(pts + " pts", 22)}: ${pct(count, invaders.length)}`)
  );

console.log("\n── Top 5 cities by invader count ────────");
largestCities.forEach(([city, count]) =>
  console.log(`  ${pad(city, 22)}: ${count}`)
);

console.log("\n── Sample normalized record ─────────────");
console.log(JSON.stringify(invaders[0], null, 2));
console.log();
