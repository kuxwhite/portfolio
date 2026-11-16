/*
 * Case screenshots were exported from Figma with their own rounded corners and the page/section
 * colour baked in outside them. On the site the card wrapper clips with --radius-visual, which differs
 * from the baked radius (and scales on phones), so a second, mismatched corner showed through.
 * This removes the baked corners: pixels outside the baked arc are filled by extending the image's own
 * edge radially inward, so only the wrapper's radius shapes the card.
 *
 * Usage: node scripts/fix-case-corners.mjs public/assets/cases/home.webp [...]
 */
import fs from "node:fs";
import sharp from "sharp";

async function fix(file) {
  const img = sharp(file);
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const at = (x, y) => (y * W + x) * 4;
  const diff = (i, j) => Math.max(Math.abs(data[i] - data[j]), Math.abs(data[i + 1] - data[j + 1]), Math.abs(data[i + 2] - data[j + 2]));

  // Baked radius: walk the diagonal from the top-left corner until the colour leaves the corner fill.
  let d = 0;
  while (d < Math.min(W, H) / 2 && diff(at(d, d), at(0, 0)) < 12) d++;
  const R = Math.ceil(d / (1 - Math.SQRT1_2)) + 3; // a few px margin for the anti-aliased edge
  if (d === 0 || R > Math.min(W, H) / 2) return console.log(file, "no baked corner found");

  const out = Buffer.from(data);
  const corners = [
    [R, R],
    [W - 1 - R, R],
    [R, H - 1 - R],
    [W - 1 - R, H - 1 - R],
  ];
  for (const [cx, cy] of corners) {
    const x0 = cx < W / 2 ? 0 : cx;
    const y0 = cy < H / 2 ? 0 : cy;
    for (let y = y0; y < y0 + R + 1 && y < H; y++) {
      for (let x = x0; x < x0 + R + 1 && x < W; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if ((cx < W / 2 ? dx > 0 : dx < 0) || (cy < H / 2 ? dy > 0 : dy < 0)) continue;
        const dist = Math.hypot(dx, dy);
        if (dist <= R - 4) continue;
        // Sample the image just inside the baked arc along the same direction.
        const k = (R - 6) / dist;
        const sx = Math.round(cx + dx * k);
        const sy = Math.round(cy + dy * k);
        const s = at(sx, sy);
        const t = at(x, y);
        out[t] = data[s];
        out[t + 1] = data[s + 1];
        out[t + 2] = data[s + 2];
        out[t + 3] = 255;
      }
    }
  }
  await sharp(out, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 92 }).toFile(file + ".tmp");
  fs.renameSync(file + ".tmp", file);
  console.log(file, `baked radius ≈ ${R}px (${W}×${H})`);
}

for (const f of process.argv.slice(2)) await fix(f);
