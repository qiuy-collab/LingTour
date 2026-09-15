import * as fs from 'fs/promises';
import * as path from 'path';
import {
  PENDING_CARD_SOURCE,
  SEED_ASSET_SOURCES,
} from './seed-assets';

/** Committed neutral card served when no verified photo of a place exists. */
const PENDING_CARD_FILE = path.join(__dirname, 'assets', 'imagery-pending-card.jpg');

async function downloadOne(targetUrlPath: string, sourceUrl: string) {
  const relativePath = targetUrlPath.replace(/^\/uploads\//, '');
  const outputPath = path.join(process.cwd(), 'uploads', relativePath);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  if (sourceUrl === PENDING_CARD_SOURCE) {
    await fs.copyFile(PENDING_CARD_FILE, outputPath);
    console.log(`Saved ${relativePath} (imagery pending card)`);
    return;
  }

  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to download ${sourceUrl}: ${response.status} ${response.statusText}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(outputPath, Buffer.from(arrayBuffer));
  console.log(`Saved ${relativePath}`);
}

async function main() {
  for (const [targetUrlPath, sourceUrl] of Object.entries(SEED_ASSET_SOURCES)) {
    await downloadOne(targetUrlPath, sourceUrl);
  }
  console.log(
    `Downloaded ${Object.keys(SEED_ASSET_SOURCES).length} seed assets.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
