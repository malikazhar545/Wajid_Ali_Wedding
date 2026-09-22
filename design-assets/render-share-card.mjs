import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const browser = await chromium.launch({channel:'chrome', headless:true});
try {
  const page = await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
  await page.route('https://wedding-card.local/**', async route => {
    const path = new URL(route.request().url()).pathname;
    const file = path === '/' ? 'design-assets/share-card.html' : `public${decodeURIComponent(path)}`;
    const type = path === '/' ? 'text/html' : path.endsWith('.css') ? 'text/css' : path.endsWith('.ttf') ? 'font/ttf' : 'image/webp';
    await route.fulfill({body:await readFile(resolve(file)),contentType:type});
  });
  await page.goto('https://wedding-card.local/');
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(image=>image.decode()));});
  await page.screenshot({path:'public/wedding-share-card.png'});
} finally { await browser.close(); }
