import sharp from "sharp";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const svgPath = resolve(root, "public/favicon.svg");
const svgContent = readFileSync(svgPath);

/**
 * Render the invader SVG centered on a dark background,
 * scaled to `scale` fraction of `size`. Returns a sharp instance.
 */
async function makeIcon(size, scale = 0.6) {
  const invaderSize = Math.round(size * scale);
  // Rasterize SVG at target invader size
  const invaderPng = await sharp(svgContent)
    .resize(invaderSize, invaderSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Compose on dark background
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 7, g: 7, b: 15, alpha: 255 },
    },
  }).composite([
    {
      input: invaderPng,
      gravity: "center",
    },
  ]);
}

/** Apply rounded corners mask to a sharp instance */
async function withRoundedCorners(sharpInstance, size, radius) {
  const mask = Buffer.from(
    `<svg><rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}"/></svg>`
  );
  const png = await sharpInstance.png().toBuffer();
  return sharp(png).composite([{ input: mask, blend: "dest-in" }]);
}

// ── favicon.ico (32x32 PNG, no rounding) ─────────────────────────────────────
// Sharp doesn't support ICO format; output PNG with .ico extension —
// browsers and Next.js both handle it correctly.
{
  const icon = await makeIcon(32);
  await icon.png().toFile(resolve(root, "public/favicon.ico"));
  console.log("✓ favicon.ico");
}

// ── icon-192.png (192x192, r=40) ─────────────────────────────────────────────
{
  const icon = await makeIcon(192);
  const rounded = await withRoundedCorners(icon, 192, 40);
  await rounded.png().toFile(resolve(root, "public/icon-192.png"));
  console.log("✓ icon-192.png");
}

// ── icon-512.png (512x512, r=100) ────────────────────────────────────────────
{
  const icon = await makeIcon(512);
  const rounded = await withRoundedCorners(icon, 512, 100);
  await rounded.png().toFile(resolve(root, "public/icon-512.png"));
  console.log("✓ icon-512.png");
}

// ── apple-touch-icon.png (180x180, r=38) ─────────────────────────────────────
{
  const icon = await makeIcon(180);
  const rounded = await withRoundedCorners(icon, 180, 38);
  await rounded.png().toFile(resolve(root, "public/apple-touch-icon.png"));
  console.log("✓ apple-touch-icon.png");
}

console.log("All icons generated.");
