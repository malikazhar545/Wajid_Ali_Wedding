import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

// Re-encode the original generated artwork for a lightweight web delivery asset.
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  const original = await readFile('design-assets/royal-garden-source.png');
  const data = await page.evaluate(async base64 => {
    const source = new Image();
    source.src = 'data:image/png;base64,' + base64;
    await source.decode();
    const canvas = document.createElement('canvas');
    canvas.width = source.naturalWidth;
    canvas.height = source.naturalHeight;
    canvas.getContext('2d').drawImage(source, 0, 0);
    return canvas.toDataURL('image/webp', 0.85).split(',')[1];
  }, original.toString('base64'));
  const bytes = Buffer.from(data, 'base64');
  await writeFile('public/royal-garden.webp', bytes);
  console.log(`Artwork ready: ${Math.round(bytes.length / 1024)} KB`);
} finally { await browser.close(); }
