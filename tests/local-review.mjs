import { chromium } from '@playwright/test';
import { loadEnv } from 'vite';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel:'chrome', headless:true });
const env = loadEnv('development', process.cwd(), '');
try {
  const page = await browser.newPage({ viewport:{width:1440,height:1000}, reducedMotion:'reduce' });
  await page.goto('http://127.0.0.1:5173/backend');
  await page.getByLabel('Username',{exact:true}).waitFor();
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({ path:'test-results/backend-login.png',fullPage:true });
  await page.getByLabel('Username',{exact:true}).fill(env.ADMIN_USERNAME);
  await page.getByLabel('Password',{exact:true}).fill(env.ADMIN_PASSWORD);
  await page.getByRole('button',{name:'Enter family dashboard'}).click();
  await page.getByRole('heading',{name:'The family dashboard.'}).waitFor();
  console.log('PASS: configured local credentials sign in at /backend.');
  await page.getByRole('button',{name:'Sign out'}).click();
  for (const width of [320,375,812,1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto('http://127.0.0.1:5173/');
    await page.getByRole('button',{name:'Ahmed Ali'}).waitFor();
    await page.evaluate(()=>document.fonts.ready);
    const overflow=await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(el=>{const r=el.getBoundingClientRect();return r.width && (r.right>innerWidth+1 || r.left< -1);}).map(el=>({tag:el.tagName,class:el.className,width:Math.round(el.getBoundingClientRect().width)})));
    console.log(width,JSON.stringify(overflow));
    if (width===1440) await page.screenshot({path:'test-results/home-desktop.png',fullPage:true});
  }
  await page.getByRole('button',{name:'Ahmed Ali'}).click();
  await page.getByRole('heading',{name:'Ahmed Ali'}).waitFor();
  assert.equal(await page.getByText('Invalid Date',{exact:false}).count(),0);
  console.log('PASS: malformed saved date renders safely.');
} finally { await browser.close(); }
