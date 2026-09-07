import { copyFile, mkdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Run before dev/build, after dependencies and scripts exist (not at Docker's
// manifest-only npm ci stage). Never fetch workers separately from their runtime.
const require = createRequire(import.meta.url);
const packageDirectory = path.dirname(require.resolve("maplibre-gl/package.json"));
const siteDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(packageDirectory, "dist");
const targetDirectory = path.join(siteDirectory, "public", "maplibre");
const copied = new Set();

await mkdir(targetDirectory, { recursive: true });

async function copyModule(filename) {
  if (copied.has(filename)) return;
  if (path.basename(filename) !== filename || !filename.endsWith(".mjs")) {
    throw new Error(`Unexpected MapLibre worker dependency: ${filename}`);
  }
  copied.add(filename);
  const source = path.join(sourceDirectory, filename);
  const content = await readFile(source, "utf8");
  await copyFile(source, path.join(targetDirectory, filename));

  // The installed v6 production worker imports maplibre-gl-shared.mjs. Follow
  // relative imports as well so a future v6 split cannot silently omit a chunk.
  const imports = content.matchAll(/(?:from\s*|import\s*)["'](\.\/[^"']+\.mjs)["']/g);
  for (const match of imports) await copyModule(match[1].slice(2));
}

await copyModule("maplibre-gl-worker.mjs");
await copyFile(path.join(packageDirectory, "LICENSE.txt"), path.join(targetDirectory, "LICENSE.txt"));
console.log(`Copied ${copied.size} MapLibre worker modules and license to public/maplibre.`);
