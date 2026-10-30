import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIGMA_FILE_KEY = 'Ff0SksUi7UFtPWUO8kyNtw';
const FIGMA_TOKEN = process.env.FIGMA_TOKEN || '';

async function fetchFigma(endpoint) {
  const res = await fetch(`https://api.figma.com/v1${endpoint}`, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN,
    },
  });
  if (!res.ok) {
    throw new Error(`Figma API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function run() {
  console.log('Fetching Figma file details...');
  const data = await fetchFigma(`/files/${FIGMA_FILE_KEY}?depth=3`);
  
  const outputDir = path.resolve(__dirname, '../public/assets');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save the full file metadata for inspection
  fs.writeFileSync(
    path.resolve(__dirname, 'figma-meta.json'),
    JSON.stringify(data, null, 2)
  );
  console.log('Figma metadata saved to scripts/figma-meta.json');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
